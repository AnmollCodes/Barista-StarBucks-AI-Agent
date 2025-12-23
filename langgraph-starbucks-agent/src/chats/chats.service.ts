/**
 * @fileoverview This file defines the ChatService, a NestJS injectable service
 * that implements a conversational AI agent for ordering drinks.
 * The agent is built using LangChain's LangGraph framework and interacts with a MongoDB database.
 */

import { Injectable, OnModuleInit } from '@nestjs/common';
import { Runnable } from '@langchain/core/runnables';

import { tool } from '@langchain/core/tools';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { StateGraph } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { Annotation } from '@langchain/langgraph';
import { START, END } from '@langchain/langgraph';

import { MemorySaver } from '@langchain/langgraph';

import z from 'zod';

import { OrderParser, OrderSchema, OrderType } from 'src/lib/schemas/orders';
import { DrinkParser } from 'src/lib/schemas/drinks';
import { DRINKS } from 'src/lib/utils/constants/menu_data';

import {
  createSweetenersSummary,
  availableToppingsSummary,
  createAvailableMilksSummary,
  createSyrupsSummary,
  createSizesSummary,
  createDrinkItemSummary,
} from 'src/lib/summaries';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';

@Injectable()
export class ChatService implements OnModuleInit {
  private runnable: Runnable;
  private memorySaver: MemorySaver;

  constructor() { }

  async onModuleInit() {
    this.memorySaver = new MemorySaver();

    // Define LangGraph state
    const graphState = Annotation.Root({
      messages: Annotation<BaseMessage[]>({
        reducer: (x, y) => [...x, ...y],
      }),
    });

    /**
     * Tool for creating a new order in the database.
     */
    const orderTool = tool(
      async ({ order }: { order: OrderType }) => {
        try {
          // Mock order creation for demo
          console.log('Creating order in memory:', order);
          return 'Order created successfully (Demo Mode)';
        } catch (error) {
          console.log(error);
          return 'Failed to create the order';
        }
      },

      {
        schema: z.object({
          order: OrderSchema.describe(
            'The order that will be stored in the DB',
          ),
        }),
        name: 'create_order',
        description: 'This tool creates a new order in the database',
      },
    );

    const tools = [orderTool];

    const callModel = async (states: typeof graphState.State) => {
      const prompt = ChatPromptTemplate.fromMessages([
        {
          role: 'system',
          content: `
            You are a helpful assistant that helps users order drinks from Starbucks.
            Your job is to take the user's request and fill in any missing details based on how a complete order should look.
            A complete order follows this structure: ${OrderParser}.

            **TOOLS**
            You have access to a "create_order" tool.
            Use this tool when the user confirms the final order.
            After calling the tool, you should inform the user whether the order was successfully created or if it failed.

            **DRINK DETAILS**
            Each drink has its own set of properties such as size, milk, syrup, sweetener, and toppings.
            Here is the drink schema: ${DrinkParser}.

            You must ask for any missing details before creating the order.

            If the user requests a modification that is not supported for the selected drink, tell them that it is not possible.

            If the user asks for something unrelated to drink orders, politely tell them that you can only assist with drink orders.

            **AVAILABLE OPTIONS**
            List of available drinks and their allowed modifications:
            ${DRINKS.map((drink) => `- ${createDrinkItemSummary(drink)}`)}

            Sweeteners: ${createSweetenersSummary()}
            Toppings: ${availableToppingsSummary()}
            Milks: ${createAvailableMilksSummary()}
            Syrups: ${createSyrupsSummary()}
            Sizes: ${createSizesSummary()}

            Order schema: ${OrderParser}

            If the user's query is unclear, tell them that the request is not clear.

            **ORDER CONFIRMATION**
            Once the order is ready, you must ask the user to confirm it.
            If they confirm, immediately call the "create_order" tool.
            Only respond after the tool completes, indicating success or failure.

            **FRONTEND RESPONSE FORMAT**
            Every response must include:

            "message": "Your message to the user",
            "current_order": "The order currently being constructed",
            "suggestions": "Options the user can choose from",
            "progress": "Order status ('completed' after creation)"

            **IMPORTANT RULES**
            - Be friendly, use emojis, and add humor.
            - Use null for unfilled fields.
            - Never omit the JSON tracking object.
        `,
        },
        new MessagesPlaceholder('messages'),
      ]);

      const formattedPrompt = await prompt.formatMessages({
        time: new Date().toISOString(),
        messages: states.messages,
      });

      const chat = new ChatGoogleGenerativeAI({
        model: 'gemini-2.0-flash',
        temperature: 0,
        apiKey: process.env.GOOGLE_API_KEY,
      }).bindTools(tools);

      const result = await chat.invoke(formattedPrompt);
      return { messages: [result] };
    };

    const shouldContinue = (state: typeof graphState.State) => {
      const lastMessage = state.messages[
        state.messages.length - 1
      ] as AIMessage;
      return lastMessage.tool_calls?.length ? 'tools' : END;
    };

    const toolsNode = new ToolNode<typeof graphState.State>(tools);

    const graph = new StateGraph(graphState)
      .addNode('agent', callModel)
      .addNode('tools', toolsNode)
      .addEdge(START, 'agent')
      .addConditionalEdges('agent', shouldContinue)
      .addEdge('tools', 'agent');

    this.runnable = graph.compile({ checkpointer: this.memorySaver });
  }

  /**
   * Main method to chat with the AI agent.
   * Orchestrates the LangGraph state machine to handle user queries,
   * manage conversation state, and interact with the database.
   *
   * @param thread_id A unique identifier for the conversation thread.
   * @param query The user's message.
   * @returns A JSON object containing the AI's response, current order details,
   * suggestions, and progress status.
   */

  chatWithAgent = async ({
    thread_id,
    query,
  }: {
    thread_id: string;
    query: string;
  }) => {
    /**
     * Run the graph using the user's message.
     */
    const finalState = await this.runnable.invoke(
      { messages: [new HumanMessage(query)] },
      { recursionLimit: 15, configurable: { thread_id } },
    );

    /**
     * Extract JSON payload from AI response.
     */
    function extractJsonResponse(response: any) {
      console.log(response);
      const match = response.match(/```json\s*([\s\S]*?)\s*```/i);
      if (match && match[1] && typeof response === 'string') {
        return JSON.parse(match[1].trim());
      }
      throw response;
    }

    const lastMessage = finalState.messages.at(-1) as AIMessage;
    return extractJsonResponse(lastMessage.content);
  };
}



