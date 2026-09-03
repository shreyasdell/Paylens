"use client";

import { useState, useEffect } from 'react'
import { Activity, AlertCircle, CheckCircle, TrendingUp, Zap, Shield } from 'lucide-react'
import { getAIOpsHealth, getAIOpsMetrics, detectAnomalies } from '@/services/api'

export default function AIOpsDashboard() {
  const [health, setHealth] = useState<any>(null)
  const [metrics, setMetrics] = useState<any>(null)
  const [anomalies, setAnomalies] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAIOpsData()
  }, [])

  const loadAIOpsData = async () => {
    setLoading(true)
    try {
      const [healthData, metricsData, anomaliesData] = await Promise.all([
        getAIOpsHealth(),
        getAIOpsMetrics(),
        detectAnomalies()
      ])
      setHealth(healthData)
      setMetrics(metricsData)
      setAnomalies(anomaliesData)
    } catch (err) {
      console.error('Failed to load AIOps data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getHealthColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy': return 'text-green-600'
      case 'degraded': return 'text-yellow-600'
      case 'unhealthy': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getAnomalySeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* System Health */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">System Health</h2>
          <button
            onClick={loadAIOpsData}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Refresh
          </button>
        </div>

        {health && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(health.components || {}).map(([component, status]: [string, any]) => (
              <div key={component} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 capitalize">{component}</span>
                  {status === 'operational' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <span className={`text-sm font-medium ${status === 'operational' ? 'text-green-600' : 'text-red-600'}`}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Investigations Today</p>
              <p className="text-2xl font-bold text-gray-900">{metrics?.investigations_today || 0}</p>
            </div>
            <Activity className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Investigation Time</p>
              <p className="text-2xl font-bold text-gray-900">{metrics?.avg_investigation_time || '0s'}</p>
            </div>
            <Zap className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {((metrics?.success_rate || 0) * 100).toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Auto-Resolution Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {((metrics?.auto_resolution_rate || 0) * 100).toFixed(1)}%
              </p>
            </div>
            <Shield className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Detected Anomalies */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detected Anomalies</h3>
        
        {anomalies && anomalies.anomalies_detected > 0 ? (
          <div className="space-y-3">
            {anomalies.anomalies.map((anomaly: any, index: number) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    <span className="font-medium text-gray-900">{anomaly.type}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getAnomalySeverityColor(anomaly.severity)}`}>
                    {anomaly.severity}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Issuer:</span>
                    <span className="ml-2 text-gray-900">{anomaly.issuer}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Confidence:</span>
                    <span className="ml-2 text-gray-900">{(anomaly.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p>No anomalies detected</p>
          </div>
        )}
      </div>

      {/* Performance Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">Performance charts will be displayed here</p>
          <p className="text-sm text-gray-400 mt-2">(Integration with charting library required)</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { action: 'Payment investigation completed', entity: 'PAY_12345', time: '2 minutes ago', status: 'success' },
            { action: 'Incident detected', entity: 'HDFC timeout spike', time: '15 minutes ago', status: 'warning' },
            { action: 'Auto-remediation applied', entity: 'Retry logic activated', time: '1 hour ago', status: 'success' },
            { action: 'Support query resolved', entity: 'Customer #4567', time: '2 hours ago', status: 'success' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === 'success' ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.entity}</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}