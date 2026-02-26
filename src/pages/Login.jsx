import { useState } from "react";
import { loginAdmin } from "../api/authApi";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await loginAdmin(form);

      console.log("[Login] Full response:", res);
      console.log("[Login] Response data:", res.data);

      const token =
        res.data.token ?? res.data.accessToken ?? res.data.data?.token;

      if (!token) {
        console.error("[Login] Token not found in response.");
        alert("Login failed: token not received from server.");
        return;
      }

      localStorage.setItem("token", token);
      if (res.data.user?.name) {
        localStorage.setItem("adminName", res.data.user.name);
      }
      console.log("[Login] Token stored successfully.");
      navigate("/dashboard");
    } catch (err) {
      console.error("[Login] Error response data:", err.response?.data);
      console.error("[Login] Error status:", err.response?.status);
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      {/* Glow blob */}
      <div className="absolute w-96 h-96 bg-indigo-600 opacity-10 rounded-full blur-3xl -top-10 -left-10 pointer-events-none" />
      <div className="absolute w-72 h-72 bg-indigo-500 opacity-10 rounded-full blur-3xl bottom-0 right-0 pointer-events-none" />

      <div className="auth-card relative z-10">
        {/* Logo / Brand */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-lg font-bold text-white tracking-tight">CodeJudge</span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
        <p className="text-sm text-gray-400 mb-8">Log in to your admin account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Email</label>
            <input
              type="email"
              placeholder="admin@example.com"
              className="input-field"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="input-field"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary mt-2">
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          Don't have an account?{" "}
          <a href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}