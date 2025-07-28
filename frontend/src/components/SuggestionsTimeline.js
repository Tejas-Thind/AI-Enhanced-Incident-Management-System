import React, { useState } from "react";
import {
  AlertTriangle,
  Clock,
  Search,
  Info,
  CheckCircle,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Eye,
} from "lucide-react";
import clsx from "clsx";

const SuggestionsTimeline = ({
  suggestions,
  onViewMessage,
  isProcessing = false,
}) => {
  const [expandedCategories, setExpandedCategories] = useState(
    new Set(["Action_Item", "Timeline_Event"])
  ); // Default expanded

  const getCategoryConfig = (category) => {
    const configs = {
      Action_Item: {
        icon: AlertTriangle,
        color: "action",
        label: "Action Items",
        description: "Immediate actions required",
        emoji: "🛠",
      },
      Timeline_Event: {
        icon: Clock,
        color: "timeline",
        label: "Timeline Events",
        description: "Important milestones and updates",
        emoji: "⏰",
      },
      Root_Cause_Signal: {
        icon: Search,
        color: "rootcause",
        label: "Root Cause Signals",
        description: "Potential underlying causes",
        emoji: "🔍",
      },
      Metadata: {
        icon: Info,
        color: "metadata",
        label: "Metadata",
        description: "Contextual information",
        emoji: "📊",
      },
      Follow_Up: {
        icon: CheckCircle,
        color: "followup",
        label: "Follow Up Tasks",
        description: "Post-incident tasks",
        emoji: "✅",
      },
      None: {
        icon: MessageSquare,
        color: "gray",
        label: "No Suggestions",
        description: "No actionable items found",
        emoji: "💬",
      },
    };
    return configs[category] || configs["None"];
  };

  const getCategoryStyles = (color) => {
    const styles = {
      action: {
        bg: "bg-action-50",
        border: "border-action-200",
        text: "text-action-700",
        icon: "text-action-600",
        badge: "bg-action-100 text-action-800",
        header: "bg-action-100 border-action-200",
      },
      timeline: {
        bg: "bg-timeline-50",
        border: "border-timeline-200",
        text: "text-timeline-700",
        icon: "text-timeline-600",
        badge: "bg-timeline-100 text-timeline-800",
        header: "bg-timeline-100 border-timeline-200",
      },
      rootcause: {
        bg: "bg-rootcause-50",
        border: "border-rootcause-200",
        text: "text-rootcause-700",
        icon: "text-rootcause-600",
        badge: "bg-rootcause-100 text-rootcause-800",
        header: "bg-rootcause-100 border-rootcause-200",
      },
      metadata: {
        bg: "bg-metadata-50",
        border: "border-metadata-200",
        text: "text-metadata-700",
        icon: "text-metadata-600",
        badge: "bg-metadata-100 text-metadata-800",
        header: "bg-metadata-100 border-metadata-200",
      },
      followup: {
        bg: "bg-followup-50",
        border: "border-followup-200",
        text: "text-followup-700",
        icon: "text-followup-600",
        badge: "bg-followup-100 text-followup-800",
        header: "bg-followup-100 border-followup-200",
      },
      gray: {
        bg: "bg-gray-50",
        border: "border-gray-200",
        text: "text-gray-700",
        icon: "text-gray-600",
        badge: "bg-gray-100 text-gray-800",
        header: "bg-gray-100 border-gray-200",
      },
    };
    return styles[color] || styles.gray;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  // Group suggestions by category
  const groupedSuggestions = suggestions.reduce((acc, suggestion) => {
    const category = suggestion.category || "None";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(suggestion);
    return acc;
  }, {});

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const handleViewMessage = (messageIndex) => {
    if (onViewMessage) {
      onViewMessage(messageIndex);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-4">
        {Object.entries(groupedSuggestions).map(
          ([category, categorySuggestions]) => {
            const config = getCategoryConfig(category);
            const styles = getCategoryStyles(config.color);
            const IconComponent = config.icon;
            const isExpanded = expandedCategories.has(category);

            return (
              <div
                key={category}
                className={clsx(
                  "rounded-lg border overflow-hidden",
                  styles.border
                )}
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className={clsx(
                    "w-full px-4 py-3 flex items-center justify-between",
                    "hover:bg-opacity-80 transition-colors duration-200",
                    styles.header
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{config.emoji}</span>
                    <div className="flex items-center space-x-2">
                      <IconComponent className="h-4 w-4" />
                      <span className="font-medium">{config.label}</span>
                      <span
                        className={clsx(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          styles.badge
                        )}
                      >
                        {categorySuggestions.length}
                      </span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>

                {/* Category Content */}
                {isExpanded && (
                  <div className={clsx("p-4 space-y-3", styles.bg)}>
                    {categorySuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className={clsx(
                          "bg-white rounded-lg p-4 border border-gray-200",
                          "hover:shadow-sm transition-shadow duration-200"
                        )}
                      >
                        {/* Suggestion header with timestamp and view button */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>#{suggestion.index}</span>
                            <span>•</span>
                            <span>{formatTimestamp(suggestion.timestamp)}</span>
                          </div>
                          <button
                            onClick={() =>
                              handleViewMessage(suggestion.originalMessageIndex)
                            }
                            className="flex items-center space-x-1 text-xs text-primary-600 hover:text-primary-700 transition-colors duration-200"
                          >
                            <Eye className="h-3 w-3" />
                            <span>View Message</span>
                          </button>
                        </div>

                        {/* Suggestion content */}
                        <div className="mb-3">
                          <h3 className={clsx("font-medium mb-2", styles.text)}>
                            {suggestion.content}
                          </h3>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {suggestion.reasoning}
                          </p>
                        </div>

                        {/* Category description */}
                        <div className="pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500">
                            {config.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }
        )}

        {/* Empty state */}
        {suggestions.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Search className="h-12 w-12 mb-4 text-gray-300" />
            <p className="text-lg font-medium">No suggestions yet</p>
            <p className="text-sm">
              AI suggestions will appear here as messages are processed
            </p>
          </div>
        )}

        {/* Processing indicator - only show when actively processing */}
        {isProcessing && suggestions.length > 0 && (
          <div className="text-center py-4">
            <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse-slow" />
              <span>Processing messages...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestionsTimeline;
