"use client";

import { useState, useRef, useEffect, JSX } from "react";
import { useAuth } from "@clerk/nextjs";
import { Send, DollarSign, Bot, User } from "lucide-react";

// Define proper TypeScript interfaces
interface Message {
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ApiResponse {
  reply: string;
}

export default function ChatInterface(): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: 'Hi! I can help track your expenses. Try saying "I spent $25 on lunch today"',
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fix the ref typing issue
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getToken } = useAuth();

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (): Promise<void> => {
    if (!input.trim()) return;

    try {
      const token = await getToken();
      console.log(token);

      // Add user message to chat
      const userMessage = input;
      setMessages((prev) => [
        ...prev,
        {
          text: userMessage,
          isBot: false,
          timestamp: new Date(),
        },
      ]);
      setInput("");
      setIsLoading(true);

      // Send message to API
      console.log(userMessage);
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      // Add bot response to chat
      setMessages((prev) => [
        ...prev,
        {
          text: data.reply,
          isBot: true,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, I had trouble processing your request.",
          isBot: true,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-96 max-w-md mx-auto bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold">Expense Tracker Bot</h1>
            <p className="text-xs text-blue-100">Your finance assistant</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-gray-50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}
          >
            <div className="flex items-start space-x-2 max-w-xs">
              {/* Avatar for bot messages */}
              {msg.isBot && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Message Bubble */}
              <div className="flex flex-col">
                <div
                  className={`p-3 rounded-2xl shadow-sm ${
                    msg.isBot
                      ? "bg-white text-gray-800 rounded-bl-md"
                      : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-md"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
                <p
                  className={`text-xs text-gray-500 mt-1 ${
                    msg.isBot ? "text-left" : "text-right"
                  }`}
                >
                  {formatTime(msg.timestamp)}
                </p>
              </div>

              {/* Avatar for user messages */}
              {!msg.isBot && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                  <User className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2 max-w-xs">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-3 h-3 text-white" />
              </div>
              <div className="bg-white p-3 rounded-2xl rounded-bl-md shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-3 rounded-b-lg">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-10 text-sm"
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              className={`absolute right-1 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                input.trim() && !isLoading
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              disabled={!input.trim() || isLoading}
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
