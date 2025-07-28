# Incident Suggestions Assistant API

A Ruby on Rails API backend for an AI-enhanced incident management system that generates intelligent suggestions from incident messages.

## Features

- **Suggestion Model**: Stores AI-generated suggestions with content, kind, reasoning, and message index
- **OpenAI Integration**: Uses GPT-4o-mini to analyze incident messages and extract suggestions
- **RESTful API**: Provides endpoints for processing messages and retrieving suggestions
- **CORS Support**: Configured for cross-origin requests

## Quick Setup

### Prerequisites

- Ruby 3.4+
- Rails 8.0.2+
- PostgreSQL
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

5. **Database Setup**

   **Note**: This project uses PostgreSQL to avoid SQLite3 compatibility issues on Windows.

   ```bash
   # Install PostgreSQL if not already installed
   # Then run:
   rails db:create
   rails db:migrate
   ```

6. **Start the server**
   ```bash
   rails server
   ```

## API Endpoints

### POST /api/messages

Process a message and generate AI suggestions.

**Request:**

```json
{
  "content": "The database server went down at 2:30 PM due to high CPU usage",
  "index": 1
}
```

**Response:**

```json
{
  "success": true,
  "suggestion": {
    "id": 1,
    "content": "Investigate high CPU usage on database server",
    "kind": "action_item",
    "reasoning": "The message indicates a database server failure due to high CPU usage, which requires immediate investigation",
    "message_index": 1,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### GET /api/suggestions

Retrieve all suggestions ordered by message index.

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

## Suggestion Types

The AI can extract the following types of suggestions:

- **action_item**: A specific action that needs to be taken
- **timeline_event**: A chronological event or milestone
- **root_cause**: An underlying cause of the incident
- **metadata**: Additional information or context about the incident

## Models

### Suggestion

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

**Fields:**

- `content` (string): The extracted suggestion content
- `kind` (string): The type of suggestion (action_item, timeline_event, root_cause, metadata)
- `reasoning` (text): AI's reasoning for extracting this suggestion
- `message_index` (integer): The index of the message that generated this suggestion

## Services

### OpenAiService

Handles communication with OpenAI's API to generate suggestions.

**Key Features:**

- Uses GPT-4o-mini model
- Structured JSON responses
- Error handling and logging
- Configurable system prompts

**Usage:**

```ruby
service = OpenAiService.new
suggestion = service.generate_suggestion("Database server down", 1)
```

## Database Schema

```sql
CREATE TABLE suggestions (
  id SERIAL PRIMARY KEY,
  content VARCHAR NOT NULL,
  kind VARCHAR NOT NULL,
  reasoning TEXT,
  message_index INTEGER NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE INDEX index_suggestions_on_message_index ON suggestions(message_index);
CREATE INDEX index_suggestions_on_kind ON suggestions(kind);
```

## Development

### Running Tests

```bash
rails test
```

### Database Commands

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

## Testing the API

### Using curl

```bash
# Test POST /api/messages
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"content": "Database server down", "index": 1}'

# Test GET /api/suggestions
curl http://localhost:3000/api/suggestions
```

### Using the setup script

```bash
ruby setup.rb
```

## Troubleshooting

### PostgreSQL Issues

If you encounter PostgreSQL connection issues:

1. **Install PostgreSQL**:

   - Windows: Download from https://www.postgresql.org/download/windows/
   - macOS: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql`

2. **Start PostgreSQL service**:

   - Windows: Start from Services
   - macOS: `brew services start postgresql`
   - Linux: `sudo systemctl start postgresql`

3. **Create database user** (if needed):
   ```sql
   CREATE USER postgres WITH PASSWORD 'postgres';
   ALTER USER postgres WITH SUPERUSER;
   ```

### OpenAI API Issues

- Ensure your API key is valid and has sufficient credits
- Check the logs for detailed error messages
- Verify the API key is set in your `.env` file
- Test the connection using the setup script: `ruby setup.rb`

### Database Migration Issues

If migrations fail:

1. **Reset the database**:

   ```bash
   rails db:drop
   rails db:create
   rails db:migrate
   ```

2. **Check PostgreSQL connection**:
   ```bash
   psql -h localhost -U postgres -d incident_management_development
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
