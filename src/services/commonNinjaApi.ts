import axios from "axios";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const commonNinjaAccountAccessKey =
  process.env.COMMONNINJA_ACCOUNT_ACCESS_TOKEN || "";
const cnApiBaseUrl = "https://api.commoninja.com/platform/api/v1";

// Create axios instance with common configuration
const apiClient = axios.create({
  baseURL: cnApiBaseUrl,
  headers: {
    "CN-API-Token": commonNinjaAccountAccessKey,
  },
});

export const CommonNinjaApi = {
  // Widget operations
  async getWidget(widgetId: string) {
    const response = await apiClient.get(`/widgets/${widgetId}`);
    return response.data;
  },

  async getWidgetSchema(widgetType: string) {
    const response = await apiClient.get(
      `/widget-types/${widgetType.replace(/_/g, "-")}/schema`
    );
    return response.data;
  },

  async updateWidget(widgetId: string, widgetData: any) {
    const response = await apiClient.put(`/widgets/${widgetId}`, {
      data: widgetData,
    });
    return response.data;
  },

  // Widget listing operations
  async listWidgets(
    page = 1,
    limit = 20,
    projectId: string = "",
    search: string = "",
    type: string = ""
  ) {
    const response = await apiClient.get("/widgets", {
      params: { page, limit, projectId, search, type },
    });
    return response.data;
  },

  // Widget creation
  async createWidget(
    widgetType: string,
    widgetData: any,
    name: string = "",
    projectId: string = ""
  ) {
    const data: any = {
      type: widgetType,
      data: widgetData,
      name,
      status: "draft",
    };
    // Optional
    if (projectId) {
      data.projectId = projectId;
    }
    const response = await apiClient.post("/widgets", data);
    return response.data;
  },

  // Widget deletion
  async deleteWidget(widgetId: string) {
    const response = await apiClient.delete(`/widgets/${widgetId}`);
    return response.data;
  },

  // Widget types
  async getWidgetTypes() {
    const response = await apiClient.get("/widget-types");
    return response.data;
  },

  // Project operations
  async getProjects(page = 1, limit = 20) {
    const response = await apiClient.get("/projects", {
      params: { page, limit },
    });
    return response.data;
  },

  async getProject(projectId: string) {
    const response = await apiClient.get(`/projects/${projectId}`);
    return response.data;
  },

  // CRM operations - only GET requests
  async getContacts(projectId: string, page = 1, limit = 20) {
    const response = await apiClient.get(`/projects/${projectId}/contacts`, {
      params: { page, limit },
    });
    return response.data;
  },

  async getContact(projectId: string, contactId: string) {
    const response = await apiClient.get(
      `/projects/${projectId}/contacts/${contactId}`
    );
    return response.data;
  },

  async getSubmissions(
    projectId: string,
    page = 1,
    limit = 20,
    widgetId: string = ""
  ) {
    const response = await apiClient.get(`/projects/${projectId}/submissions`, {
      params: { page, limit, widgetId },
    });
    return response.data;
  },

  async getSubmission(projectId: string, submissionId: string) {
    const response = await apiClient.get(
      `/projects/${projectId}/submissions/${submissionId}`
    );
    return response.data;
  },

  // Analytics operations - only at widget level
  async getWidgetAnalytics(
    widgetId: string,
    from: string = "",
    to: string = "",
    breakdown: string = "day",
    events: string[] = []
  ) {
    const response = await apiClient.get(`/widgets/${widgetId}/analytics`, {
      params: { from, to, breakdown, events },
    });
    return response.data;
  },

  // Get widget editor URL
  async getWidgetEditorUrl(widgetId: string) {
    const response = await apiClient.get(`/widgets/${widgetId}/editor`);
    return response.data;
  },

  async getWidgetEmbedCode(widgetId: string) {
    const response = await apiClient.get(`/widgets/${widgetId}/embed-code`);
    return response.data;
  },
};
