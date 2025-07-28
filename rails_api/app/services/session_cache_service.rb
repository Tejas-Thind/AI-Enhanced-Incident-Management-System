class SessionCacheService
  @@cache = {} # Class variable to store session data
  MAX_CONTEXT_MESSAGES = 25 # Limit to prevent token overflow

  def self.store_context(user_id, chat_context)
    @@cache[user_id] = chat_context
  end

  def self.get_context(user_id)
    @@cache[user_id] || []
  end

  def self.add_message(user_id, role, content)
    context = get_context(user_id)
    context << { role: role, content: content }
    
    # Trim context to keep only the most recent messages
    if context.length > MAX_CONTEXT_MESSAGES
      # Keep the most recent messages, but ensure we maintain conversation flow
      # Keep system message if it exists, then the most recent user/assistant pairs
      system_messages = context.select { |msg| msg[:role] == 'system' }
      recent_messages = context.select { |msg| msg[:role] != 'system' }.last(MAX_CONTEXT_MESSAGES - system_messages.length)
      context = system_messages + recent_messages
    end
    
    store_context(user_id, context)
    context
  end

  def self.clear_context(user_id)
    @@cache.delete(user_id)
  end

  def self.get_all_contexts
    @@cache
  end

  # Get context size for debugging
  def self.get_context_size(user_id)
    context = get_context(user_id)
    context.length
  end

  # Get context summary for debugging
  def self.get_context_summary(user_id)
    context = get_context(user_id)
    {
      total_messages: context.length,
      user_messages: context.count { |msg| msg[:role] == 'user' },
      assistant_messages: context.count { |msg| msg[:role] == 'assistant' },
      system_messages: context.count { |msg| msg[:role] == 'system' }
    }
  end
end 