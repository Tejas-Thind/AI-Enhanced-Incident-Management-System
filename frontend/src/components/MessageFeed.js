import React, { useEffect, useRef, forwardRef } from "react";
import { User, Clock, AlertTriangle } from "lucide-react";
import clsx from "clsx";

const MessageFeed = forwardRef(
  ({ messages, currentIndex, isPlaying, failedMessages }, ref) => {
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive (only for left panel)
    useEffect(() => {
      if (messages.length > 0) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }, [messages]);

    const getSpeakerColor = (speaker) => {
      const colors = {
        frank: "bg-blue-100 text-blue-800",
        erin: "bg-green-100 text-green-800",
        carol: "bg-purple-100 text-purple-800",
        bob: "bg-orange-100 text-orange-800",
        alice: "bg-pink-100 text-pink-800",
        dan: "bg-indigo-100 text-indigo-800",
      };
      return colors[speaker] || "bg-gray-100 text-gray-800";
    };

    const getSpeakerInitial = (speaker) => {
      return speaker.charAt(0).toUpperCase();
    };

    const formatTime = (index) => {
      // Simulate time progression based on message index
      const baseTime = new Date("2024-01-15T10:00:00");
      const minutes = Math.floor(index / 10); // Roughly 1 minute per 10 messages
      const seconds = (index % 10) * 6; // 6 seconds per message
      const time = new Date(
        baseTime.getTime() + (minutes * 60 + seconds) * 1000
      );
      return time.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    };

    return (
      <div ref={ref} className="h-full overflow-y-auto">
        <div className="space-y-3">
          {messages.map((message, index) => {
            const isFailed = failedMessages.has(index);

            return (
              <div
                key={index}
                data-message-index={index}
                className={clsx(
                  "message-bubble",
                  "transition-all duration-300 ease-out",
                  index === currentIndex - 1 &&
                    isPlaying &&
                    "ring-2 ring-primary-200 bg-primary-50",
                  isFailed && "border-l-4 border-l-red-400 bg-red-50"
                )}
              >
                <div className="flex items-start space-x-3">
                  {/* Speaker avatar */}
                  <div
                    className={clsx(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                      getSpeakerColor(message.speaker)
                    )}
                  >
                    {getSpeakerInitial(message.speaker)}
                  </div>

                  {/* Message content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900 capitalize">
                        {message.speaker}
                      </span>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(index + 1)}</span>
                      </div>
                      {isFailed && (
                        <div className="flex items-center space-x-1 text-xs text-red-600">
                          <AlertTriangle className="h-3 w-3" />
                          <span>No suggestion</span>
                        </div>
                      )}
                    </div>

                    <p
                      className={clsx(
                        "leading-relaxed",
                        isFailed ? "text-gray-600" : "text-gray-700"
                      )}
                    >
                      {message.text}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Current message indicator */}
          {isPlaying && currentIndex < messages.length && (
            <div className="flex items-center space-x-2 text-sm text-gray-500 py-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse-slow" />
              <span>
                Processing message {currentIndex + 1} of {messages.length}...
              </span>
            </div>
          )}

          {/* End of messages marker */}
          <div ref={messagesEndRef} />
        </div>

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <User className="h-12 w-12 mb-4 text-gray-300" />
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm">
              Start the replay to see the incident transcript
            </p>
          </div>
        )}
      </div>
    );
  }
);

MessageFeed.displayName = "MessageFeed";

export default MessageFeed;
