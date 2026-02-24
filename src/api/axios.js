import axios from "axios";

// When the frontend runs on a different port than the backend we run into
// cross‑origin requests that are often blocked by the browser unless the
// server explicitly allows CORS. During development we avoid that problem by
// using Vite's proxy feature – the client talks to `/api/...` (same origin)
// and Vite forwards those requests to the backend on port 3000.
//
// In production you would typically build the frontend and serve it from the
// same host/port as the API, so a relative URL is also the right choice there.
// Using a relative base URL also makes the code easier to test (no hard‑coded
// host) and automatically works with the dev proxy.
const api = axios.create({
  baseURL: "/api",
});

// Automatically attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Propagate request setup errors (e.g. network issues before send)
    console.error("[Axios Request Interceptor Error]", error);
    return Promise.reject(error);
  }
);

// Response interceptor for global error logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[Axios Response Error]", error.response?.data ?? error.message);
    return Promise.reject(error);
  }
);

export default api;