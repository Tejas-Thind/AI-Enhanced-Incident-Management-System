class Api::SuggestionsController < ApplicationController
  def index
    suggestions = Suggestion.ordered_by_index
    
    render json: {
      suggestions: suggestions.map do |suggestion|
        {
          id: suggestion.id,
          content: suggestion.content,
          kind: suggestion.kind,
          reasoning: suggestion.reasoning,
          message_index: suggestion.message_index,
          created_at: suggestion.created_at,
          updated_at: suggestion.updated_at
        }
      end
    }
  end
end 