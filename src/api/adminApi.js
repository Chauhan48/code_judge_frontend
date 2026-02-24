import api from "./axios";

export const inviteCandidate = async (data) => {
  return api.post("/admin/invite", data);
};

export const addProblem = async (data) => {
  return api.post("/admin/problems", data);
};