#!/usr/bin/env ruby

# Test script for context management and OpenAI API calls
# This demonstrates that suggestions continue beyond 9 messages

require 'bundler/setup'
require 'httparty'
require 'json'

class ContextManagementTest
  def initialize
    @base_url = 'http://localhost:3000/api'
    @user_id = 'test_context_user'
  end

  def test_context_management
    puts "=== Testing Context Management ==="
    puts

    # Clear any existing context
    clear_context
    puts "✅ Context cleared"
    puts

    # Test 1: Send first few messages
    puts "1. Sending first 5 messages..."
    5.times do |i|
      response = send_message("Test message #{i + 1}", i + 1)
      display_response(response, i + 1)
      sleep(0.5) # Small delay to simulate real usage
    end
    puts

    # Test 2: Check context size
    puts "2. Checking context size..."
    context_info = get_debug_context
    display_context_info(context_info)
    puts

    # Test 3: Send more messages to test context trimming
    puts "3. Sending 25 more messages to test context trimming..."
    25.times do |i|
      response = send_message("Additional test message #{i + 6}", i + 6)
      display_response(response, i + 6)
      
      # Check context size every 5 messages
      if (i + 6) % 5 == 0
        context_info = get_debug_context
        puts "   Context size at message #{i + 6}: #{context_info['total_messages']}"
      end
      
      sleep(0.3) # Faster for testing
    end
    puts

    # Test 4: Final context check
    puts "4. Final context check..."
    context_info = get_debug_context
    display_context_info(context_info)
    puts

    # Test 5: Verify suggestions are still working
    puts "5. Testing final suggestions..."
    response = send_message("Final test message", 31)
    display_response(response, 31)
    puts

    puts "=== Test Complete ==="
    puts "If you see suggestions for all messages, context management is working!"
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

  def get_debug_context
    url = "#{@base_url}/messages/debug_context?user_id=#{@user_id}"
    response = HTTParty.get(url)
    JSON.parse(response.body)
  end

  def clear_context
    url = "#{@base_url}/messages/context?user_id=#{@user_id}"
    HTTParty.delete(url)
  end

  def display_response(response, message_index)
    if response.success?
      data = JSON.parse(response.body)
      if data['success']
        suggestion = data['suggestion']
        puts "   ✅ Message #{message_index}: #{suggestion['category']} - #{suggestion['content'][0..50]}..."
      else
        puts "   ❌ Message #{message_index}: No suggestion generated"
      end
    else
      puts "   ❌ Message #{message_index}: Error #{response.code}"
    end
  end

  def display_context_info(context_info)
    puts "   Context Summary:"
    puts "     Total messages: #{context_info['total_messages']}"
    puts "     User messages: #{context_info['summary']['user_messages']}"
    puts "     Assistant messages: #{context_info['summary']['assistant_messages']}"
    puts "     Max allowed: #{context_info['max_context_messages']}"
    puts "     At limit: #{context_info['is_at_limit']}"
  end
end

# Run the test
if __FILE__ == $0
  puts "Make sure your Rails server is running on http://localhost:3000"
  puts "Then run: ruby test_context_management.rb"
  puts

  test = ContextManagementTest.new
  test.test_context_management
end 