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

- Ensure the backend server is running.
- Start the frontend.
- Use the UI to play, pause, and restart the replay.
- Watch messages appear on the left and suggestions update dynamically on the right.
- The backend uses OpenAI to analyze the message for:
  - Action Items
  - Root Cause Signals
  - Metadata Hints
  - Timeline Events
  - Follow-up Tasks (tasks to be done after the incident)

---
