# Incident Suggestions Assistant API

A Ruby on Rails API backend for an AI-enhanced incident management system that generates intelligent suggestions from incident messages with **in-memory session caching**.

## Features

- **Suggestion Model**: Stores AI-generated suggestions with content, kind, reasoning, and message index
- **OpenAI Integration**: Uses GPT-4o-mini to analyze incident messages and extract suggestions
- **RESTful API**: Provides endpoints for processing messages and retrieving suggestions
- **CORS Support**: Configured for cross-origin requests
- **Session Caching**: In-memory chat context per user (no database required)
- **Real-time Processing**: Direct OpenAI response without database storage
- **Advanced Classification**: Six detailed categories for incident response

## Quick Setup

### Prerequisites

- Ruby 3.4+
- Rails 8.0.2+
- OpenAI API key

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd rails_api
   ```

2. **Install dependencies**

   ```bash
   bundle install
   ```

3. **Run the setup script**

   ```bash
   ruby setup.rb
   ```

   This will:

   - Create a `.env` file from the template
   - Test your OpenAI API key
   - Provide next steps

4. **Configure environment variables**

   Edit the `.env` file and add your OpenAI API key:

   ```
   OPENAI_API_KEY=your_actual_api_key_here
   ```

5. **Start the server**
   ```bash
   rails server
   ```

## API Endpoints

### POST /api/messages

Process a message and generate AI suggestions with session caching.

**Request:**

```json
{
  "content": "The database server went down at 2:30 PM due to high CPU usage",
  "index": 1,
  "user_id": "user123"
}
```

**Response:**

```json
{
  "success": true,
  "suggestion": {
    "content": "Restart the database service and investigate high CPU usage",
    "kind": "action_item",
    "category": "Action_Item",
    "reasoning": "The message indicates an immediate database failure that requires immediate action to restore service",
    "index": 1,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```
  
## Incident Response Categories

The AI now classifies messages into six detailed categories:

- **Action_Item**: An immediate action that should be taken during the incident to mitigate or resolve it
- **Follow_Up**: A task to complete after the incident, such as reviews, documentation, or cleanup
- **Timeline_Event**: An update marking important incident milestones, status changes, or resolutions
- **Root_Cause_Signal**: A hypothesis or indicator pointing to the incident's underlying cause
- **Metadata**: Additional contextual information like affected systems, severity, or incident scope
- **None**: If none of the above categories apply

## Session Caching

The API now includes **in-memory session caching**:

### How It Works

1. **User sends message**: `chat_context << { role: "user", content: user_text }`
2. **Call OpenAI**: With full chat context for better responses
3. **Store response**: `chat_context << { role: "assistant", content: response_content }`
4. **Cache per user**: Each user gets their own session context

### Example Flow

```ruby
# First message from user
chat_context = SessionCacheService.add_message(user_id, 'user', 'Database server is down')
# chat_context now contains: [{ role: 'user', content: 'Database server is down' }]

# Call OpenAI with context
suggestion = OpenAiService.new.generate_suggestion(content, index, chat_context)

# Store assistant response
SessionCacheService.add_message(user_id, 'assistant', 'Generated suggestion: ...')
# chat_context now contains both user and assistant messages
```

### Benefits

- **Context Awareness**: AI gets full conversation history
- **Better Responses**: More coherent suggestions based on previous messages
- **No Database**: Pure in-memory caching for speed
- **Per-User Sessions**: Each user has independent context
- **Easy to Clear**: Reset context when needed

### OpenAiService

Handles communication with OpenAI's API to generate suggestions with chat context.

**Key Features:**

- Uses GPT-4o-mini model
- Accepts chat context for better responses
- Advanced incident response classification
- Structured JSON responses
- Error handling and logging

**Usage:**

```ruby
service = OpenAiService.new
suggestion = service.generate_suggestion("Database server down", 1, chat_context)
```

### SessionCacheService

Manages in-memory chat context per user.

**Key Features:**

- Per-user session storage
- Add user and assistant messages
- Retrieve and clear context
- No database dependency

**Usage:**

```ruby
# Add user message
SessionCacheService.add_message(user_id, 'user', 'Server is down')

# Get context
context = SessionCacheService.get_context(user_id)

# Clear context
SessionCacheService.clear_context(user_id)
```
