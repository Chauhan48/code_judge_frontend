import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getProgress } from "../api/testApi";
import { getCandidates } from "../api/adminApi";
import CandidateAttemptsChart from "../components/CandidateAttemptsChart";
import TestInfoModal from "../components/TestInfoModal";

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
    const [statusFilter, setStatusFilter] = useState("all");
    const [resultFilter, setResultFilter] = useState("all");
    const [scoreSort, setScoreSort] = useState("none");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // derive filtered+sorted candidates list
    const filteredCandidates = candidates
        .filter((c) => c.email.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter((c) => {
            if (statusFilter === "all") return true;
            return c.status === statusFilter;
        })
        .filter((c) => {
            if (resultFilter === "all") return true;
            if (resultFilter === "passed") return c.lastAttempt?.passed;
            if (resultFilter === "failed") return c.lastAttempt && !c.lastAttempt.passed;
            return true;
        });

    // sort separately so we don't mutate original
    const sortedCandidates =
        scoreSort === "none"
            ? filteredCandidates
            : [...filteredCandidates].sort((a, b) => {
                const sa = a.lastAttempt?.score ?? 0;
                const sb = b.lastAttempt?.score ?? 0;
                return scoreSort === "asc" ? sa - sb : sb - sa;
            });

    // pagination slicing
    const pageCount = Math.ceil(sortedCandidates.length / itemsPerPage);
    const paginatedCandidates = sortedCandidates.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
    const handleNext = () => setCurrentPage((p) => Math.min(pageCount, p + 1));

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

    const handleCandidateClick = async (candidateToken) => {
        setToken(candidateToken);
        setIsModalOpen(false); // close any open modal while loading
        await fetchProgress(candidateToken);
        // open modal once progress is fetched
        setIsModalOpen(true);
    };

    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    return (
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

                    {/* filters */}
                    <div className="flex flex-wrap gap-4 mb-4">
                        <div>
                            <label className="text-sm text-gray-400 block mb-1">
                                Invitation
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-gray-900 border border-gray-800 text-white rounded px-3 py-2"
                            >
                                <option value="all">All</option>
                                <option value="accepted">Accepted</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 block mb-1">
                                Result
                            </label>
                            <select
                                value={resultFilter}
                                onChange={(e) => setResultFilter(e.target.value)}
                                className="bg-gray-900 border border-gray-800 text-white rounded px-3 py-2"
                            >
                                <option value="all">All</option>
                                <option value="passed">Passed</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 block mb-1">
                                Score sort
                            </label>
                            <select
                                value={scoreSort}
                                onChange={(e) => setScoreSort(e.target.value)}
                                className="bg-gray-900 border border-gray-800 text-white rounded px-3 py-2"
                            >
                                <option value="none">None</option>
                                <option value="desc">Highest first</option>
                                <option value="asc">Lowest first</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full table-auto text-left">
                            <thead>
                                <tr className="text-gray-400 border-b border-gray-700">
                                    <th className="px-4 py-2">Email</th>
                                    <th className="px-4 py-2">Status</th>
                                    <th className="px-4 py-2">Attempts</th>
                                    <th className="px-4 py-2">Last Score</th>
                                    <th className="px-4 py-2">Result</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedCandidates.map((c) => (
                                    <tr
                                        key={c.id}
                                        onClick={() => handleCandidateClick(c.token)}
                                        className="cursor-pointer hover:bg-gray-800"
                                    >
                                        <td className="px-4 py-3">{c.email}</td>
                                        <td className="px-4 py-3 capitalize">
                                            {c.status}
                                        </td>
                                        <td className="px-4 py-3">{c.attempts}</td>
                                        <td className="px-4 py-3">
                                            {c.lastAttempt?.score ?? "-"}
                                        </td>
                                        <td
                                            className={`px-4 py-3 ${c.lastAttempt?.passed
                                                ? "text-green-400"
                                                : "text-red-400"
                                                }`}
                                        >
                                            {c.lastAttempt
                                                ? c.lastAttempt.passed
                                                    ? "Passed"
                                                    : "Failed"
                                                : "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* pagination controls */}
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                        <span>
                            Showing {(currentPage - 1) * itemsPerPage + 1} -{' '}
                            {Math.min(currentPage * itemsPerPage, sortedCandidates.length)} of{' '}
                            {sortedCandidates.length}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={handlePrev}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-50"
                            >
                                &larr; Prev
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={currentPage === pageCount || pageCount === 0}
                                className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-50"
                            >
                                Next &rarr;
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <CandidateAttemptsChart candidates={candidates} />

            <br />

            {loading && <p>Loading...</p>}
            {error && <p className="text-red-400">{error}</p>}


            {/* render modal only when open */}
            {isModalOpen && (
                <TestInfoModal
                    progress={progress}
                    onClose={() => setIsModalOpen(false)}
                />
            )}

        </div>
    );
}

