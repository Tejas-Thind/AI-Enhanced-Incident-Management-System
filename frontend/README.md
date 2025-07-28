# Incident Replay Frontend

A polished React frontend for simulating real-time incident replay with AI-generated suggestions. Built with modern React, Tailwind CSS, and Lucide icons.

## 🎨 Features

- **Real-time Message Replay**: Simulates incident transcript at 10x speed
- **AI Suggestions**: Live-updating timeline of AI-generated suggestions
- **Category Classification**: Color-coded suggestions by type (Action_Item, Timeline_Event, etc.)
- **Modern UI**: Rootly-inspired design with clean, enterprise aesthetics
- **Interactive Controls**: Play/pause/reset functionality
- **Responsive Design**: Works on desktop and tablet

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- Rails backend running on `http://localhost:3000`

### Installation

1. **Install dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server**

   ```bash
   npm start
   ```

3. **Open your browser**
   Navigate to `http://localhost:3001`

## 🎯 How It Works

### Incident Replay Engine

The app loads a hardcoded transcript of 100+ messages and replays them over 1 minute:

- **10x Speed**: 10-minute incident compressed to 1 minute
- **Even Distribution**: Messages spread evenly across the timeline
- **Real-time API Calls**: Each message triggers a POST to `/api/messages`
- **Session Context**: Maintains conversation history for better AI responses

### AI Suggestions Timeline

As messages are processed, the AI generates suggestions in real-time:

- **6 Categories**: Action_Item, Timeline_Event, Root_Cause_Signal, Metadata, Follow_Up, None
- **Color Coding**: Each category has distinct colors and icons
- **Context Display**: Shows original message that triggered the suggestion
- **Live Updates**: Suggestions appear as messages are processed

### UI Components

- **MessageFeed**: Left panel showing real-time transcript
- **SuggestionsTimeline**: Right panel with AI suggestions
- **ReplayControls**: Bottom controls for play/pause/reset
- **Header**: Progress indicator and participant count

## 🎨 Design System

### Color Palette

- **Primary**: Blue tones for main UI elements
- **Action Items**: Red for immediate actions
- **Timeline Events**: Blue for milestones
- **Root Cause**: Yellow/Orange for investigation
- **Metadata**: Purple for context
- **Follow Up**: Green for post-incident tasks

### Typography

- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700
- **Clean, readable**: Optimized for scanning

### Animations

- **Fade-in**: New messages and suggestions
- **Slide-in**: Smooth transitions
- **Pulse**: Processing indicators
- **Smooth**: Progress bars and controls

## 📁 Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── IncidentReplay.js      # Main component
│   │   ├── MessageFeed.js         # Left panel
│   │   ├── SuggestionsTimeline.js # Right panel
│   │   └── ReplayControls.js      # Bottom controls
│   ├── data/
│   │   └── incidentTranscript.js  # Hardcoded transcript
│   ├── App.js
│   ├── index.js
│   └── index.css                  # Tailwind + custom styles
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## 🔧 Configuration

### Backend Integration

The frontend is configured to connect to the Rails backend:

- **Proxy**: Configured to proxy API calls to `http://localhost:3000`
- **Endpoints**: Uses `/api/messages` for AI suggestions
- **Session**: Maintains `user_id: 'incident_replay_user'` for context

### Customization

#### Transcript Data

Edit `src/data/incidentTranscript.js` to change the incident transcript:

```javascript
export const incidentTranscript = {
  meeting_transcript: [
    {
      speaker: "username",
      text: "Your message here",
    },
    // ... more messages
  ],
};
```

#### Styling

Modify `tailwind.config.js` to customize colors and animations:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Your custom colors
      },
    },
  },
};
```

## 🎮 Usage

### Basic Controls

1. **Start Replay**: Click the play button to begin
2. **Pause**: Click pause to stop at any point
3. **Reset**: Click reset to start over
4. **Progress**: Watch the suggestions counter

### Understanding the Interface

- **Left Panel**: Live transcript with speaker avatars and timestamps
- **Right Panel**: AI suggestions with category badges and reasoning
- **Header**: Overall suggestions counter and playback controls

### Reading Suggestions

Each suggestion card shows:

- **Category Badge**: Color-coded with icon
- **Suggestion Content**: The AI's recommendation
- **Reasoning**: Why this suggestion was generated
- **Original Message**: Context from the transcript
- **Timestamp**: When it was generated
