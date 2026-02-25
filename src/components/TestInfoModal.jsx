import React from "react";

export default function TestInfoModal({ progress, onClose }) {
    if (!progress) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-gray-900 text-white rounded-lg max-w-xl w-full p-6 relative">
                <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-white"
                    onClick={onClose}
                >
                    ×
                </button>
                <h2 className="text-2xl font-semibold mb-4">Test Info</h2>
                <p>
                    <span className="font-medium">Email:</span> {progress.email}
                </p>
                <p>
                    <span className="font-medium">Attempted:</span>{" "}
                    {progress.attempted ? "Yes" : "No"}
                </p>

                {/* problems details */}
                {progress.problems && progress.problems.length > 0 && (
                    <div className="mt-6 space-y-4">
                        <h3 className="text-xl font-semibold">Problems</h3>
                        {progress.problems.map((prob) => (
                            <div
                                key={prob.problemId}
                                className="bg-gray-800 border border-gray-700 p-4 rounded"
                            >
                                <h4 className="font-semibold mb-1">{prob.title}</h4>
                                <p>
                                    <span className="font-medium">Problem ID:</span>{" "}
                                    {prob.problemId}
                                </p>
                                <p>
                                    <span className="font-medium">Attempted:</span>{" "}
                                    {prob.attempted ? "Yes" : "No"}
                                </p>
                                <p>
                                    <span className="font-medium">Attempts:</span>{" "}
                                    {prob.attempts}
                                </p>

                                {prob.lastAttempt && (
                                    <div className="mt-3 bg-gray-700 p-3 rounded">
                                        <h5 className="font-semibold">Last Attempt</h5>
                                        <p>
                                            <span className="font-medium">Status:</span>{" "}
                                            {prob.lastAttempt.status}
                                        </p>
                                        <p>
                                            <span className="font-medium">Score:</span>{" "}
                                            {prob.lastAttempt.score}
                                        </p>
                                        <p>
                                            <span className="font-medium">Passed:</span>{" "}
                                            {prob.lastAttempt.passed ? "Yes" : "No"}
                                        </p>
                                        <p>
                                            <span className="font-medium">Output:</span>{" "}
                                            {prob.lastAttempt.output}
                                        </p>
                                        <p>
                                            <span className="font-medium">Submitted:</span>{" "}
                                            {new Date(
                                                prob.lastAttempt.createdAt
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
