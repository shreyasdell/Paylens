"use client";

import { useState } from 'react'
import { Search, AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react'
import { investigatePayment } from '@/services/api'

interface InvestigationResult {
  root_cause?: {
    category: string
    description: string
    confidence: number
    evidence_summary: string[]
  }
  confidence: number
  recommendation?: {
    action: string
    priority: string
    steps: string[]
  }
  customer_explanation?: string
  internal_explanation?: string
  requires_human_review: boolean
  status: string
}

export default function PaymentInvestigation() {
  const [paymentId, setPaymentId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<InvestigationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleInvestigate = async () => {
    if (!paymentId.trim()) {
      setError('Please enter a payment ID')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await investigatePayment(paymentId)
      setResult(response.data)
    } catch (err) {
      setError('Failed to investigate payment. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600'
    if (confidence >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Investigation</h2>
        <p className="text-gray-600 mb-4">
          Enter a payment ID to investigate the root cause of payment failures.
        </p>

        <div className="flex space-x-4">
          <input
            type="text"
            value={paymentId}
            onChange={(e) => setPaymentId(e.target.value)}
            placeholder="Enter payment ID (e.g., PAY_12345)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleInvestigate()}
          />
          <button
            onClick={handleInvestigate}
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Investigating...' : 'Investigate'}</span>
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}
      </div>

      {result && (
        <div className="space-y-4">
          {/* Status Badge */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Investigation Status</h3>
              <div className="flex items-center space-x-2">
                {result.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Clock className="w-5 h-5 text-yellow-600" />
                )}
                <span className={`capitalize ${result.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {result.status}
                </span>
              </div>
            </div>

            {result.requires_human_review && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-800">This case requires human review before taking action.</span>
              </div>
            )}
          </div>

          {/* Root Cause */}
          {result.root_cause && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Root Cause Analysis</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500">Category</span>
                  <p className="text-lg font-medium text-gray-900">{result.root_cause.category}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Description</span>
                  <p className="text-gray-900">{result.root_cause.description}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Confidence</span>
                  <p className={`text-2xl font-bold ${getConfidenceColor(result.root_cause.confidence)}`}>
                    {result.root_cause.confidence.toFixed(1)}%
                  </p>
                </div>
                {result.root_cause.evidence_summary.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-500">Evidence</span>
                    <ul className="mt-2 space-y-1">
                      {result.root_cause.evidence_summary.map((evidence, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                          <span className="text-gray-700">{evidence}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recommendation */}
          {result.recommendation && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendation</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(result.recommendation.priority)}`}>
                    {result.recommendation.priority.toUpperCase()}
                  </span>
                  <span className="text-gray-900 font-medium">{result.recommendation.action}</span>
                </div>
                {result.recommendation.steps.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-500">Steps</span>
                    <ol className="mt-2 space-y-2">
                      {result.recommendation.steps.map((step, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <span className="text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Customer Explanation */}
          {result.customer_explanation && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Explanation</h3>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-gray-900">{result.customer_explanation}</p>
              </div>
            </div>
          )}

          {/* Internal Explanation */}
          {result.internal_explanation && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Internal Technical Explanation</h3>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <pre className="text-sm text-gray-900 whitespace-pre-wrap font-sans">
                  {result.internal_explanation}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}