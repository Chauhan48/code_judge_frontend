import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import InviteCandidate from "./pages/InviteCandidate";
import AddProblem from "./pages/AddProblem";
import TestPage from "./pages/TestPage";
import Progress from "./pages/Progress";
import ProtectedRoute from "./routes/ProtectedRoutes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* redirect root to login and also provide /login explicitly */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/invite"
          element={
            <ProtectedRoute>
              <InviteCandidate />
            </ProtectedRoute>
          }
        />

        <Route
          path="/problems/add"
          element={
            <ProtectedRoute>
              <AddProblem />
            </ProtectedRoute>
          }
        />

        {/* test page for candidates; token passed via query string */}
        <Route path="/test" element={<TestPage />} />

        {/* admin view for candidate progress */}
        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <Progress />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;