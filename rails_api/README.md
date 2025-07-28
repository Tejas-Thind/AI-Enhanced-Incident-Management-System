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

### GET /api/messages/context

Get the chat context for a user (for debugging).

**Request:**

```
GET /api/messages/context?user_id=user123
```

**Response:**

```json
{
  "user_id": "user123",
  "chat_context": [
    {
      "role": "user",
      "content": "Database server is down"
    },
    {
      "role": "assistant",
      "content": "Generated suggestion: Restart the database service (Category: Action_Item)"
    }
  ]
}
```

### DELETE /api/messages/context

Clear the chat context for a user.

**Request:**

```
DELETE /api/messages/context?user_id=user123
```

**Response:**

```json
{
  "success": true,
  "message": "Chat context cleared for user: user123"
}
```

### GET /api/suggestions

Retrieve all suggestions from database (if using database storage).

**Response:**

```json
{
  "suggestions": [
    {
      "id": 1,
      "content": "Investigate high CPU usage on database server",
      "kind": "action_item",
      "reasoning": "The message indicates a database server failure due to high CPU usage",
      "message_index": 1,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
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

The API now includes **in-memory session caching** that works like your friend's implementation:

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

## Models

### Suggestion (Database Model - Currently Disabled)

```ruby
class Suggestion < ApplicationRecord
  validates :content, presence: true
  validates :kind, presence: true
  validates :message_index, presence: true, numericality: { only_integer: true }

  KINDS = %w[action_item timeline_event root_cause metadata].freeze
  validates :kind, inclusion: { in: KINDS }

  scope :ordered_by_index, -> { order(:message_index) }
end
```

**Note**: Database operations are currently commented out. To re-enable:

1. Uncomment the database code in `MessagesController#create`
2. Run `rails db:create` and `rails db:migrate`

## Services

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

## Testing

### Using curl

```bash
# Test POST /api/messages with session caching
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"content": "Database server down", "index": 1, "user_id": "user123"}'

# Get chat context
curl "http://localhost:3000/api/messages/context?user_id=user123"

# Clear chat context
curl -X DELETE "http://localhost:3000/api/messages/context?user_id=user123"
```

### Using the test script

```bash
ruby test_session.rb
```

## Development

### Running Tests

```bash
rails test
```

### Database Commands (if using database)

```bash
rails db:create    # Create database
rails db:migrate   # Run migrations
rails db:seed      # Seed data
rails db:reset     # Reset database
```

### Routes

```bash
rails routes
```

### Setup Script

```bash
ruby setup.rb      # Interactive setup and testing
```

## Troubleshooting

### OpenAI API Issues

- Ensure your API key is valid and has sufficient credits
- Check the logs for detailed error messages
- Verify the API key is set in your `.env` file
- Test the connection using the setup script: `ruby setup.rb`

### Session Caching Issues

- **Context not persisting**: Check that you're using the same `user_id`
- **Memory usage**: Context is stored in memory, restart server to clear all
- **Multiple users**: Each `user_id` gets independent context

### Database Migration Issues

If you decide to re-enable database storage:

1. **Reset the database**:

   ```bash
   rails db:drop
   rails db:create
   rails db:migrate
   ```

2. **Uncomment database code** in `MessagesController#create`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
