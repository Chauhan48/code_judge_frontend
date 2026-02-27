import api from "./axios";

export const inviteCandidate = async (data) => {
  return api.post("/admin/invite", data);
};

export const bulkInviteCandidates = async (data) => {
  return api.post("/admin/bulk-invite", data);
};

export const getBulkInviteStatus = async (jobId) => {
  return api.get(`/admin/bulk-invite/${jobId}`);
};

export const addProblem = async (data) => {
  return api.post("/admin/problems", data);
};

export const getProblems = async (params) => {
  return api.get("/problems", { params });
};

export const getSubmissions = async (params) => {
  return api.get("/admin/submissions", { params });
};
export const getCandidates = async () => {
  return api.get("/admin/candidates");
};

export const getStats = async (params) => {
  return api.get("/admin/stats", { params });
};

// actual dashboard features
export const getRecentActivity = async () => {
  return api.get("/admin/recent-activity");
};

export const getActiveSessions = async () => {
  return api.get("/admin/active-sessions");
};

export const getSubmissionsOverTime = async () => {
  return api.get("/admin/submissions-time");
};
