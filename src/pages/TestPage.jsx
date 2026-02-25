import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getTestByToken, runCode } from "../api/testApi";
import { getSubmissions } from "../api/adminApi";
import Editor from "@monaco-editor/react";

export default function TestPage() {
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const token = query.get("token");

  const [problems, setProblems] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("java");
  const [testId, setTestId] = useState("");
  const [email, setEmail] = useState("");
  const [runOutput, setRunOutput] = useState(null);
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
    if (isFinished || timeLeft <= 0) return;

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
  }, [timeLeft, isFinished]);


  useEffect(() => {
    if (!token) return;

    async function fetchTest() {
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

      } catch (err) {
        console.error("failed to load test", err);

        const errorMessage =
          err.response?.data?.message || "Failed to load test";

        if (errorMessage === "Invalid or expired test link") {
          setTestExpired(true);
          setMessage("This test has already been attempted.");
        } else {
          setMessage(errorMessage);
        }
      }
    }

    fetchTest();
  }, [token]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const selectedProblem = problems[selectedIndex];

  const handleSubmit = async () => {
    if (!selectedProblem) return;
    try {
      // run code endpoint
      const runRes = await runCode({
        sourceCode: code,
        stdin: "",
        languageKey: language,
        problemId: selectedProblem._id,
        token,
      });
      setRunOutput(runRes.data);

      // fetch submission history (email comes from test metadata)
      const subRes = await getSubmissions({
        testId,
        problemId: selectedProblem._id,
        email,
      });
      setSubmissionHistory(subRes.data || []);
    } catch (err) {
      console.error("submission error", err);
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
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold mb-2">
            Test Already Attempted
          </h2>
          <p className="text-gray-400">
            This test link has expired or has already been used.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">

      {/* LEFT PANEL */}
      <div className="w-1/5 bg-gray-900 border-r border-gray-800 p-4">
        <h2 className="font-bold mb-4">Problems</h2>
        {email && (
          <p className="text-sm text-gray-400 mb-2">
            Candidate: {email}
          </p>
        )}

        {problems.map((p, index) => (
          <div
            key={p._id}
            onClick={() => !isFinished && setSelectedIndex(index)}
            className={`p-2 mb-2 rounded cursor-pointer transition ${selectedIndex === index
              ? "bg-indigo-600"
              : "bg-gray-800 hover:bg-gray-700"
              } ${isFinished && "opacity-50 cursor-not-allowed"}`}
          >
            {index + 1}. {p.title}
          </div>
        ))}
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 p-6 overflow-y-auto">

        {/* TOP BAR (TIMER + FINISH BUTTON) */}
        <div className="flex justify-between items-center mb-6 bg-gray-900 p-4 rounded-lg border border-gray-800 shadow-md">

          {/* TIMER */}
          <div className="text-lg font-semibold">
            Time Left:{" "}
            <span
              className={`${timeLeft <= 300
                ? "text-red-500 animate-pulse"
                : "text-green-400"
                }`}
            >
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* FINISH BUTTON */}
          <button
            onClick={handleFinish}
            disabled={isFinished}
            className={`px-5 py-2 rounded-lg font-medium transition-all duration-300 ${isFinished
              ? "bg-gray-700 cursor-not-allowed"
              : "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-md hover:shadow-lg"
              }`}
          >
            Finish Test
          </button>
        </div>

        {/* SUCCESS MESSAGE */}
        {message && (
          <div className="bg-green-600/20 border border-green-500 text-green-400 p-3 rounded mb-6">
            {message}
          </div>
        )}

        {selectedProblem && (
          <>
            <h1 className="text-2xl font-bold mb-4">
              {selectedProblem.title}
            </h1>

            <p className="mb-6 text-gray-300">
              {selectedProblem.description}
            </p>

            {/* PUBLIC TEST CASES */}
            <h3 className="font-semibold mb-2">Public Test Cases</h3>
            <div className="bg-gray-800 p-4 rounded mb-6">
              {(selectedProblem.publicTestCases || []).map((tc, i) => (
                <div key={i} className="mb-2 text-sm">
                  <div>Input: {tc.input}</div>
                  <div>Output: {tc.expectedOutput}</div>
                </div>
              ))}
            </div>

            {/* LANGUAGE SELECTOR */}
            <div className="mb-4">
              <label className="mr-2">Language:</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isFinished}
                className="bg-gray-800 border border-gray-700 px-3 py-1 rounded"
              >
                <option value="java">Java</option>
                <option value="javascript">JavaScript</option>
                <option value="cpp">C++</option>
                <option value="python">Python</option>
              </select>
            </div>

            {/* IDE */}
            <div className="w-full h-96 bg-gray-900 rounded mb-4">
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
                }}
              />
            </div>

            {/* SUBMIT BUTTON */}
            <button
              onClick={handleSubmit}
              disabled={isFinished}
              className={`mt-4 px-6 py-2 rounded text-white transition ${isFinished
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
                }`}
            >
              Submit
            </button>

            {/* RUN OUTPUT */}
            {runOutput && (
              <div className="bg-gray-800 p-4 rounded mt-4">
                <h3 className="font-semibold mb-2">Run Result</h3>
                <pre className="text-sm">
                  {JSON.stringify(runOutput, null, 2)}
                </pre>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}