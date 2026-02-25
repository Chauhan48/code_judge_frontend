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

  useEffect(() => {
    if (!token) return;
    async function fetchTest() {
      try {
        const res = await getTestByToken(token);
        setProblems(res.data.problems || []);
        if (res.data._id) setTestId(res.data._id);
        if (res.data.email) setEmail(res.data.email);
      } catch (err) {
        console.error("failed to load test", err);
      }
    }

    fetchTest();
  }, [token]);

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

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">

      {/* LEFT PANEL */}
      <div className="w-1/5 bg-gray-900 border-r border-gray-800 p-4">
        <h2 className="font-bold mb-4">Problems</h2>
        {email && <p className="text-sm text-gray-400 mb-2">Candidate: {email}</p>}

        {problems.map((p, index) => (
          <div
            key={p._id}
            onClick={() => setSelectedIndex(index)}
            className={`p-2 mb-2 rounded cursor-pointer ${
              selectedIndex === index
                ? "bg-indigo-600"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            {index + 1}. {p.title}
          </div>
        ))}
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 p-6 overflow-y-auto">

        {selectedProblem && (
          <>
            <h1 className="text-2xl font-bold mb-4">
              {selectedProblem.title}
            </h1>

            <p className="mb-6 text-gray-300">
              {selectedProblem.description}
            </p>

            {/* public test cases */}
            <h3 className="font-semibold mb-2">Public Test Cases</h3>
            <div className="bg-gray-800 p-4 rounded mb-6">
              {(selectedProblem.publicTestCases || []).map((tc, i) => (
                <div key={i} className="mb-2 text-sm">
                  <div>Input: {tc.input}</div>
                  <div>Output: {tc.expectedOutput}</div>
                </div>
              ))}
            </div>

            {/* hidden test cases (show count only or reveal if needed) */}
            {(selectedProblem.hiddenTestCases || []).length > 0 && (
              <>
                <h3 className="font-semibold mb-2">Hidden Test Cases</h3>
                <div className="bg-gray-800 p-4 rounded mb-6">
                  {(selectedProblem.hiddenTestCases || []).map((tc, i) => (
                    <div key={i} className="mb-2 text-sm">
                      <div>Input: {tc.input}</div>
                      <div>Output: {tc.output}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Language Selector */}
            <div className="mb-4">
              <label className="mr-2">Language:</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
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
                defaultLanguage={language}
                language={language}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || "")}
                options={{ automaticLayout: true, fontSize: 14 }}
              />
            </div>

            <button
              className="mt-4 bg-indigo-600 px-6 py-2 rounded"
              onClick={handleSubmit}
            >
              Submit
            </button>

            {runOutput && (
              <div className="bg-gray-800 p-4 rounded mt-4">
                <h3 className="font-semibold mb-2">Run Result</h3>
                <pre className="text-sm">
                  {JSON.stringify(runOutput, null, 2)}
                </pre>
              </div>
            )}

            {submissionHistory.length > 0 && (
              <div className="bg-gray-800 p-4 rounded mt-4">
                <h3 className="font-semibold mb-2">Submission History</h3>
                <ul className="text-sm list-disc pl-5">
                  {submissionHistory.map((s, i) => (
                    <li key={i}>{JSON.stringify(s)}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}