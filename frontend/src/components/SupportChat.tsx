"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { SupportMessage } from "@/types/api";
import { Skeleton } from "./ui/Skeleton";
import { Send, User, Bot, ChevronDown, ChevronUp } from "lucide-react";
import { formatTimestamp } from "@/lib/utils";

export function SupportChat() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [showTechnical, setShowTechnical] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const { data: conversation, isLoading, error } = useQuery({
    queryKey: ["support-conversation"],
    queryFn: () => apiService.getSupportConversation(),
  });

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: SupportMessage = {
      role: "user",
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response (in production, this would call the API)
    setTimeout(() => {
      const aiMessage: SupportMessage = {
        role: "assistant",
        content: "Based on our investigation, your payment failed because the bank is currently experiencing technical difficulties and is unable to process payments at this time. This is a known issue that our team is actively monitoring.",
        timestamp: new Date().toISOString(),
        technical_details: "Root Cause: E5003 - Bank service unavailable\nConfidence: 90%\nRelated Incident: INC100",
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const displayMessages = messages.length > 0 ? messages : (conversation?.data || []);

  return (
    <div className="card h-[600px] flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">Support Assistant</h3>
        <p className="text-sm text-gray-400">AI-powered support for payment issues</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-3/4" />
          </div>
        ) : error ? (
          <div className="text-red-400 text-sm">Failed to load conversation</div>
        ) : displayMessages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p>Start a conversation by typing your question below</p>
          </div>
        ) : (
          displayMessages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-accent-purple text-white"
                    : "bg-background-800 text-gray-300"
                }`}
              >
                <div className="flex items-start gap-2 mb-2">
                  {message.role === "user" ? (
                    <User className="h-4 w-4 mt-0.5" />
                  ) : (
                    <Bot className="h-4 w-4 mt-0.5" />
                  )}
                  <span className="text-xs text-gray-400">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
                <p className="text-sm">{message.content}</p>
                {message.technical_details && (
                  <div className="mt-3 pt-3 border-t border-background-700">
                    <button
                      onClick={() => setShowTechnical(!showTechnical)}
                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      {showTechnical ? (
                        <>
                          <ChevronUp className="h-3 w-3" />
                          Hide Technical Details
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3" />
                          Show Technical Details
                        </>
                      )}
                    </button>
                    {showTechnical && (
                      <pre className="mt-2 text-xs text-gray-400 font-mono bg-background-950 p-2 rounded">
                        {message.technical_details}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-background-800 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your question..."
          className="input flex-1"
        />
        <button
          onClick={handleSend}
          disabled={!inputValue.trim() || isTyping}
          className="btn-primary px-4"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
