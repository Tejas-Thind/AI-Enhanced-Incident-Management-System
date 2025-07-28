class Api::MessagesController < ApplicationController
  def create
    content = params[:content]
    index = params[:index]

    if content.blank? || index.blank?
      render json: { error: 'Content and index are required' }, status: :bad_request
      return
    end

    # Generate suggestion using OpenAI
    suggestion_data = OpenAiService.new.generate_suggestion(content, index.to_i)
    
    if suggestion_data
      # Save suggestion to database
      suggestion = Suggestion.new(
        content: suggestion_data[:content],
        kind: suggestion_data[:kind],
        reasoning: suggestion_data[:reasoning],
        message_index: suggestion_data[:index]
      )

      if suggestion.save
        render json: {
          success: true,
          suggestion: {
            id: suggestion.id,
            content: suggestion.content,
            kind: suggestion.kind,
            reasoning: suggestion.reasoning,
            message_index: suggestion.message_index,
            created_at: suggestion.created_at
          }
        }, status: :created
      else
        render json: { 
          success: false,
          error: 'Failed to save suggestion',
          details: suggestion.errors.full_messages 
        }, status: :unprocessable_entity
      end
    else
      render json: { 
        success: false,
        message: 'No suggestion could be generated from the provided content'
      }, status: :ok
    end
  end
end 