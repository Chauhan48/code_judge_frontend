import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getProgress } from "../api/testApi";

export default function Progress() {
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const initialToken = query.get("token") || "";

  const [token, setToken] = useState(initialToken);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);

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
    if (initialToken) {
      fetchProgress(initialToken);
    }
  }, [initialToken]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (token) fetchProgress(token);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">Candidate Progress</h1>

      <form onSubmit={handleSubmit} className="mb-6">
        <label className="block mb-1">Public Token</label>
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded"
          placeholder="e.g. 65asd87asd8"
        />
        <button
          type="submit"
          className="mt-3 bg-yellow-600 px-4 py-2 rounded hover:bg-yellow-500"
        >
          Load Progress
        </button>
      </form>

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
  );
}
