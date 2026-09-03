"use client";

import { useState } from 'react'
import { MessageSquare, Send, Bot, User } from 'lucide-react'
import { supportQuery } from '@/services/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function SupportAssistant() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m the PayLens support assistant. How can I help you today with payment issues?',
      timestamp: new Date()
    }
  ])

  const handleSend = async () => {
    if (!query.trim()) return

    const userMessage: Message = {
      role: 'user',
      content: query,
      timestamp: new Date()
    }

    setMessages([...messages, userMessage])
    setQuery('')
    setLoading(true)

    try {
      const response = await supportQuery(query)
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.customer_explanation || response.data.internal_explanation || 'I apologize, but I couldn\'t process your request at this time.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again or contact human support.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Support Assistant</h2>
        <p className="text-gray-600">
          AI-powered support assistant for customer payment queries and issues.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow flex flex-col" style={{ height: '600px' }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start space-x-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary-600" />
                </div>
              )}
              <div
                className={`max-w-md px-4 py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary-600" />
              </div>
              <div className="bg-gray-100 px-4 py-3 rounded-lg">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !query.trim()}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            'My payment failed',
            'Payment status pending',
            'Refund status',
            'Payment timeout'
          ].map((action) => (
            <button
              key={action}
              onClick={() => setQuery(action)}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
            >
              <MessageSquare className="w-5 h-5 text-primary-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">{action}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}