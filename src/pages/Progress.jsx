import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getProgress } from "../api/testApi";
import { getCandidates } from "../api/adminApi";
import CandidateAttemptsChart from "../components/CandidateAttemptsChart";

export default function Progress() {
    const { search } = useLocation();
    const query = new URLSearchParams(search);
    const initialToken = query.get("token") || "";

    const [token, setToken] = useState(initialToken);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(null);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredCandidates = candidates.filter((c) =>
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fetchProgress = async (t) => {
        setLoading(true);
        setError(null);
        try {
            const res = await getProgress(t);
            setProgress(res.data);
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to fetch");
            setProgress(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // fetch list of candidates when component mounts
        async function loadCandidates() {
            try {
                const res = await getCandidates();
                setCandidates(res.data.candidates || []);
            } catch (err) {
                console.error("failed to load candidates", err);
            }
        }

        loadCandidates();

        if (initialToken) {
            // if a token is already provided via query, immediately load progress
            fetchProgress(initialToken);
        }
    }, [initialToken]);

    const handleCandidateClick = (candidateToken) => {
        setToken(candidateToken);
        fetchProgress(candidateToken);
    };

    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            <nav className="border-b border-gray-800 bg-gray-900/60 backdrop-blur-sm sticky top-0 z-20">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <span className="text-base font-bold tracking-tight">CodeJudge</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 border border-transparent hover:border-gray-700 transition-all duration-200"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                    </button>
                </div>
            </nav>
            <div className="max-w-5xl mx-auto px-6 pt-12 pb-6">

                <h1 className="text-3xl font-bold mb-4">Candidate Progress</h1>

                {/* Search Input */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <input
                            type="text"
                            placeholder="Search by email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-800 
      text-white rounded-xl px-4 py-3 pl-11
      focus:outline-none focus:ring-2 focus:ring-indigo-500
      focus:border-indigo-500 transition-all duration-200"
                        />

                        <svg
                            className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>
                </div>

                {/* candidate list */}
                {candidates.length > 0 && (
                    <div className="mb-10">
                        <h2 className="text-2xl font-semibold text-white mb-6">
                            Candidates
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCandidates.map((c) => (
                                <div
                                    key={c.id}
                                    onClick={() => handleCandidateClick(c.token)}
                                    className="cursor-pointer bg-gray-900 border border-gray-800 
          rounded-2xl p-5 shadow-md hover:shadow-xl 
          hover:-translate-y-1 transition-all duration-300 
          hover:border-indigo-500"
                                >
                                    {/* Email */}
                                    <h3 className="text-lg font-semibold text-white truncate">
                                        {c.email}
                                    </h3>

                                    {/* Status */}
                                    <div className="mt-3 flex items-center justify-between">
                                        <span
                                            className={`px-3 py-1 text-xs font-medium rounded-full
              ${c.status === "accepted"
                                                    ? "bg-green-500/20 text-green-400"
                                                    : "bg-yellow-500/20 text-yellow-400"
                                                }`}
                                        >
                                            {c.status}
                                        </span>

                                        <span className="text-sm text-gray-400">
                                            Attempts:{" "}
                                            <span className="text-indigo-400 font-semibold">
                                                {c.attempts}
                                            </span>
                                        </span>
                                    </div>

                                    {/* Last Attempt */}
                                    {c.lastAttempt && (
                                        <div className="mt-4 text-sm">
                                            <p className="text-gray-400">
                                                Last Score:{" "}
                                                <span className="text-white font-medium">
                                                    {c.lastAttempt.score}
                                                </span>
                                            </p>
                                            <p
                                                className={`font-medium ${c.lastAttempt.passed
                                                    ? "text-green-400"
                                                    : "text-red-400"
                                                    }`}
                                            >
                                                {c.lastAttempt.passed ? "Passed" : "Failed"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <CandidateAttemptsChart candidates={candidates} />

                <br />

                {loading && <p>Loading...</p>}
                {error && <p className="text-red-400">{error}</p>}

                {progress && (
                    <div className="space-y-6">
                        {/* summary */}
                        <div className="bg-gray-900 border border-gray-800 p-4 rounded">
                            <h2 className="text-xl font-semibold mb-2">Test Info</h2>
                            <p><span className="font-medium">Token:</span> {progress.testId}</p>
                            <p><span className="font-medium">Email:</span> {progress.email}</p>
                            <p><span className="font-medium">Attempted:</span> {progress.attempted ? "Yes" : "No"}</p>
                        </div>

                        {/* problems list */}
                        <div className="space-y-4">
                            {progress.problems && progress.problems.length > 0 ? (
                                progress.problems.map((prob) => (
                                    <div
                                        key={prob.problemId}
                                        className="bg-gray-900 border border-gray-800 p-4 rounded"
                                    >
                                        <h3 className="text-lg font-semibold mb-1">
                                            {prob.title}
                                        </h3>
                                        <p>
                                            <span className="font-medium">Problem ID:</span> {prob.problemId}
                                        </p>
                                        <p>
                                            <span className="font-medium">Attempted:</span>{" "}
                                            {prob.attempted ? "Yes" : "No"}
                                        </p>
                                        <p>
                                            <span className="font-medium">Attempts:</span> {prob.attempts}
                                        </p>

                                        {prob.lastAttempt && (
                                            <div className="mt-3 bg-gray-800 p-3 rounded">
                                                <h4 className="font-semibold">Last Attempt</h4>
                                                <p>
                                                    <span className="font-medium">Status:</span> {prob.lastAttempt.status}
                                                </p>
                                                <p>
                                                    <span className="font-medium">Score:</span> {prob.lastAttempt.score}
                                                </p>
                                                <p>
                                                    <span className="font-medium">Passed:</span> {prob.lastAttempt.passed ? "Yes" : "No"}
                                                </p>
                                                <p>
                                                    <span className="font-medium">Output:</span> {prob.lastAttempt.output}
                                                </p>
                                                <p>
                                                    <span className="font-medium">Submitted:</span>{" "}
                                                    {new Date(prob.lastAttempt.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-400">No problems in this test.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
