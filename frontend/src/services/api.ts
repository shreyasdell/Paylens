import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Payment Investigation APIs
export const investigatePayment = async (paymentId: string) => {
  const response = await api.post('/api/v1/investigate/payment', null, {
    params: { payment_id: paymentId }
  })
  return response.data
}

export const getPaymentInvestigation = async (paymentId: string) => {
  const response = await api.get(`/api/v1/investigate/payment/${paymentId}`)
  return response.data
}

// Incident Investigation APIs
export const investigateIncident = async (incidentId: string) => {
  const response = await api.post('/api/v1/investigate/incident', null, {
    params: { incident_id: incidentId }
  })
  return response.data
}

export const getIncidentInvestigation = async (incidentId: string) => {
  const response = await api.get(`/api/v1/investigate/incident/${incidentId}`)
  return response.data
}

// Support Assistant APIs
export const supportQuery = async (query: string) => {
  const response = await api.post('/api/v1/support/query', { query })
  return response.data
}

// Data Management APIs
export const getTransactions = async (limit = 50, offset = 0) => {
  const response = await api.get('/api/v1/transactions', {
    params: { limit, offset }
  })
  return response.data
}

export const getLogs = async (limit = 50, offset = 0) => {
  const response = await api.get('/api/v1/logs', {
    params: { limit, offset }
  })
  return response.data
}

export const getMetrics = async (issuer?: string, hours = 24) => {
  const response = await api.get('/api/v1/metrics', {
    params: { issuer, hours }
  })
  return response.data
}

export const getIncidents = async (status?: string, severity?: string, limit = 50) => {
  const response = await api.get('/api/v1/incidents', {
    params: { status, severity, limit }
  })
  return response.data
}

// AIOps APIs
export const getAIOpsHealth = async () => {
  const response = await api.get('/api/v1/aiops/health')
  return response.data
}

export const getAIOpsMetrics = async () => {
  const response = await api.get('/api/v1/aiops/metrics')
  return response.data
}

export const detectAnomalies = async () => {
  const response = await api.post('/api/v1/aiops/detect-anomalies')
  return response.data
}

export default api