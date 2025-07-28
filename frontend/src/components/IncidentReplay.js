import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  Users,
  MessageSquare,
  X,
} from "lucide-react";
import { incidentTranscript } from "../data/incidentTranscript";
import MessageFeed from "./MessageFeed";
import SuggestionsTimeline from "./SuggestionsTimeline";
import clsx from "clsx";

const IncidentReplay = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [replayProgress, setReplayProgress] = useState(0);
  const [error, setError] = useState(null);
  const [failedMessages, setFailedMessages] = useState(new Set());
  const [toast, setToast] = useState(null);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const messageFeedRef = useRef(null);

  const messages = incidentTranscript.meeting_transcript;
  const totalMessages = messages.length;
  const replayDuration = 60000; // 1 minute in milliseconds
  const messageInterval = replayDuration / totalMessages;

  // Calculate replay progress based on actual message count
  useEffect(() => {
    if (isPlaying) {
      const progress = (currentMessageIndex / totalMessages) * 100;
      setReplayProgress(Math.min(progress, 100));
    }
  }, [currentMessageIndex, totalMessages, isPlaying]);

  // Handle message replay - decoupled from AI suggestions
  useEffect(() => {
    if (!isPlaying) return;

    const handleMessage = async (index) => {
      if (index >= totalMessages) {
        setIsPlaying(false);
        return;
      }

      const message = messages[index];

      // Show message immediately without waiting for AI response
      setCurrentMessageIndex(index + 1);

      // Send message to backend for AI analysis (asynchronous)
      try {
        const response = await fetch("/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: message.text,
            index: index + 1,
            user_id: "incident_replay_user",
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.suggestion) {
            const newSuggestion = {
              ...data.suggestion,
              originalMessage: message,
              originalMessageIndex: index, // Store index for scrolling
              timestamp: new Date().toISOString(),
            };
            setSuggestions((prev) => [...prev, newSuggestion]);

            // Clear any previous error for this message
            setFailedMessages((prev) => {
              const newSet = new Set(prev);
              newSet.delete(index);
              return newSet;
            });
          } else {
            // Handle case where API returns success: false
            console.warn(`No suggestion generated for message ${index + 1}`);
            setFailedMessages((prev) => new Set([...prev, index]));

            // Show toast notification for failed suggestion
            showToast(
              `Message ${index + 1} failed to generate suggestion`,
              "warning"
            );
          }
        } else {
          // Handle HTTP errors
          console.error(
            `API error for message ${index + 1}: ${response.status}`
          );
          setFailedMessages((prev) => new Set([...prev, index]));

          // Set error message for user feedback
          if (response.status === 500) {
            setError(
              "Backend server error. Check if the Rails server is running."
            );
          } else if (response.status === 401) {
            setError("OpenAI API key error. Check your API key configuration.");
          } else {
            setError(
              `API error: ${response.status}. Suggestions may not be generated.`
            );
          }

          showToast(`API error for message ${index + 1}`, "error");
        }
      } catch (err) {
        console.error(`Network error for message ${index + 1}:`, err);
        setFailedMessages((prev) => new Set([...prev, index]));
        setError(
          "Network error. Check your connection and ensure the backend is running."
        );
        showToast(`Network error for message ${index + 1}`, "error");
      }
    };

    // Schedule next message
    intervalRef.current = setTimeout(() => {
      handleMessage(currentMessageIndex);
    }, messageInterval);

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [
    isPlaying,
    currentMessageIndex,
    messages,
    totalMessages,
    messageInterval,
  ]);

  const showToast = (message, type = "info") => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const startReplay = () => {
    setIsPlaying(true);
    startTimeRef.current = Date.now();
    setReplayProgress(0);
    setError(null); // Clear previous errors
    setFailedMessages(new Set()); // Reset failed messages
  };

  const pauseReplay = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }
  };

  const resetReplay = () => {
    setIsPlaying(false);
    setCurrentMessageIndex(0);
    setSuggestions([]);
    setReplayProgress(0);
    setError(null);
    setFailedMessages(new Set());
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate elapsed time based on message progress
  const elapsedSeconds = Math.floor((currentMessageIndex / totalMessages) * 60);
  const totalSeconds = 60;

  // Function to scroll to a specific message
  const scrollToMessage = (messageIndex) => {
    if (messageFeedRef.current) {
      const messageElement = messageFeedRef.current.querySelector(
        `[data-message-index="${messageIndex}"]`
      );
      if (messageElement) {
        messageElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        // Add highlight effect
        messageElement.classList.add(
          "ring-2",
          "ring-primary-300",
          "bg-primary-50"
        );
        setTimeout(() => {
          messageElement.classList.remove(
            "ring-2",
            "ring-primary-300",
            "bg-primary-50"
          );
        }, 2000);
      }
    }
  };

  // Calculate success rate
  const successRate =
    suggestions.length > 0
      ? Math.round((suggestions.length / currentMessageIndex) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Title and participants */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-6 w-6 text-primary-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Incident Suggestions Assistant
              </h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>6 participants</span>
            </div>
          </div>

          {/* Center - Progress info */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>
                {formatTime(elapsedSeconds)} / {formatTime(totalSeconds)}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Messages:</span>
              <span className="font-medium">
                {currentMessageIndex} / {totalMessages}
              </span>
            </div>

            {currentMessageIndex > 0 && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-600">Suggestions:</span>
                <span
                  className={
                    successRate >= 80
                      ? "text-green-600"
                      : successRate >= 60
                      ? "text-yellow-600"
                      : "text-red-600"
                  }
                >
                  {suggestions.length}
                </span>
              </div>
            )}
          </div>

          {/* Right side - Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={isPlaying ? pauseReplay : startReplay}
              className={clsx(
                "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200",
                isPlaying
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-primary-600 hover:bg-primary-700 text-white"
              )}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </button>

            <button
              onClick={resetReplay}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors duration-200"
              title="Reset"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left side - Message Feed */}
        <div className="flex-1 border-r border-gray-200 bg-white">
          <div className="p-6 h-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Live Transcript
            </h2>
            <MessageFeed
              ref={messageFeedRef}
              messages={messages.slice(0, currentMessageIndex)}
              currentIndex={currentMessageIndex}
              isPlaying={isPlaying}
              failedMessages={failedMessages}
            />
          </div>
        </div>

        {/* Right side - Suggestions Timeline */}
        <div className="flex-1 bg-gray-50">
          <div className="p-6 h-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              AI Suggestions
            </h2>
            <SuggestionsTimeline
              suggestions={suggestions}
              onViewMessage={scrollToMessage}
              isProcessing={isPlaying}
            />
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={clsx(
              "flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg border max-w-md",
              toast.type === "error"
                ? "bg-red-50 border-red-200 text-red-700"
                : toast.type === "warning"
                ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                : "bg-blue-50 border-blue-200 text-blue-700"
            )}
          >
            <div className="flex-1">
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="fixed top-4 left-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse-slow" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentReplay;
