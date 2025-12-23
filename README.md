# ☕ LangGraph Starbucks AI Agent

A production-grade **Conversational AI Agent** that allows users to order Starbucks drinks through natural, multi-turn conversations.

Built using **NestJS**, **LangChain LangGraph**, **Google Gemini**, and **MongoDB**, this project demonstrates how to design **stateful AI agents with memory, tool execution, and schema-driven reasoning**.

---

## 🧠 Overview

This AI agent behaves like a smart Starbucks barista.  
It understands user intent, asks follow-up questions, validates structured order data, confirms the order, and finally persists it in a database — all while maintaining conversational context across multiple turns.

The system is designed using **LangGraph**, enabling fine-grained control over agent workflows, decision-making, and tool invocation.

---

## 🚀 Key Features

- 🧩 **Conversational AI Agent** for Starbucks drink ordering  
- 📦 **LangGraph-powered state machine** for controlled multi-step conversations  
- 🛠️ **Tool calling** to create and manage orders in a real database  
- 🗄️ **MongoDB persistence** with LangGraph checkpointers for memory  
- ✅ **Zod schema validation** to ensure reliable, structured AI outputs  
- 🔄 **Order confirmation and progress tracking**  
- 😀 **Human-like, friendly responses** with emojis and contextual suggestions  

---

## 🏗️ Architecture Highlights (HR-Ready)

- **Stateful AI Agent Design** using LangGraph annotations and reducers  
- **Schema-driven AI workflows** to prevent hallucinated or malformed outputs  
- **Tool-based execution model** where the LLM triggers real backend actions  
- **Checkpointed memory** allowing conversations to resume seamlessly  
- **Separation of concerns** between AI logic, validation, persistence, and APIs  

This mirrors how modern AI systems are built in production environments.

---

## 📂 Project Structure

src/
├── chats/
│ ├── chats.controller.ts # API endpoints
│ ├── chats.service.ts # Core LangGraph agent logic
│ ├── schemas/ # MongoDB schemas
│
├── lib/
│ ├── schemas/ # Zod schemas (AI-facing)
│ ├── summaries/ # Data → text summarization for LLMs
│ ├── constants/ # Menu data
│
├── app.module.ts # App bootstrap + DB connection
├── main.ts # Server entry point

yaml
Copy code

---

## 🛠️ How It Works

1. User sends a message (e.g., *"I want a latte with oat milk"*)
2. The AI agent checks which order details are missing
3. The agent asks follow-up questions contextually
4. Once all fields are complete, the agent asks for confirmation
5. On confirmation, the **create_order** tool is called
6. Order is validated and saved to MongoDB
7. The response always includes structured JSON for frontend use

---

## ⚙️ Setup & Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/langgraph-starbucks-agent.git
cd langgraph-starbucks-agent
2️⃣ Install Dependencies
bash
Copy code
yarn install
# or (Windows)
npm install
3️⃣ Configure Environment Variables
Create a .env file in the root directory:

env
Copy code
GOOGLE_API_KEY=your_google_api_key
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/starbucks_db
4️⃣ Run the Server
bash
Copy code
yarn start:dev
# or (Windows)
npm run dev
Server runs on:

dts
Copy code
http://localhost:3000
🧪 Example Conversation
User: I want a caramel macchiato
AI: What size would you like? ☕
User: Grande
AI: Would you like any toppings? 🍫
User: Yes, whipped cream
AI: Please confirm your order: Grande Caramel Macchiato with Whipped Cream ✅
User: Yes
AI: Order created successfully 🎉

🗄️ Database Details
Database: drinks_db

Collections:

orders – saved drink orders

langgraph_checkpoints – conversation memory

All orders are validated using Zod schemas before insertion.

🧭 Upcoming Enhancements
1️⃣ Domain Expansion
🏦 Banking Assistant (accounts, cards, loans)

🏥 Hospital Appointment Agent

💼 SaaS Customer Support Agent

2️⃣ RAG Integration
Knowledge-base powered responses using vector search

📜 License
MIT License
