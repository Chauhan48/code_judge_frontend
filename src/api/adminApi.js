import api from "./axios";

export const inviteCandidate = async (data) => {
  return api.post("/admin/invite", data);
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