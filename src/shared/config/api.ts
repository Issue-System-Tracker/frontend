export const API_BASE_URL = "http://localhost:8080/api";

export const ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    logout: `${API_BASE_URL}/auth/logout`,
    refresh: `${API_BASE_URL}/auth/refresh`,
  },
  projects: {
    list: `${API_BASE_URL}/projects`,
    create: `${API_BASE_URL}/projects`,
    delete: (projectId: number) => `${API_BASE_URL}/projects/${projectId}`,
    addMember: (projectId: number, memberEmail: string) => 
      `${API_BASE_URL}/projects/${projectId}/member?memberEmail=${encodeURIComponent(memberEmail)}`,
    removeMember: (projectId: number, memberEmail: string) => 
      `${API_BASE_URL}/projects/${projectId}/member?memberEmail=${encodeURIComponent(memberEmail)}`,
  },
  issues: {
    list: (projectId: number) => `${API_BASE_URL}/projects/${projectId}/issues`,
    create: (projectId: number) => `${API_BASE_URL}/projects/${projectId}/issues`,
    update: (projectId: number, issueId: number) => `${API_BASE_URL}/projects/${projectId}/issues/${issueId}`,
    delete: (projectId: number, issueId: number) => `${API_BASE_URL}/projects/${projectId}/issues/${issueId}`,
    search: (projectId: number) => `${API_BASE_URL}/projects/${projectId}/issues/search`,
    bySprint: (projectId: number, sprintId: number) => `${API_BASE_URL}/projects/${projectId}/issues/sprint/${sprintId}`,
    history: (projectId: number, issueId: number) => `${API_BASE_URL}/projects/${projectId}/issues/${issueId}/history`,
    changeStatus: (projectId: number, issueId: number, action: string) => 
      `${API_BASE_URL}/projects/${projectId}/issues/${issueId}/${action}`,
  },
  sprints: {
    list: (projectId: number) => `${API_BASE_URL}/projects/${projectId}/sprints`,
    create: (projectId: number) => `${API_BASE_URL}/projects/${projectId}/sprints`,
    update: (projectId: number, sprintId: number) => `${API_BASE_URL}/projects/${projectId}/sprints/${sprintId}`,
    delete: (projectId: number, sprintId: number) => `${API_BASE_URL}/projects/${projectId}/sprints/${sprintId}`,
  },
};
