require 'httparty'
require 'json'

class OpenAiService
  def initialize
    @api_key = ENV['OPENAI_API_KEY']
    @base_url = 'https://api.openai.com/v1/chat/completions'
  end

  def generate_suggestion(content, index, chat_context = [])
    return nil unless @api_key

    # Log context size for debugging
    context_size = chat_context.length
    Rails.logger.info "OpenAI API call - Message #{index}, Context size: #{context_size}"

    response = make_api_call(content, index, chat_context)
    return nil unless response

    parse_response(response, index)
  end

  private

  def make_api_call(content, index, chat_context)
    headers = {
      'Content-Type' => 'application/json',
      'Authorization' => "Bearer #{@api_key}"
    }

    body = build_request_body(content, index, chat_context)

    # Log request details for debugging
    Rails.logger.info "OpenAI API request - Message #{index}, Messages in request: #{body[:messages].length}"

    response = HTTParty.post(@base_url, {
      headers: headers,
      body: body.to_json,
      timeout: 30
    })

    if response.success?
      Rails.logger.info "OpenAI API success - Message #{index}"
      JSON.parse(response.body)
    else
      Rails.logger.error "OpenAI API error - Message #{index}: #{response.code} - #{response.body}"
      nil
    end
  rescue => e
    Rails.logger.error "OpenAI API call failed - Message #{index}: #{e.message}"
    nil
  end

  def build_request_body(content, index, chat_context)
    messages = [
      {
        role: 'system',
        content: system_prompt
      }
    ]

    # Add chat context if available
    chat_context.each do |message|
      messages << {
        role: message[:role],
        content: message[:content]
      }
    end

    # Add current message
    messages << {
      role: 'user',
      content: "Content: #{content}\nIndex: #{index}"
    }

    {
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 500
    }
  end

  def system_prompt
    <<~PROMPT
      You are an AI assistant specialized in real-time incident response support.

      Your task is to analyze the given message and classify it into exactly one of these categories:

      - Action_Item: An immediate action that should be taken during the incident to mitigate or resolve it.
      - Follow_Up: A task to complete after the incident, such as reviews, documentation, or cleanup.
      - Timeline_Event: An update marking important incident milestones, status changes, or resolutions.
      - Root_Cause_Signal: A hypothesis or indicator pointing to the incident's underlying cause.
      - Metadata: Additional contextual information like affected systems, severity, or incident scope.
      - None: If none of the above categories apply.

      Instructions:

      1. Carefully read the message.
      2. Assign exactly one category from the list above.
      3. If none apply, assign category "None".
      4. Respond only with a JSON object in this exact format, with no extra text or explanation:

      {
        "category": "one of the categories above",
        "suggestion": "a concise and clear suggestion, or 'No Suggestion' if none applies",
        "reasoning": "briefly explain why this category and suggestion were chosen"
      }

      Example response:

      {
        "category": "Action_Item",
        "suggestion": "Restart the authentication service to restore login functionality.",
        "reasoning": "The message recommends an immediate fix to resolve login issues."
      }
    PROMPT
  end

  def parse_response(response, index)
    content = response.dig('choices', 0, 'message', 'content')
    
    if content.nil? || content.strip.empty?
      Rails.logger.error "OpenAI API returned empty content - Message #{index}"
      return nil
    end

    begin
      parsed = JSON.parse(content)
      
      # Validate the response structure for the new format
      return nil unless parsed.is_a?(Hash) && 
                        parsed['category'] && 
                        parsed['suggestion'] && 
                        parsed['reasoning']

      Rails.logger.info "OpenAI API parsed successfully - Message #{index}, Category: #{parsed['category']}"

      # Map the new category format to the existing kind format for backward compatibility
      category_to_kind = {
        'Action_Item' => 'action_item',
        'Follow_Up' => 'action_item', # Map to action_item for now
        'Timeline_Event' => 'timeline_event',
        'Root_Cause_Signal' => 'root_cause',
        'Metadata' => 'metadata',
        'None' => 'metadata' # Map to metadata for now
      }

      {
        kind: category_to_kind[parsed['category']] || 'metadata',
        content: parsed['suggestion'],
        reasoning: parsed['reasoning'],
        category: parsed['category'], # Include original category
        index: index
      }
    rescue JSON::ParserError => e
      Rails.logger.error "Failed to parse OpenAI response - Message #{index}: #{content}"
      Rails.logger.error "JSON parse error: #{e.message}"
      nil
    rescue => e
      Rails.logger.error "Unexpected error parsing OpenAI response - Message #{index}: #{e.message}"
      nil
    end
  end
end 