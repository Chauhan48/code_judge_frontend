import { useEffect, useState, useRef } from "react";
import Papa from "papaparse";
import { inviteCandidate, getProblems, bulkInviteCandidates, getBulkInviteStatus } from "../api/adminApi";
import { useNavigate } from "react-router-dom";

export default function InviteCandidate() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [inviteMode, setInviteMode] = useState("single"); // 'single' or 'bulk'

  // Bulk Invite States
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState([]);
  const [bulkJobLoading, setBulkJobLoading] = useState(false);
  const [bulkJobInfo, setBulkJobInfo] = useState(null); // { id, totalCandidates, status, successCount, failedCount, results }
  const fileInputRef = useRef(null);

  const [difficulty, setDifficulty] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);

  const [problems, setProblems] = useState([]);
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [fetching, setFetching] = useState(false);

  const [durationMinutes, setDurationMinutes] = useState(60);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7;

  const fetchProblems = async () => {
    setFetching(true);
    try {
      const res = await getProblems({ difficulty, tags });
      setProblems(res.data.data || []);
      setCurrentPage(1);
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit");
      return;
    }

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      alert("Please upload a valid CSV file");
      return;
    }

    setCsvFile(file);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        if (results.data && results.data.length > 0) {
          // Check for required columns
          const headers = Object.keys(results.data[0]).map(h => h.toLowerCase());
          if (!headers.includes("email")) {
            alert("CSV must contain an 'email' column.");
            setCsvFile(null);
            setCsvPreview([]);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
          }
          setCsvPreview(results.data.slice(0, 5));
        } else {
          alert("CSV is empty");
          setCsvFile(null);
          setCsvPreview([]);
        }
      }
    });
  };

  const handleBulkInvite = async () => {
    if (!csvFile || selectedProblems.length === 0) {
      alert("CSV file and at least one problem required");
      return;
    }

    setLoading(true);
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async function (results) {
        const candidates = results.data
          .filter(row => row.email || row.Email || row.EMAIL)
          .map(row => ({
            name: row.name || row.Name || row.NAME || "Candidate",
            email: (row.email || row.Email || row.EMAIL).trim()
          }));

        try {
          const res = await bulkInviteCandidates({
            candidates,
            problemIds: selectedProblems,
            durationMinutes: Number(durationMinutes)
          });

          setBulkJobInfo({
            id: res.data.jobId,
            status: 'pending',
            totalCandidates: res.data.total,
            successCount: 0,
            failedCount: 0,
            results: []
          });
          setSent(true);
          setTimeout(() => setSent(false), 4000);

          pollBulkJobStatus(res.data.jobId);
        } catch (err) {
          console.error(err);
          alert("Error starting bulk invite");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const pollBulkJobStatus = async (jobId) => {
    setBulkJobLoading(true);
    const interval = setInterval(async () => {
      try {
        const res = await getBulkInviteStatus(jobId);
        const data = res.data;
        setBulkJobInfo(data);

        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(interval);
          setBulkJobLoading(false);
        }
      } catch (err) {
        console.error("Error polling bulk job status", err);
        clearInterval(interval);
        setBulkJobLoading(false);
      }
    }, 3000);
  };

  const downloadCsvTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,name,email\nJohn Doe,john@example.com\nJane Smith,jane@example.com";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bulk_invite_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadResultsReport = () => {
    if (!bulkJobInfo || !bulkJobInfo.results) return;

    let csvContent = "data:text/csv;charset=utf-8,email,status,error\n";
    bulkJobInfo.results.forEach(row => {
      csvContent += `${row.email},${row.status},${row.error || ""}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bulk_invite_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <div className="max-w-5xl mx-auto px-6 pt-12 pb-6">

      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-3xl font-bold">
          Invite Candidates
        </h1>
        <div className="flex bg-gray-900 border border-gray-800 rounded-lg p-1">
          <button
            onClick={() => setInviteMode("single")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${inviteMode === "single" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"}`}
          >
            Single Invite
          </button>
          <button
            onClick={() => setInviteMode("bulk")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${inviteMode === "bulk" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"}`}
          >
            Bulk Invite
          </button>
        </div>
      </div>

      {/* Input Section */}
      {inviteMode === "single" ? (
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
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm text-gray-400">
              Upload Candidates CSV
            </label>
            <button
              onClick={downloadCsvTemplate}
              className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Template
            </button>
          </div>

          <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors">
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center">
              <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              <span className="text-gray-300 font-medium">{csvFile ? csvFile.name : "Click to upload CSV"}</span>
              <span className="text-gray-500 text-sm mt-1">Maximum file size 5MB</span>
            </label>
          </div>

          {csvPreview.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Preview (First 5 rows)</h3>
              <div className="overflow-hidden border border-gray-800 rounded-lg">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-800 text-gray-300">
                    <tr>
                      {Object.keys(csvPreview[0]).map((header) => (
                        <th key={header} className="px-4 py-2 font-medium">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {csvPreview.map((row, i) => (
                      <tr key={i} className="bg-gray-900/50">
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="px-4 py-2 text-gray-400">{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Results Section */}
          {bulkJobInfo && (
            <div className="mt-8 p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Processing Results</h3>
                <div className="flex items-center gap-3">
                  {bulkJobLoading && (
                    <span className="text-indigo-400 text-sm flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  )}
                  <span className="bg-gray-700 px-3 py-1 rounded-full text-sm">
                    {bulkJobInfo.successCount + bulkJobInfo.failedCount} / {bulkJobInfo.totalCandidates}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-2 mb-6 overflow-hidden">
                <div
                  className="bg-indigo-500 h-2 transition-all duration-500"
                  style={{ width: `${((bulkJobInfo.successCount + bulkJobInfo.failedCount) / bulkJobInfo.totalCandidates) * 100}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
                  <div className="text-green-400 text-sm font-medium mb-1">Success</div>
                  <div className="text-2xl font-bold">{bulkJobInfo.successCount}</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
                  <div className="text-red-400 text-sm font-medium mb-1">Failed</div>
                  <div className="text-2xl font-bold">{bulkJobInfo.failedCount}</div>
                </div>
              </div>

              {bulkJobInfo.status === 'completed' && (
                <button onClick={downloadResultsReport} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download Full Report
                </button>
              )}
            </div>
          )}
        </div>
      )}

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
          <div className="flex gap-1">
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
            className="bg-indigo-600 hover:bg-indigo-700 rounded-lg px-2 py-1 mx-4"
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
          <>
            <div className="overflow-x-auto rounded-xl border border-gray-800">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-800">
                  <tr className="text-gray-300 border-b border-gray-700 text-sm">
                    <th className="px-4 py-3 font-medium w-12">Select</th>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Difficulty</th>
                    <th className="px-4 py-3 font-medium">Tags</th>
                    <th className="px-4 py-3 font-medium text-right">Limits</th>
                  </tr>
                </thead>
                <tbody>
                  {problems.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((problem) => {
                    const isSelected = selectedProblems.includes(problem._id);
                    return (
                      <tr
                        key={problem._id}
                        onClick={() => handleSelectProblem(problem._id)}
                        className={`cursor-pointer border-b border-gray-800 transition-colors ${isSelected ? "bg-indigo-600/10" : "hover:bg-gray-800/50"
                          } last:border-0`}
                      >
                        <td className="px-4 py-4">
                          <div
                            className={`w-5 h-5 rounded border flex flex-shrink-0 items-center justify-center
                                ${isSelected
                                ? "bg-indigo-600 border-indigo-600"
                                : "border-gray-600 bg-gray-900"
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
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-semibold text-white">{problem.title}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-medium ${getDifficultyStyle(
                              problem.difficulty
                            )}`}
                          >
                            {problem.difficulty.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1">
                            {problem.tags?.map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] bg-gray-700 text-gray-300 px-2 py-0.5 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-500 text-right whitespace-nowrap">
                          {problem.timeLimitMs}ms • {problem.memoryLimitMb}MB
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {problems.length > rowsPerPage && (
              <div className="mt-6 flex justify-between items-center text-sm">
                <span className="text-gray-400">
                  Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, problems.length)} of {problems.length} problems
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700 rounded-lg transition-colors font-medium"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(problems.length / rowsPerPage), p + 1))}
                    disabled={currentPage === Math.ceil(problems.length / rowsPerPage)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700 rounded-lg transition-colors font-medium"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
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
      {inviteMode === "single" ? (
        <button
          onClick={handleInvite}
          disabled={
            loading || !email || selectedProblems.length === 0
          }
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed py-3 rounded-xl font-semibold transition-colors"
        >
          {loading ? "Sending..." : "Send Invitation"}
        </button>
      ) : (
        <button
          onClick={handleBulkInvite}
          disabled={
            loading || !csvFile || selectedProblems.length === 0 || bulkJobLoading
          }
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {loading ? "Preparing..." : "Send Bulk Invitations"}
        </button>
      )}

      {sent && (
        <div className="mt-4 text-green-400">
          Invitation sent successfully!
        </div>
      )}
    </div>
  );
}