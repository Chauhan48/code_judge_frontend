import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import InviteCandidate from "./pages/InviteCandidate";
import AddProblem from "./pages/AddProblem";
import TestPage from "./pages/TestPage";
import Progress from "./pages/Progress";
import ProtectedRoute from "./routes/ProtectedRoutes";
import MainLayout from "./layout/MainLayout";

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
              <MainLayout children={<Dashboard />} isDashboard={true} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/invite"
          element={
            <ProtectedRoute>
              <MainLayout children={<InviteCandidate />} isDashboard={false} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/problems/add"
          element={
            <ProtectedRoute>
              <MainLayout children={<AddProblem />} isDashboard={false} />
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
              <MainLayout children={<Progress />} isDashboard={false} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;