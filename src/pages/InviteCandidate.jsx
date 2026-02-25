import { useEffect, useState } from "react";
import { inviteCandidate, getProblems } from "../api/adminApi";
import { useNavigate } from "react-router-dom";

export default function InviteCandidate() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const [difficulty, setDifficulty] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);

  const [problems, setProblems] = useState([]);
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [fetching, setFetching] = useState(false);

  const [durationMinutes, setDurationMinutes] = useState(60);

  const fetchProblems = async () => {
    setFetching(true);
    try {
      const res = await getProblems({ difficulty, tags });
      setProblems(res.data.data || []);
    } catch (err) {
      console.error("Error fetching problems", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleSelectProblem = (id) => {
    setSelectedProblems((prev) =>
      prev.includes(id)
        ? prev.filter((p) => p !== id)
        : [...prev, id]
    );
  };

  const handleInvite = async () => {
    if (!email || selectedProblems.length === 0) {
      alert("Email and at least one problem required");
      return;
    }

    setLoading(true);
    try {
      await inviteCandidate({
        email,
        problemIds: selectedProblems,
        durationMinutes: Number(durationMinutes),
      });

      setSent(true);
      setEmail("");
      setSelectedProblems([]);
      setDurationMinutes(60);

      setTimeout(() => setSent(false), 4000);
    } catch (err) {
      console.error(err);
      alert("Error sending invite");
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const getDifficultyStyle = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/20 text-green-400";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400";
      case "hard":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-700 text-gray-300";
    }
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

        {/* Header */}
        <h1 className="text-3xl font-bold mb-8">
          Invite Candidate
        </h1>

        {/* Email Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <label className="block text-sm text-gray-400 mb-2">
            Candidate Email
          </label>
          <input
            type="email"
            placeholder="candidate@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filters */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">
            Filter Problems
          </h2>

          <div className="grid md:grid-cols-3 gap-4 mb-4">

            {/* Difficulty */}
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            {/* Tag Input */}
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Enter tag"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={addTag}
                className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg"
              >
                Add
              </button>
            </div>

            <button
              onClick={fetchProblems}
              className="bg-indigo-600 hover:bg-indigo-700 rounded-lg px-4 py-2"
            >
              Apply Filters
            </button>
          </div>

          {/* Selected Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Problems Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">
              Select Problems
            </h2>
            <span className="text-sm text-indigo-400 font-medium">
              {selectedProblems.length} selected
            </span>
          </div>

          {fetching ? (
            <div className="text-gray-400">Loading...</div>
          ) : problems.length === 0 ? (
            <div className="text-gray-500 text-sm">
              No problems found
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {problems.map((problem) => {
                const isSelected = selectedProblems.includes(problem._id);

                return (
                  <div
                    key={problem._id}
                    onClick={() =>
                      handleSelectProblem(problem._id)
                    }
                    className={`cursor-pointer p-5 rounded-xl border transition-all duration-200
                      ${isSelected
                        ? "bg-indigo-600/10 border-indigo-500 shadow-lg shadow-indigo-500/10"
                        : "bg-gray-800 border-gray-700 hover:border-gray-500"
                      }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-white mb-2">
                          {problem.title}
                        </h3>

                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${getDifficultyStyle(
                            problem.difficulty
                          )}`}
                        >
                          {problem.difficulty.toUpperCase()}
                        </span>
                      </div>

                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center
                          ${isSelected
                            ? "bg-indigo-600 border-indigo-600"
                            : "border-gray-600"
                          }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    {problem.tags?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {problem.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Limits */}
                    <div className="mt-4 text-xs text-gray-500">
                      {problem.timeLimitMs}ms •{" "}
                      {problem.memoryLimitMb}MB
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Time Limit Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <label className="block text-sm text-gray-400 mb-2">
            Test Duration (Minutes)
          </label>
          <input
            type="number"
            min="1"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Invite Button */}
        <button
          onClick={handleInvite}
          disabled={
            loading || !email || selectedProblems.length === 0
          }
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed py-3 rounded-xl font-semibold"
        >
          {loading ? "Sending..." : "Send Invitation"}
        </button>

        {sent && (
          <div className="mt-4 text-green-400">
            Invitation sent successfully!
          </div>
        )}
      </div>
    </div>
  );
}