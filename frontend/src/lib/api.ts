import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
const ENABLE_MOCK_MODE = process.env.NEXT_PUBLIC_ENABLE_MOCK_MODE === "true";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// API Service
export const apiService = {
  // Payment Investigation
  async investigatePayment(paymentId: string) {
    if (ENABLE_MOCK_MODE) {
      const { mockApi } = await import("@/services/mockApi");
      return mockApi.investigatePayment(paymentId);
    }
    return api.post(`/investigate/payment?payment_id=${paymentId}`);
  },

  // Incident Investigation
  async investigateIncident(incidentId: string) {
    if (ENABLE_MOCK_MODE) {
      const { mockApi } = await import("@/services/mockApi");
      return mockApi.investigateIncident(incidentId);
    }
    return api.post(`/investigate/incident?incident_id=${incidentId}`);
  },

  // Support Query
  async supportQuery(query: string) {
    if (ENABLE_MOCK_MODE) {
      const { mockApi } = await import("@/services/mockApi");
      return mockApi.supportQuery(query);
    }
    return api.post("/support/query", { query });
  },

  // Get Incidents
  async getIncidents() {
    if (ENABLE_MOCK_MODE) {
      const { mockApi } = await import("@/services/mockApi");
      return mockApi.getIncidents();
    }
    return api.get("/incidents");
  },

  // Get KPI Metrics
  async getKPIMetrics() {
    if (ENABLE_MOCK_MODE) {
      const { mockApi } = await import("@/services/mockApi");
      return mockApi.getKPIMetrics();
    }
    return api.get("/metrics");
  },

  // Get Time Series Data
  async getTimeSeriesData() {
    if (ENABLE_MOCK_MODE) {
      const { mockApi } = await import("@/services/mockApi");
      return mockApi.getTimeSeriesData();
    }
    return api.get("/metrics/timeseries");
  },

  // Get Support Conversation
  async getSupportConversation() {
    if (ENABLE_MOCK_MODE) {
      const { mockApi } = await import("@/services/mockApi");
      return mockApi.getSupportConversation();
    }
    return api.get("/support/conversation");
  },

  // Get Runbooks
  async getRunbooks() {
    if (ENABLE_MOCK_MODE) {
      const { mockApi } = await import("@/services/mockApi");
      return mockApi.getRunbooks();
    }
    return api.get("/runbooks");
  },
};

export default api;
