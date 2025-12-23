
# 🚀 Deployment Guide

This project consists of two parts that need to be deployed separately:
1. **Backend**: NestJS application (deployed to Render/Railway)
2. **Frontend**: React application (deployed to Vercel/Netlify)

## 1. Backend Deployment (Render.com)

1. **Push your code to GitHub**.
2. Create a new **Web Service** on [Render](https://render.com/).
3. Connect your repository.
4. **Settings**:
   - **Root Directory**: `langgraph-starbucks-agent`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Environment Variables**:
     - `MONGO_URI`: (Your MongoDB Atlas connection string)
     - `GOOGLE_API_KEY`: (Your Gemini AI API Key)
     - `PORT`: `3000` (or allow Render to set it)
5. **Deploy**.
6. Copy the **Service URL** (e.g., `https://my-backend.onrender.com`).

## 2. Frontend Deployment (Vercel)

1. Create a new **Project** on [Vercel](https://vercel.com/).
2. Connect the same repository.
3. **Settings**:
   - **Root Directory**: `frontend`
   - **Build Command**: `vite build` (or default `npm run build`)
   - **Output Directory**: `dist`
   - **Environment Variables**:
     - `VITE_BACKEND_URL`: **Paste your Backend URL here** (no trailing slash, e.g., `https://my-backend.onrender.com`)
4. **Deploy**.
5. Your app is now live! 🌍

## 3. Database (MongoDB Atlas)

Ensure your **MongoDB Atlas** Network Access allows incoming connections from **Anywhere (0.0.0.0/0)** since cloud providers like Render change IPs dynamically.

---

### Local Testing with Docker (Optional)

You can run the backend container locally:

```bash
cd langgraph-starbucks-agent
docker build -t starbucks-backend .
docker run -p 3000:3000 --env-file .env starbucks-backend
```
