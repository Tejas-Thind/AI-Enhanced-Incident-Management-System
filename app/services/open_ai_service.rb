require 'httparty'
require 'json'

class OpenAiService
  def initialize
    @api_key = ENV['OPENAI_API_KEY']
    @base_url = 'https://api.openai.com/v1/chat/completions'
  end

  def generate_suggestion(content, index)
    return nil unless @api_key

    response = make_api_call(content, index)
    return nil unless response

    parse_response(response, index)
  end

  private

  def make_api_call(content, index)
    headers = {
      'Content-Type' => 'application/json',
      'Authorization' => "Bearer #{@api_key}"
    }

    body = build_request_body(content, index)

    response = HTTParty.post(@base_url, {
      headers: headers,
      body: body,
      timeout: 30
    })

    if response.success?
      JSON.parse(response.body)
    else
      Rails.logger.error "OpenAI API error: #{response.code} - #{response.body}"
      nil
    end
  rescue => e
    Rails.logger.error "OpenAI API call failed: #{e.message}"
    nil
  end

  def build_request_body(content, index)
    {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: system_prompt
        },
        {
          role: 'user',
          content: "Content: #{content}\nIndex: #{index}"
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    }.to_json
  end

  def system_prompt
    <<~PROMPT
      You are an incident management assistant. Analyze the provided content and extract ONE suggestion from the following types:
      
      - action_item: A specific action that needs to be taken
      - timeline_event: A chronological event or milestone
      - root_cause: An underlying cause of the incident
      - metadata: Additional information or context about the incident
      
      If no relevant suggestion can be extracted, return null.
      
      Respond with a JSON object in this exact format:
      {
        "kind": "one_of_the_types_above",
        "content": "the extracted suggestion",
        "reasoning": "why this suggestion was extracted"
      }
    PROMPT
  end

  def parse_response(response, index)
    content = response.dig('choices', 0, 'message', 'content')
    return nil unless content

    begin
      parsed = JSON.parse(content)
      
      # Validate the response structure
      return nil unless parsed.is_a?(Hash) && 
                        parsed['kind'] && 
                        parsed['content'] && 
                        parsed['reasoning']

      {
        kind: parsed['kind'],
        content: parsed['content'],
        reasoning: parsed['reasoning'],
        index: index
      }
    rescue JSON::ParserError
      Rails.logger.error "Failed to parse OpenAI response: #{content}"
      nil
    end
  end
end 