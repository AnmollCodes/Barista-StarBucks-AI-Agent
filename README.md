
# Starbucks Agent Project

This project consists of two parts:
1. **Backend**: A NestJS application powered by LangGraph and Google Gemini.
2. **Frontend**: A React + Vite application providing a premium chat interface.

## parameters

- **Backend Port**: 3000
- **Frontend Port**: 5173

## Prerequisites

- Node.js installed
- MongoDB running (locally or via Atlas)
- `.env` file in `langgraph-starbucks-agent` with `GOOGLE_API_KEY` and `MONGO_URI`.

## How to Run

You will need two terminal windows.

### 1. Start the Backend

```bash
cd langgraph-starbucks-agent
npm install
npm run start:dev
```

Wait until you see "Nest application successfully started".

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open your browser to: [http://localhost:5173/](http://localhost:5173/)

## Features

- **Conversational Ordering**: Chat with the agent to order drinks.
- **Menu Knowledge**: Knows about Starbucks drinks, sizes, milks, and toppings.
- **Order Management**: Creates orders in MongoDB.
- **Premium UI**: Dark mode, animations, and responsive design.
