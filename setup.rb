#!/usr/bin/env ruby

# Setup script for the Incident Suggestions Assistant API
# This script helps users configure the environment and test the API

require 'bundler/setup'
require 'httparty'
require 'json'
require 'fileutils'

class SetupScript
  def initialize
    @env_file = '.env'
    @env_example = 'env.example'
  end

  def run
    puts "=== Incident Suggestions Assistant API Setup ==="
    puts

    # Step 1: Check if .env file exists
    setup_env_file

    # Step 2: Test OpenAI API key
    test_openai_key

    # Step 3: Provide next steps
    provide_next_steps
  end

  private

  def setup_env_file
    puts "Step 1: Environment Configuration"
    
    if File.exist?(@env_file)
      puts "✅ .env file already exists"
    else
      if File.exist?(@env_example)
        puts "📋 Creating .env file from template..."
        FileUtils.cp(@env_example, @env_file)
        puts "✅ .env file created from #{@env_example}"
        puts "⚠️  Please edit .env and add your OpenAI API key"
      else
        puts "❌ #{@env_example} not found"
        create_basic_env_file
      end
    end
    puts
  end

  def create_basic_env_file
    content = <<~ENV
      # OpenAI API Configuration
      # Get your API key from: https://platform.openai.com/api-keys
      OPENAI_API_KEY=your_openai_api_key_here

      # Rails Configuration
      RAILS_ENV=development
      RAILS_MAX_THREADS=5
    ENV

    File.write(@env_file, content)
    puts "✅ Created basic .env file"
    puts "⚠️  Please edit .env and add your OpenAI API key"
  end

  def test_openai_key
    puts "Step 2: OpenAI API Key Test"
    
    # Load environment variables
    load_env_file
    
    api_key = ENV['OPENAI_API_KEY']
    
    if api_key.nil? || api_key == 'your_openai_api_key_here'
      puts "❌ OpenAI API key not configured"
      puts "   Please edit .env and set your OPENAI_API_KEY"
      return false
    end

    puts "🔑 API Key found: #{api_key[0..10]}..."
    
    # Test the API
    if test_openai_connection(api_key)
      puts "✅ OpenAI API connection successful"
      return true
    else
      puts "❌ OpenAI API connection failed"
      puts "   Please check your API key and try again"
      return false
    end
  end

  def load_env_file
    return unless File.exist?(@env_file)
    
    File.readlines(@env_file).each do |line|
      next if line.strip.empty? || line.start_with?('#')
      
      key, value = line.strip.split('=', 2)
      ENV[key] = value if key && value
    end
  end

  def test_openai_connection(api_key)
    headers = {
      'Content-Type' => 'application/json',
      'Authorization' => "Bearer #{api_key}"
    }

    body = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant.'
        },
        {
          role: 'user',
          content: 'Say "Hello"'
        }
      ],
      max_tokens: 10
    }.to_json

    begin
      response = HTTParty.post('https://api.openai.com/v1/chat/completions', {
        headers: headers,
        body: body,
        timeout: 10
      })

      response.success?
    rescue => e
      puts "   Error: #{e.message}"
      false
    end
  end

  def provide_next_steps
    puts
    puts "Step 3: Next Steps"
    puts "=================="
    puts
    puts "1. Database Setup:"
    puts "   - Install PostgreSQL if not already installed"
    puts "   - Run: rails db:create"
    puts "   - Run: rails db:migrate"
    puts
    puts "2. Start the server:"
    puts "   rails server"
    puts
    puts "3. Test the API:"
    puts "   curl -X POST http://localhost:3000/api/messages \\"
    puts "     -H 'Content-Type: application/json' \\"
    puts "     -d '{\"content\": \"Database server down\", \"index\": 1}'"
    puts
    puts "4. View suggestions:"
    puts "   curl http://localhost:3000/api/suggestions"
    puts
    puts "For detailed documentation, see README.md"
  end
end

# Run the setup
if __FILE__ == $0
  setup = SetupScript.new
  setup.run
end 