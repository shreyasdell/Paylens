'use client'

import { useState } from 'react'
import { AlertTriangle, Activity, TrendingUp, Search } from 'lucide-react'
import { investigateIncident, getIncidents } from '@/services/api'

export default function IncidentDashboard() {
  const [incidentId, setIncidentId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleInvestigate = async () => {
    if (!incidentId.trim()) {
      setError('Please enter an incident ID')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await investigateIncident(incidentId)
      setResult(response.data)
    } catch (err) {
      setError('Failed to investigate incident. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Incident Investigation */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Incident Investigation</h2>
        <p className="text-gray-600 mb-4">
          Enter an incident ID to investigate systemic payment issues.
        </p>

        <div className="flex space-x-4">
          <input
            type="text"
            value={incidentId}
            onChange={(e) => setIncidentId(e.target.value)}
            placeholder="Enter incident ID (e.g., INC123)"
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
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Incidents</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Failure Rate</p>
              <p className="text-2xl font-bold text-gray-900">2.3%</p>
            </div>
            <Activity className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Latency</p>
              <p className="text-2xl font-bold text-gray-900">245ms</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">97.7%</p>
            </div>
            <Activity className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Incidents</h3>
        <div className="space-y-3">
          {[
            { id: 'INC291', issuer: 'HDFC', issue: 'Elevated timeout rate', severity: 'HIGH', status: 'Investigating' },
            { id: 'INC290', issuer: 'ICICI', issue: 'Payment processing degradation', severity: 'MEDIUM', status: 'Monitoring' },
            { id: 'INC289', issuer: 'SBI', issue: 'Bank service unavailable', severity: 'HIGH', status: 'Resolved' },
          ].map((incident) => (
            <div key={incident.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{incident.id}</p>
                  <p className="text-sm text-gray-500">{incident.issuer} - {incident.issue}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(incident.severity)}`}>
                  {incident.severity}
                </span>
                <span className="text-sm text-gray-500">{incident.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Investigation Result */}
      {result && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Investigation Results</h3>
          <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}