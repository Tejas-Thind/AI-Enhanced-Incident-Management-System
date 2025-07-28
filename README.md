# Incident Suggestions Assistant

This project simulates a real-time incident replay system where each message from a transcript is analyzed by an AI assistant (via OpenAI) to extract actionable suggestions.

---

## 🚀 How to Start the Server

### 1. Backend (Rails)

```bash
cd rails_api  
bundle install  
rails server
```

You’ll also need to add your OpenAI key in a `.env` file at the root of your Rails app `rails_api/`:

OPENAI_API_KEY=your_openai_key_here


Make sure you have `dotenv-rails` in your Gemfile.

---

### 2. Frontend

```bash
cd frontend
npm install
npm start
```


This assumes the Rails server is running on `http://localhost:3000`. You can configure CORS in `config/initializers/cors.rb` if needed.

---

## How to Simulate the Replay

The system simulates real-time incident replay by sequentially processing messages from a transcript. Each message is sent to the backend, which generates AI suggestions based on the content and chat context. The frontend displays messages and categorizes AI suggestions in real time, allowing you to observe how the assistant analyzes the incident step-by-step.

**To simulate a replay:**

- Ensure the backend server is running.
- Start the frontend.
- Use the UI to load a sample transcript or send messages manually.
- Watch messages appear on the left and suggestions update dynamically on the right.

---

## Decisions Made

- **In-memory Session Caching:** Chose to keep chat context in memory per user instead of a database to improve speed and simplify architecture.
- **No Database for Suggestions:** Disabled persistent storage for suggestions to focus on real-time processing and reduce complexity.
- **Categorized Suggestions:** Implemented six detailed categories to help users filter and focus on relevant incident information.
- **Separate Frontend and Backend:** Used Rails API backend and React frontend (Vite/Next.js) for modularity and scalability.
- **OpenAI GPT-4o-mini:** Selected for its balance of speed and response quality in generating incident suggestions.

---

## Future Improvements (If I Had More Time)

- **User-Uploaded JSON Transcripts:** Allow users to upload their own transcript files and manage multiple transcript sessions separately.
- **Database Integration:** Incorporate PostgreSQL to persist messages, suggestions, and user sessions for better data management and historical analysis.
- **Incident AI Chatbot:** Enable an interactive chatbot feature so users can ask questions and receive AI insights based on the full incident context.
- **Timeline Visualization:** Develop a visual timeline component showing key incident events, helping users quickly understand the incident flow and important milestones.

---

## Time Spent

I spent approximately 8 hours developing this project, focusing on building a robust backend API and a responsive, categorized frontend interface to simulate incident replays effectively.
