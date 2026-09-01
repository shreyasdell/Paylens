import {
  InvestigationState,
  ApiResponse,
  KPIMetrics,
  TimeSeriesData,
  SupportMessage,
} from "@/types/api";
import {
  mockPaymentInvestigation,
  mockIncidentInvestigation,
  mockIncidents,
  mockKPIMetrics,
  mockTimeSeriesData,
  mockSupportConversation,
  mockRunbooks,
} from "@/lib/mockData";

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  // Payment Investigation
  async investigatePayment(paymentId: string): Promise<ApiResponse<InvestigationState>> {
    await delay(800); // Simulate network delay
    return {
      status: "success",
      data: { ...mockPaymentInvestigation, payment_id: paymentId },
    };
  },

  // Incident Investigation
  async investigateIncident(incidentId: string): Promise<ApiResponse<InvestigationState>> {
    await delay(800);
    return {
      status: "success",
      data: { ...mockIncidentInvestigation, incident_id: incidentId },
    };
  },

  // Support Query
  async supportQuery(query: string): Promise<ApiResponse<InvestigationState>> {
    await delay(1000);
    return {
      status: "success",
      data: {
        ...mockPaymentInvestigation,
        customer_query: query,
        investigation_type: "support" as any,
      },
    };
  },

  // Get Incidents
  async getIncidents(): Promise<ApiResponse<typeof mockIncidents>> {
    await delay(500);
    return {
      status: "success",
      data: mockIncidents,
    };
  },

  // Get KPI Metrics
  async getKPIMetrics(): Promise<ApiResponse<KPIMetrics>> {
    await delay(300);
    return {
      status: "success",
      data: mockKPIMetrics,
    };
  },

  // Get Time Series Data
  async getTimeSeriesData(): Promise<ApiResponse<TimeSeriesData[]>> {
    await delay(400);
    return {
      status: "success",
      data: mockTimeSeriesData,
    };
  },

  // Get Support Conversation
  async getSupportConversation(): Promise<ApiResponse<SupportMessage[]>> {
    await delay(300);
    return {
      status: "success",
      data: mockSupportConversation,
    };
  },

  // Get Runbooks
  async getRunbooks(): Promise<ApiResponse<typeof mockRunbooks>> {
    await delay(400);
    return {
      status: "success",
      data: mockRunbooks,
    };
  },
};
