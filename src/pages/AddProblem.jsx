import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addProblem } from "../api/adminApi";

// ─── helpers ────────────────────────────────────────────────────────────────
const emptyTestCase = () => ({ input: "", expectedOutput: "", score: 1 });

const slugify = (str) =>
    str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-");

const LANGUAGES = ["cpp", "java", "javascript", "python"];
const DIFFICULTIES = ["easy", "medium", "hard"];

// ─── sub-components ──────────────────────────────────────────────────────────
function SectionTitle({ children }) {
    return (
        <h2 className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-4 mt-8 first:mt-0">
            {children}
        </h2>
    );
}

function Label({ children, required }) {
    return (
        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
            {children}
            {required && <span className="text-red-400 ml-1">*</span>}
        </label>
    );
}

function TestCaseBlock({ label, cases, onChange, onAdd, onRemove }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <SectionTitle>{label}</SectionTitle>
                <button
                    type="button"
                    onClick={onAdd}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 hover:border-indigo-400/50 px-3 py-1.5 rounded-lg transition-colors"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Case
                </button>
            </div>

            <div className="space-y-4">
                {cases.map((tc, i) => (
                    <div
                        key={i}
                        className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 relative group"
                    >
                        <span className="absolute top-3 left-4 text-xs font-mono text-gray-600">
                            #{i + 1}
                        </span>
                        {cases.length > 1 && (
                            <button
                                type="button"
                                onClick={() => onRemove(i)}
                                className="absolute top-3 right-3 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                            <div>
                                <Label>Input</Label>
                                <textarea
                                    rows={3}
                                    placeholder={"2\n7\n2 7 11 15"}
                                    value={tc.input}
                                    onChange={(e) => onChange(i, "input", e.target.value)}
                                    className="input-field font-mono text-xs resize-y"
                                />
                            </div>
                            <div>
                                <Label>Expected Output</Label>
                                <textarea
                                    rows={3}
                                    placeholder={"1 2"}
                                    value={tc.expectedOutput}
                                    onChange={(e) => onChange(i, "expectedOutput", e.target.value)}
                                    className="input-field font-mono text-xs resize-y"
                                />
                            </div>
                        </div>
                        <div className="mt-3 w-28">
                            <Label>Score</Label>
                            <input
                                type="number"
                                min={0}
                                value={tc.score}
                                onChange={(e) => onChange(i, "score", Number(e.target.value))}
                                className="input-field"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── main page ───────────────────────────────────────────────────────────────
export default function AddProblem() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [slugLocked, setSlugLocked] = useState(false);

    const [form, setForm] = useState({
        title: "",
        slug: "",
        description: "",
        difficulty: "easy",
        languages: ["cpp", "java", "javascript", "python"],
        tags: "",
        timeLimitMs: 2000,
        memoryLimitMb: 256,
        publicTestCases: [emptyTestCase()],
        hiddenTestCases: [emptyTestCase()],
    });

    // ── field helpers ──────────────────────────────────────────────────────────
    const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

    const handleTitleChange = (e) => {
        const title = e.target.value;
        setForm((f) => ({
            ...f,
            title,
            slug: slugLocked ? f.slug : slugify(title),
        }));
    };

    const toggleLanguage = (lang) => {
        setForm((f) => ({
            ...f,
            languages: f.languages.includes(lang)
                ? f.languages.filter((l) => l !== lang)
                : [...f.languages, lang],
        }));
    };

    // ── test case helpers ──────────────────────────────────────────────────────
    const updateTC = (field, i, key, val) =>
        setForm((f) => ({
            ...f,
            [field]: f[field].map((tc, idx) => (idx === i ? { ...tc, [key]: val } : tc)),
        }));

    const addTC = (field) =>
        setForm((f) => ({ ...f, [field]: [...f[field], emptyTestCase()] }));

    const removeTC = (field, i) =>
        setForm((f) => ({ ...f, [field]: f[field].filter((_, idx) => idx !== i) }));

    // ── submit ─────────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();

        // ---- client‑side sanity checks ------------------------------------------------
        if (!form.title.trim()) {
            alert("The problem title cannot be empty.");
            return;
        }

        if (!form.slug.trim()) {
            alert("Please provide a slug or a title so one may be auto‑generated.");
            return;
        }

        if (!form.description.trim()) {
            alert("Description is required.");
            return;
        }

        if (form.languages.length === 0) {
            alert("Please select at least one language.");
            return;
        }

        const validateCases = (cases, name) => {
            for (let i = 0; i < cases.length; i++) {
                const { input, expectedOutput, score } = cases[i];
                if (!input.trim() || !expectedOutput.trim()) {
                    alert(
                        `Please fill in both input and expected output for ${name} test case #${i + 1}.`
                    );
                    return false;
                }
                if (score < 0) {
                    alert(`Score must be zero or greater for ${name} test case #${i + 1}.`);
                    return false;
                }
            }
            return true;
        };

        if (!validateCases(form.publicTestCases, "public") || !validateCases(form.hiddenTestCases, "hidden")) {
            return;
        }

        // compute the slug at submission time (handles the case where
        // the title was edited right before hitting the button but slug
        // generation was disabled/locked). this mirrors the same logic in
        // `handleTitleChange`.
        const slugVal = slugLocked ? form.slug : slugify(form.title);

        // build payload; make sure tags become an array
        const payload = {
            ...form,
            slug: slugVal,
            tags: form.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
        };

        console.log("[AddProblem] Submitting payload:", payload);
        setLoading(true);

        try {
            const res = await addProblem(payload);
            console.log("[AddProblem] Success:", res.data);
            alert("Problem created successfully!");
            navigate("/dashboard");
        } catch (err) {
            console.error("[AddProblem] Error details:", err); // includes status/code
            const msg =
                err.response?.data?.message ||
                err.response?.data ||
                "Failed to create problem.";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    // ─── render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">

            {/* Page header */}
            <div className="max-w-5xl mx-auto px-6 pt-12 pb-6">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1">
                    ＋ New Problem
                </span>
                <h1 className="text-3xl font-bold text-white mt-3 mb-1">Add Problem</h1>
                <p className="text-gray-400 text-sm">
                    Fill in the details below. Fields marked <span className="text-red-400">*</span> are required.
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-6 pb-20">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6 animate-fade-in">

                    {/* ── Basic Info ──────────────────────────────────────── */}
                    <SectionTitle>Basic Info</SectionTitle>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <Label required>Title</Label>
                            <input
                                type="text"
                                placeholder="Two Sum"
                                value={form.title}
                                onChange={handleTitleChange}
                                className="input-field"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <Label required>Slug</Label>
                                <button
                                    type="button"
                                    onClick={() => setSlugLocked((l) => !l)}
                                    className="text-xs text-gray-500 hover:text-indigo-400 transition-colors"
                                >
                                    {slugLocked ? "🔒 locked (click to auto)" : "✏️ auto-generated"}
                                </button>
                            </div>
                            <input
                                type="text"
                                placeholder="two-sum"
                                value={form.slug}
                                onChange={(e) => { setSlugLocked(true); set("slug", e.target.value); }}
                                className="input-field font-mono"
                            />
                        </div>
                    </div>

                    <div>
                        <Label required>Description</Label>
                        <textarea
                            rows={5}
                            placeholder="Describe the problem clearly…"
                            value={form.description}
                            onChange={(e) => set("description", e.target.value)}
                            className="input-field resize-y"
                        />
                    </div>

                    {/* ── Config ──────────────────────────────────────────── */}
                    <SectionTitle>Configuration</SectionTitle>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Difficulty */}
                        <div>
                            <Label required>Difficulty</Label>
                            <div className="flex gap-2 mt-1">
                                {DIFFICULTIES.map((d) => (
                                    <button
                                        key={d}
                                        type="button"
                                        onClick={() => set("difficulty", d)}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all duration-150 capitalize ${form.difficulty === d
                                            ? d === "easy"
                                                ? "bg-green-500/20 border-green-500/60 text-green-400"
                                                : d === "medium"
                                                    ? "bg-yellow-500/20 border-yellow-500/60 text-yellow-400"
                                                    : "bg-red-500/20 border-red-500/60 text-red-400"
                                            : "bg-transparent border-gray-700 text-gray-500 hover:border-gray-500"
                                            }`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Time */}
                        <div>
                            <Label required>Time Limit (ms)</Label>
                            <input
                                type="number"
                                min={100}
                                step={100}
                                value={form.timeLimitMs}
                                onChange={(e) => set("timeLimitMs", Number(e.target.value))}
                                className="input-field"
                            />
                        </div>

                        {/* Memory */}
                        <div>
                            <Label required>Memory Limit (MB)</Label>
                            <input
                                type="number"
                                min={16}
                                step={16}
                                value={form.memoryLimitMb}
                                onChange={(e) => set("memoryLimitMb", Number(e.target.value))}
                                className="input-field"
                            />
                        </div>
                    </div>

                    {/* Languages */}
                    <div>
                        <Label required>Supported Languages</Label>
                        <div className="flex gap-2 flex-wrap mt-1">
                            {LANGUAGES.map((lang) => {
                                const active = form.languages.includes(lang);
                                return (
                                    <button
                                        key={lang}
                                        type="button"
                                        onClick={() => toggleLanguage(lang)}
                                        className={`px-4 py-2 rounded-lg text-sm font-mono font-medium border transition-all duration-150 ${active
                                            ? "bg-indigo-600/30 border-indigo-500/60 text-indigo-300"
                                            : "bg-transparent border-gray-700 text-gray-500 hover:border-gray-500"
                                            }`}
                                    >
                                        {lang}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <Label>Tags <span className="text-gray-600 normal-case font-normal">(comma-separated)</span></Label>
                        <input
                            type="text"
                            placeholder="array, hash-table, two-pointers"
                            value={form.tags}
                            onChange={(e) => set("tags", e.target.value)}
                            className="input-field"
                        />
                    </div>

                    {/* ── Test Cases ──────────────────────────────────────── */}
                    <div className="border-t border-gray-800 pt-6">
                        <TestCaseBlock
                            label="Public Test Cases"
                            cases={form.publicTestCases}
                            onChange={(i, k, v) => updateTC("publicTestCases", i, k, v)}
                            onAdd={() => addTC("publicTestCases")}
                            onRemove={(i) => removeTC("publicTestCases", i)}
                        />
                    </div>

                    <div className="border-t border-gray-800 pt-6">
                        <TestCaseBlock
                            label="Hidden Test Cases"
                            cases={form.hiddenTestCases}
                            onChange={(i, k, v) => updateTC("hiddenTestCases", i, k, v)}
                            onAdd={() => addTC("hiddenTestCases")}
                            onRemove={(i) => removeTC("hiddenTestCases", i)}
                        />
                    </div>

                    {/* ── Submit ──────────────────────────────────────────── */}
                    <div className="border-t border-gray-800 pt-6 flex gap-3">
                        {/* use a submit button instead of manually attaching onClick. this
                            ensures the form's onSubmit handler runs every time (including
                            when the user presses Enter) and avoids subtle issues where the
                            click handler might not fire. */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary max-w-xs flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Creating…
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Create Problem
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/dashboard")}
                            className="btn-secondary max-w-xs"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
