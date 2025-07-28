class Suggestion < ApplicationRecord
  validates :content, presence: true
  validates :kind, presence: true
  validates :message_index, presence: true, numericality: { only_integer: true }
  
  # Valid suggestion kinds
  KINDS = %w[action_item timeline_event root_cause metadata].freeze
  
  validates :kind, inclusion: { in: KINDS }
  
  scope :ordered_by_index, -> { order(:message_index) }
end 