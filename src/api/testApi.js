import api from "./axios";

// fetch test information associated with a token (candidate link)
export const getTestByToken = async (token) => {
  // backend should accept token either in query or path
  return api.get(`/test`, { params: { token } });
};

// run code against a problem during a test. body contains sourceCode, stdin, languageKey, problemId, token
export const runCode = async (data) => {
  return api.post(`/test/run`, data);
};

// fetch progress for a candidate using their public token
export const getProgress = async (token) => {
  return api.get(`/test/progress`, { params: { token } });
};
