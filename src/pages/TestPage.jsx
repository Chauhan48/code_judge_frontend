import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getTestByToken, runCode, getProgress } from "../api/testApi";
import { getSubmissions } from "../api/adminApi";
import Editor from "@monaco-editor/react";

// --- Score Summary Component ---
const ScoreSummary = ({ token }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    // Adding a slight delay to ensure any pending background submission finishes
    const fetchScore = async () => {
      try {
        const res = await getProgress(token);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    const timerId = setTimeout(fetchScore, 1000);
    return () => clearTimeout(timerId);
  }, [token]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-950 text-gray-100">
      <p className="text-xl animate-pulse">Calculating final score...</p>
    </div>
  );

  if (!data) return (
    <div className="flex items-center justify-center h-screen bg-gray-950 text-gray-100">
      <p className="text-xl text-red-500">Failed to load score.</p>
    </div>
  );

  const totalScore = data.problems.reduce((acc, p) => acc + (p.lastAttempt?.score || 0), 0);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-gray-100 p-4">
      <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-xl max-w-2xl w-full text-center">
        <h2 className="text-4xl font-bold mb-4 text-green-400">Test Completed</h2>
        <p className="text-gray-400 mb-8 text-lg">Thank you for completing the assessment.</p>

        <div className="text-6xl font-black mb-8 text-indigo-500">
          Score: {totalScore}
        </div>

        <div className="text-left bg-gray-800 rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-xl mb-4 border-b border-gray-700 pb-2">Problem Summary</h3>
          {data.problems.map((p, idx) => (
            <div key={p.problemId} className="flex justify-between items-center bg-gray-950 p-4 rounded-lg">
              <span className="font-medium">{idx + 1}. {p.title}</span>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${p.lastAttempt?.passed ? 'bg-green-600/20 text-green-400 border border-green-500/30' : 'bg-red-600/20 text-red-400 border border-red-500/30'}`}>
                {p.lastAttempt?.score || 0} Points
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Instructions Component ---
const Instructions = ({ onStart, loading }) => (
  <div className="flex items-center justify-center h-screen bg-gray-950 text-gray-100 p-4">
    <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-xl max-w-2xl w-full">
      <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
        <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-white">Test Instructions</h2>
      </div>

      <ul className="space-y-4 text-gray-300 text-lg mb-8">
        <li className="flex gap-3">
          <span className="text-indigo-400 mt-1">⏳</span>
          <div>
            <strong className="text-white block">Time Limit</strong>
            You will have <strong>45 minutes per question</strong>. The timer starts as soon as you begin.
          </div>
        </li>
        <li className="flex gap-3">
          <span className="text-red-400 mt-1">🚫</span>
          <div>
            <strong className="text-white block">No Refreshing</strong>
            Do <strong>NOT</strong> refresh the page. The test is visible only once. If you refresh, you won't be able to resume.
          </div>
        </li>
        <li className="flex gap-3">
          <span className="text-green-400 mt-1">✅</span>
          <div>
            <strong className="text-white block">Auto-Submit</strong>
            Once the timer expires, the test will be automatically submitted.
          </div>
        </li>
      </ul>

      <button
        onClick={onStart}
        disabled={loading}
        className={`w-full py-4 font-bold rounded-xl transition text-lg flex justify-center items-center gap-2 ${loading ? 'bg-indigo-600/50 cursor-not-allowed text-white/50' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-indigo-500/25'}`}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            Loading Test...
          </>
        ) : (
          "I understand, Start Test"
        )}
      </button>
    </div>
  </div>
);

export default function TestPage() {
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const token = query.get("token");

  const [testStarted, setTestStarted] = useState(false);
  const [isLoadingTest, setIsLoadingTest] = useState(false);

  const [problems, setProblems] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("java");
  const [testId, setTestId] = useState("");
  const [email, setEmail] = useState("");
  const [runOutput, setRunOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false); // show running animation
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [testExpired, setTestExpired] = useState(false);

  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [message, setMessage] = useState("");

  const handleFinish = () => {
    setIsFinished(true);
    setMessage("Test submitted successfully");
  };

  useEffect(() => {
    if (isFinished || timeLeft <= 0 || !testStarted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isFinished, testStarted]);

  const handleStartTest = async () => {
    if (!token) return;
    setIsLoadingTest(true);
    try {
      const res = await getTestByToken(token);
      const fetchedProblems = res.data.problems || [];

      setProblems(fetchedProblems);

      // ✅ Set timer = problems × 45 minutes
      const totalMinutes = fetchedProblems.length * 45;
      const totalSeconds = totalMinutes * 60;
      setTimeLeft(totalSeconds);

      if (res.data._id) setTestId(res.data._id);
      if (res.data.email) setEmail(res.data.email);
      setTestStarted(true);

    } catch (err) {
      console.error("failed to load test", err);

      const errorMessage =
        err.response?.data?.message || "Failed to load test";

      if (errorMessage === "Invalid or expired test link" || errorMessage === "Test already attempted") {
        setTestExpired(true);
        setMessage("This test has already been attempted.");
      } else {
        setMessage(errorMessage);
        setTestExpired(true); // Treat as expired or failed so we show the error screen
      }
    } finally {
      setIsLoadingTest(false);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async () => {
    const selectedProblem = problems[selectedIndex];
    if (!selectedProblem) return;
    setIsRunning(true);
    setRunOutput(null);

    try {
      // run code endpoint (will perform test-case grading)
      const runRes = await runCode({
        sourceCode: code,
        stdin: "",
        languageKey: language,
        problemId: selectedProblem._id,
        token,
      });
      setRunOutput(runRes.data);

      // fetch submission history (email comes from test metadata)
      // Note: this might fail if unauthorized, but we'll try anyway
      const subRes = await getSubmissions({
        testId,
        problemId: selectedProblem._id,
        email,
      });
      setSubmissionHistory(subRes.data || []);
    } catch (err) {
      console.error("submission error", err);
    } finally {
      setIsRunning(false);
    }
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950 text-gray-100">
        <p className="text-lg">Invalid or missing test token.</p>
      </div>
    );
  }

  if (testExpired) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950 text-gray-100">
        <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-xl text-center max-w-md">
          <div className="text-red-500 text-5xl mb-6 flex justify-center">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-2 text-white">
            Cannot Start Test
          </h2>
          <p className="text-gray-400">
            {message || "This test link has expired or has already been used."}
          </p>
        </div>
      </div>
    );
  }

  if (!testStarted && !isFinished) {
    return <Instructions onStart={handleStartTest} loading={isLoadingTest} />;
  }

  if (isFinished) {
    return <ScoreSummary token={token} />;
  }

  const selectedProblem = problems[selectedIndex];

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      {/* LEFT PANEL */}
      <div className="w-1/5 bg-gray-900 border-r border-gray-800 p-4 flex flex-col">
        <h2 className="font-bold mb-4 text-lg text-white">Problems</h2>
        {email && (
          <p className="text-sm text-gray-400 mb-4 break-all">
            Candidate: {email}
          </p>
        )}

        <div className="space-y-2 flex-1 overflow-y-auto">
          {problems.map((p, index) => (
            <div
              key={p._id}
              onClick={() => !isFinished && setSelectedIndex(index)}
              className={`p-3 rounded-lg cursor-pointer transition-all border ${selectedIndex === index
                  ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 font-medium"
                  : "bg-gray-800 border-transparent hover:bg-gray-700 hover:border-gray-600"
                } ${isFinished && "opacity-50 cursor-not-allowed"}`}
            >
              {index + 1}. {p.title}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 p-6 overflow-y-auto flex flex-col">

        {/* TOP BAR (TIMER + FINISH BUTTON) */}
        <div className="flex justify-between items-center mb-6 bg-gray-900 p-4 rounded-xl border border-gray-800 shadow-md">
          {/* TIMER */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-800 rounded-lg">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Time Left</div>
              <div
                className={`text-xl font-bold tabular-nums ${timeLeft <= 300
                    ? "text-red-500 animate-pulse"
                    : "text-green-400"
                  }`}
              >
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          {/* FINISH BUTTON */}
          <button
            onClick={handleFinish}
            disabled={isFinished}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${isFinished
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 shadow-sm"
              }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Finish Test
          </button>
        </div>

        {/* MAIN EDITOR AREA */}
        {selectedProblem && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
              <h1 className="text-2xl font-bold mb-4 text-white">
                {selectedProblem.title}
              </h1>

              <p className="mb-6 text-gray-300 leading-relaxed">
                {selectedProblem.description}
              </p>

              {/* PUBLIC TEST CASES */}
              {selectedProblem.publicTestCases?.length > 0 && (
                <>
                  <h3 className="font-semibold mb-3 text-gray-400 uppercase text-sm tracking-wider">Public Test Cases</h3>
                  <div className="bg-gray-950 p-4 rounded-lg border border-gray-800 mb-2 space-y-4">
                    {selectedProblem.publicTestCases.map((tc, i) => (
                      <div key={i} className="text-sm font-mono">
                        <div className="mb-1"><span className="text-gray-500">Input:</span> <span className="text-green-400">{tc.input}</span></div>
                        <div><span className="text-gray-500">Output:</span> <span className="text-indigo-400">{tc.expectedOutput}</span></div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* IDE SECTION */}
            <div className="flex-1 flex flex-col min-h-[500px]">
              {/* LANGUAGE SELECTOR */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-400">Language:</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    disabled={isFinished}
                    className="bg-gray-900 border border-gray-700 text-white px-4 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  >
                    <option value="java">Java</option>
                    <option value="javascript">JavaScript</option>
                    <option value="cpp">C++</option>
                    <option value="python">Python</option>
                  </select>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  onClick={handleSubmit}
                  disabled={isFinished || isRunning}
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${isFinished || isRunning
                      ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-indigo-500/25"
                    }`}
                >
                  {isRunning ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white/70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                      Running...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Run & Submit
                    </>
                  )}
                </button>
              </div>

              <div className="flex-1 bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-inner flex flex-col">
                <div className="flex-1 relative">
                  <Editor
                    height="100%"
                    language={language}
                    theme="vs-dark"
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    options={{
                      automaticLayout: true,
                      fontSize: 14,
                      readOnly: isFinished,
                      minimap: { enabled: false },
                      padding: { top: 16 },
                    }}
                  />
                </div>
              </div>
            </div>

            {/* RUN OUTPUT */}
            {runOutput && (
              <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl mt-6 shadow-md">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-white">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Execution Result
                </h3>

                {runOutput.results ? (
                  <div className="text-sm">
                    <div className="flex gap-4 mb-4">
                      <div className="bg-gray-950 px-4 py-2 rounded-lg border border-gray-800 flex-1">
                        <span className="text-gray-500 block mb-1">Status</span>
                        <span className={`font-semibold ${runOutput.status === 'accepted' ? 'text-green-400' : 'text-red-400'}`}>
                          {runOutput.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="bg-gray-950 px-4 py-2 rounded-lg border border-gray-800 flex-1">
                        <span className="text-gray-500 block mb-1">Score</span>
                        <span className="font-semibold text-white">
                          {runOutput.score} / {runOutput.maxScore}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {runOutput.results.map((r) => (
                        <div
                          key={r.index}
                          className={`p-4 rounded-lg flex flex-col gap-2 border ${r.passed
                              ? 'bg-green-500/10 border-green-500/20'
                              : 'bg-red-500/10 border-red-500/20'
                            }`}
                        >
                          <div className="flex justify-between items-center font-medium">
                            <span className={r.passed ? 'text-green-400' : 'text-red-400'}>
                              Test #{r.index}: {r.status.replace(/_/g, ' ')}
                            </span>
                          </div>

                          {r.stdout != null && (
                            <div className="bg-gray-950 p-2 rounded text-xs font-mono border border-gray-800">
                              <strong className="text-gray-500 block mb-1">Output:</strong>
                              <span className="text-gray-300">{r.stdout || '<empty>'}</span>
                            </div>
                          )}
                          {r.stderr && (
                            <div className="bg-gray-950 p-2 rounded text-xs font-mono border border-gray-800">
                              <strong className="text-yellow-600 block mb-1">StdErr:</strong>
                              <span className="text-yellow-500">{r.stderr}</span>
                            </div>
                          )}
                          {r.compileOutput && (
                            <div className="bg-gray-950 p-2 rounded text-xs font-mono border border-gray-800">
                              <strong className="text-orange-600 block mb-1">Compiler Error:</strong>
                              <span className="text-orange-500">{r.compileOutput}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <pre className="text-sm bg-gray-950 p-4 rounded-lg border border-gray-800 overflow-x-auto text-gray-300">
                    {JSON.stringify(runOutput, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}