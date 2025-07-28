#!/usr/bin/env ruby

# Test script for the session caching functionality
# This demonstrates how the chat context works

require 'bundler/setup'
require 'httparty'
require 'json'

class SessionTest
  def initialize
    @base_url = 'http://localhost:3000/api'
    @user_id = 'test_user_123'
  end

  def test_session_caching
    puts "=== Testing Session Caching ==="
    puts

    # Test 1: Send first message
    puts "1. Sending first message..."
    response1 = send_message("Database server is down", 1)
    display_response(response1)
    puts

    # Test 2: Send second message (should have context from first)
    puts "2. Sending second message (with context)..."
    response2 = send_message("The CPU usage is at 95%", 2)
    display_response(response2)
    puts

    # Test 3: Check chat context
    puts "3. Checking chat context..."
    context = get_context
    display_context(context)
    puts

    # Test 4: Clear context
    puts "4. Clearing context..."
    clear_context
    puts "Context cleared!"
    puts

    # Test 5: Check empty context
    puts "5. Checking empty context..."
    context = get_context
    display_context(context)
  end

  private

  def send_message(content, index)
    url = "#{@base_url}/messages"
    body = {
      content: content,
      index: index,
      user_id: @user_id
    }

    HTTParty.post(url, {
      headers: { 'Content-Type' => 'application/json' },
      body: body.to_json
    })
  end

  def get_context
    url = "#{@base_url}/messages/context?user_id=#{@user_id}"
    HTTParty.get(url)
  end

  def clear_context
    url = "#{@base_url}/messages/context?user_id=#{@user_id}"
    HTTParty.delete(url)
  end

  def display_response(response)
    if response.success?
      data = JSON.parse(response.body)
      if data['success']
        suggestion = data['suggestion']
        puts "✅ Success!"
        puts "   Content: #{suggestion['content']}"
        puts "   Kind: #{suggestion['kind']}"
        puts "   Reasoning: #{suggestion['reasoning']}"
        puts "   Index: #{suggestion['index']}"
      else
        puts "❌ No suggestion generated"
        puts "   Message: #{data['message']}"
      end
    else
      puts "❌ Error: #{response.code}"
      puts "   Body: #{response.body}"
    end
  end

  def display_context(response)
    if response.success?
      data = JSON.parse(response.body)
      puts "Chat Context for user: #{data['user_id']}"
      puts "Messages in context: #{data['chat_context'].length}"
      
      data['chat_context'].each_with_index do |message, index|
        puts "   #{index + 1}. [#{message['role']}] #{message['content']}"
      end
    else
      puts "❌ Error getting context: #{response.code}"
    end
  end
end

# Run the test
if __FILE__ == $0
  puts "Make sure your Rails server is running on http://localhost:3000"
  puts "Then run: ruby test_session.rb"
  puts
  
  test = SessionTest.new
  test.test_session_caching
end 