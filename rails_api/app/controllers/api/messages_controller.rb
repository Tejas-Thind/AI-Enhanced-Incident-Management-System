class Api::MessagesController < ApplicationController
  def create
    content = params[:content]
    index = params[:index]
    user_id = params[:user_id] || 'default_user' # You can pass user_id from frontend

    if content.blank? || index.blank?
      render json: { error: 'Content and index are required' }, status: :bad_request
      return
    end

    # Add user message to chat context
    chat_context = SessionCacheService.add_message(user_id, 'user', content)

    # Generate suggestion using OpenAI with chat context
    suggestion_data = OpenAiService.new.generate_suggestion(content, index.to_i, chat_context)
    
    if suggestion_data
      # Add assistant response to chat context
      assistant_response = "Generated suggestion: #{suggestion_data[:content]} (Category: #{suggestion_data[:category]})"
      SessionCacheService.add_message(user_id, 'assistant', assistant_response)

      # Return the suggestion directly without saving to database
      render json: {
        success: true,
        suggestion: {
          content: suggestion_data[:content],
          kind: suggestion_data[:kind],
          category: suggestion_data[:category], # New field for better classification
          reasoning: suggestion_data[:reasoning],
          index: suggestion_data[:index],
          timestamp: Time.current.iso8601
        }
      }, status: :ok

      # ===== DATABASE CODE (COMMENTED OUT FOR NOW) =====
      # Uncomment this section when you want to save to database again:
      #
      # suggestion = Suggestion.new(
      #   content: suggestion_data[:content],
      #   kind: suggestion_data[:kind],
      #   reasoning: suggestion_data[:reasoning],
      #   message_index: suggestion_data[:index]
      # )
      #
      # if suggestion.save
      #   render json: {
      #     success: true,
      #     suggestion: {
      #       id: suggestion.id,
      #       content: suggestion.content,
      #       kind: suggestion.kind,
      #       reasoning: suggestion.reasoning,
      #       message_index: suggestion.message_index,
      #       created_at: suggestion.created_at
      #     }
      #   }, status: :created
      # else
      #   render json: { 
      #     success: false,
      #     error: 'Failed to save suggestion',
      #     details: suggestion.errors.full_messages 
      #   }, status: :unprocessable_entity
      # end
      # ===== END DATABASE CODE =====

    else
      # Add assistant response for failed generation
      SessionCacheService.add_message(user_id, 'assistant', 'No suggestion could be generated from the provided content')
      
      render json: { 
        success: false,
        message: 'No suggestion could be generated from the provided content'
      }, status: :ok
    end
  end

  # Optional: Add endpoint to get chat context for debugging
  def context
    user_id = params[:user_id] || 'default_user'
    chat_context = SessionCacheService.get_context(user_id)
    
    render json: {
      user_id: user_id,
      chat_context: chat_context,
      context_size: SessionCacheService.get_context_size(user_id),
      context_summary: SessionCacheService.get_context_summary(user_id)
    }
  end

  # Optional: Add endpoint to clear chat context
  def clear_context
    user_id = params[:user_id] || 'default_user'
    SessionCacheService.clear_context(user_id)
    
    render json: {
      success: true,
      message: "Chat context cleared for user: #{user_id}"
    }
  end

  # Debug endpoint to check context limits
  def debug_context
    user_id = params[:user_id] || 'default_user'
    context = SessionCacheService.get_context(user_id)
    summary = SessionCacheService.get_context_summary(user_id)
    
    render json: {
      user_id: user_id,
      total_messages: context.length,
      summary: summary,
      max_context_messages: SessionCacheService::MAX_CONTEXT_MESSAGES,
      is_at_limit: context.length >= SessionCacheService::MAX_CONTEXT_MESSAGES
    }
  end
end 