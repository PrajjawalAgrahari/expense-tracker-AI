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
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 shadow-2xl rounded-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-t-lg">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Expense Tracker Bot</h1>
            <p className="text-blue-100">Your finance assistant</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-opacity-90 bg-white">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.isBot ? "justify-start" : "justify-end"
            } animate-fadeIn`}
          >
            <div className="flex items-start space-x-3 max-w-2xl">
              {/* Avatar for bot messages */}
              {msg.isBot && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center flex-shrink-0 shadow-md">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}

              {/* Message Bubble */}
              <div className="flex flex-col">
                <div
                  className={`p-4 rounded-2xl shadow-md ${
                    msg.isBot
                      ? "bg-white text-gray-800 rounded-bl-md border border-gray-100"
                      : "bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-br-md"
                  }`}
                >
                  <p className="text-base leading-relaxed">{msg.text}</p>
                </div>
                <p
                  className={`text-xs text-gray-500 mt-2 ${
                    msg.isBot ? "text-left" : "text-right"
                  }`}
                >
                  {formatTime(msg.timestamp)}
                </p>
              </div>

              {/* Avatar for user messages */}
              {!msg.isBot && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-600 to-emerald-700 flex items-center justify-center flex-shrink-0 shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3 max-w-2xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center flex-shrink-0 shadow-md">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-bl-md shadow-md border border-gray-100">
                <div className="flex space-x-2">
                  <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce"></div>
                  <div
                    className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce"
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
      <div className="bg-white border-t border-gray-200 p-4 rounded-b-lg">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
