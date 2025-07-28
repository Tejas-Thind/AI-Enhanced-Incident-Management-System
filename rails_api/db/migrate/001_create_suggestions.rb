class CreateSuggestions < ActiveRecord::Migration[8.0]
  def change
    create_table :suggestions do |t|
      t.string :content, null: false
      t.string :kind, null: false
      t.text :reasoning
      t.integer :message_index, null: false

      t.timestamps
    end
    
    add_index :suggestions, :message_index
    add_index :suggestions, :kind
  end
end 