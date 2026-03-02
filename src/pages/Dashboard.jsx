import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// greeting component keeps its own timer to avoid re-rendering whole dashboard
const Greeting = () => {
  const [now, setNow] = useState(new Date());
  const adminName = localStorage.getItem("adminName") || "Admin";

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold">Welcome back, {adminName} 👋</h2>
      <p className="text-gray-400">Here’s what’s happening today.</p>
      <p className="text-sm text-gray-500 mt-1">{now.toLocaleString()}</p>
    </div>
  );
};
import {
  getStats,
  getRecentActivity,
  getActiveSessions,
  getSubmissionsOverTime,
} from "../api/adminApi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// reusable components
const StatCard = ({
  icon,
  label,
  value,
  percent,
  loading,
  onClick,
}) => {
  const trend =
    percent !== undefined && percent !== null ? (
      <span
        className={`ml-1 text-xs ${percent >= 0 ? "text-green-400" : "text-red-400"
          }`}
      >
        {percent >= 0 ? "↑" : "↓"}
        {Math.abs(percent)}%
      </span>
    ) : null;

  return (
    <div
      className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center gap-4
                 hover:border-gray-700 transition-colors cursor-pointer"
      onClick={onClick}
      title={label + (trend ? ` (${percent?.toFixed(1)}%)` : "")}
    >
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-2xl font-bold text-white">
          {loading ? (
            <span className="inline-block w-16 h-6 bg-gray-700 animate-pulse rounded" />
          ) : (
            value
          )}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
          {label}
          {trend}
        </p>
      </div>
    </div>
  );
};

const ProgressBar = ({ percent }) => (
  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mt-2">
    <div
      className="h-full bg-indigo-500 transition-all"
      style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
    />
  </div>
);

const ActivityItem = ({ item }) => (
  <div className="p-3 border border-gray-800 rounded-lg hover:bg-gray-800 transition">
    <p className="text-sm">{item.text}</p>
    <p className="text-xs text-gray-500 mt-1">{item.time}</p>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalCandidates: 0,
    activeSessions: 0,
    totalSubmissions: 0,
    usersAttemptedCount: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [submissionsData, setSubmissionsData] = useState([]);


  // keep previous stats in ref to avoid effect dependency loops
  const prevStatsRef = React.useRef(stats);

  const loadAll = async () => {
    setIsLoadingStats(true);
    try {
      const res = await getStats();
      const d = res.data || {};
      const newStats = {
        totalCandidates: d.totalCandidates ?? 0,
        activeSessions: d.activeSessions ?? 0,
        totalSubmissions: d.totalSubmissions ?? 0,
        usersAttemptedCount: d.usersAttemptedCount ?? 0,
      };
      prevStatsRef.current = stats; // store current before updating
      setStats(newStats);

      const act = await getRecentActivity();
      setRecentActivity(act.data || []);

      const sess = await getActiveSessions();
      setSessions(sess.data || []);

      const subs = await getSubmissionsOverTime();
      setSubmissionsData(subs.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    loadAll();
    const id = setInterval(loadAll, 30000);
    return () => clearInterval(id);
  }, []);

  // prevStats getter for calculations
  const prevStats = prevStatsRef.current;

  const percentChange = (current, previous) => {
    if (previous == null || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  const attemptedPercent =
    stats.totalCandidates > 0
      ? (stats.usersAttemptedCount / stats.totalCandidates) * 100
      : 0;

  const empty = stats.totalCandidates === 0;

  return (
    <div className="max-w-5xl mx-auto px-6 pt-12 pb-6">
      {/* greeting */}
      <Greeting />

      {empty ? (
        <div className="text-center py-20">
          <p className="text-xl mb-4">No candidates invited yet.</p>
          <button
            onClick={() => navigate("/invite")}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded"
          >
            Invite your first candidate
          </button>
        </div>
      ) : (
        <>
          {/* stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-10">
            <StatCard
              icon="👤"
              label="Total Candidates"
              value={stats.totalCandidates}
              percent={percentChange(
                stats.totalCandidates,
                prevStats?.totalCandidates ?? null
              )}
              loading={isLoadingStats}
              onClick={() => navigate("/progress")}
            />

            <StatCard
              icon="⚡"
              label="Active Sessions"
              value={stats.activeSessions}
              percent={percentChange(
                stats.activeSessions,
                prevStats?.activeSessions ?? null
              )}
              loading={isLoadingStats}
              onClick={() => navigate("/progress")}
            />

            <StatCard
              icon="📩"
              label="Submissions"
              value={stats.totalSubmissions}
              percent={percentChange(
                stats.totalSubmissions,
                prevStats?.totalSubmissions ?? null
              )}
              loading={isLoadingStats}
              onClick={() => navigate("/submissions")}
            />

            <div>
              <StatCard
                icon="✅"
                label="Users Attempted"
                value={stats.usersAttemptedCount}
                percent={percentChange(
                  stats.usersAttemptedCount,
                  prevStats?.usersAttemptedCount ?? null
                )}
                loading={isLoadingStats}
                onClick={() => navigate("/progress")}
              />
              <ProgressBar percent={attemptedPercent} />
            </div>
          </div>

          {/* recent activity */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-2">
              {recentActivity.map((it) => (
                <ActivityItem key={it.id} item={it} />
              ))}
            </div>
          </div>

          {/* submissions chart */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold mb-4">
              Submissions (last 7 days)
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={submissionsData}>
                  <XAxis dataKey="day" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#4F46E5"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* active sessions table */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold mb-4">Active Sessions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="px-4 py-2">Candidate</th>
                    <th className="px-4 py-2">Problem</th>
                    <th className="px-4 py-2">Time Left</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-gray-800 transition"
                    >
                      <td className="px-4 py-3">{s.name}</td>
                      <td className="px-4 py-3">{s.problem}</td>
                      <td className="px-4 py-3">{s.timeLeft}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* quick actions */}
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/invite")}
            className="group bg-gray-900 border border-gray-800 hover:border-indigo-500/50 rounded-xl p-6 text-left transition-all duration-200 hover:bg-gray-800/50"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:bg-indigo-600/30 transition-colors">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-1">Invite Candidate</h3>
            <p className="text-sm text-gray-500">Send an assessment invitation via email.</p>
          </button>

          <button
            onClick={() => navigate("/problems/add")}
            className="group bg-gray-900 border border-gray-800 hover:border-green-500/50 rounded-xl p-6 text-left transition-all duration-200 hover:bg-gray-800/50"
          >
            <div className="w-10 h-10 rounded-lg bg-green-600/20 border border-green-500/20 flex items-center justify-center mb-4 group-hover:bg-green-600/30 transition-colors">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-1">Add Problem</h3>
            <p className="text-sm text-gray-500">Create a new coding problem with test cases.</p>
          </button>

          <button
            onClick={() => navigate("/progress")}
            className="group bg-gray-900 border border-gray-800 hover:border-yellow-500/50 rounded-xl p-6 text-left transition-all duration-200 hover:bg-gray-800/50"
          >
            <div className="w-10 h-10 rounded-lg bg-yellow-600/20 border border-yellow-500/20 flex items-center justify-center mb-4 group-hover:bg-yellow-600/30 transition-colors">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9h18M9 21V9" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-1">View Progress</h3>
            <p className="text-sm text-gray-500">See a candidate's problem attempts via token.</p>
          </button>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-left opacity-50 cursor-not-allowed">
            <div className="w-10 h-10 rounded-lg bg-gray-700/40 border border-gray-700 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-gray-400 font-semibold mb-1">View Results</h3>
            <p className="text-sm text-gray-600">Coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
