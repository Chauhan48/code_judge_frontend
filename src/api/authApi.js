import api from "./axios";

// Register Admin
export const registerAdmin = async (data) => {
  return api.post("/admin/register", data);
};

// Login Admin
export const loginAdmin = async (data) => {
  return api.post("/admin/login", data);
};