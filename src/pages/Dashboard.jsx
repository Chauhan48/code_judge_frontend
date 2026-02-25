import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStats } from "../api/adminApi";

export default function Dashboard() {
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalCandidates: "—",
        activeSessions: "—",
        totalSubmissions: "—",
        usersAttemptedCount: "—",
    });

    useEffect(() => {
        async function loadStats() {
            try {
                const res = await getStats();
                const d = res.data || {};
                setStats({
                    totalCandidates: d.totalCandidates ?? "—",
                    activeSessions: d.activeSessions ?? "—",
                    totalSubmissions: d.totalSubmissions ?? "—",
                    usersAttemptedCount: d.usersAttemptedCount ?? "—",
                });
            } catch (err) {
                console.error("failed to load stats", err);
            }
        }

        loadStats();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            {/* Top Nav */}
            <nav className="border-b border-gray-800 bg-gray-900/60 backdrop-blur-sm sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <span className="text-base font-bold tracking-tight">CodeJudge</span>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <div className="max-w-6xl mx-auto px-6 pt-16 pb-10">
                <div className="mb-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                        Admin Panel
                    </span>
                </div>
                <h1 className="text-4xl font-bold text-white mt-3 mb-2">Dashboard</h1>
                <p className="text-gray-400 text-base">Manage candidates and monitor your coding judge platform.</p>
            </div>

            {/* Stats Grid */}
            <div className="max-w-6xl mx-auto px-6 mb-10">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {(() => {
                        const statsList = [
                            { label: "Total Candidates", value: stats.totalCandidates, icon: "👤" },
                            { label: "Active Sessions", value: stats.activeSessions, icon: "⚡" },
                            { label: "Submissions", value: stats.totalSubmissions, icon: "📩" },
                            { label: "Users Attempted", value: stats.usersAttemptedCount, icon: "✅" },
                        ];

                        return statsList.map((stat) => (
                            <div
                                key={stat.label}
                                className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center gap-4 hover:border-gray-700 transition-colors"
                            >
                                <span className="text-2xl">{stat.icon}</span>
                                <div>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                                </div>
                            </div>
                        ));
                    })()}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="max-w-6xl mx-auto px-6">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Quick Actions</h2>
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
