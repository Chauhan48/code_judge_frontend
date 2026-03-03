import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar({ children, isDashboard }) {
    const navigate = useNavigate();
    const [theme, setTheme] = useState("dark");

    // Load saved theme
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") || "dark";
        setTheme(savedTheme);
        document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.classList.toggle("dark", newTheme === "dark");
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("adminName");
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 transition-colors duration-300">

            {/* NAVBAR */}
            <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/70 backdrop-blur-md sticky top-0 z-20 transition-colors duration-300">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

                    {/* Logo */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/dashboard")}>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-brand-700 flex items-center justify-center shadow-md">

                            {/* Clean Code SVG Logo */}
                            <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16l-4-4 4-4M16 8l4 4-4 4" />
                            </svg>
                        </div>
                        <span className="text-lg font-semibold tracking-tight">
                            CodeJudge
                        </span>
                    </div>

                    <div className="flex items-center gap-3">

                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-200"
                        >
                            {theme === "dark" ? (
                                // Sun Icon (for light mode switch)
                                <svg
                                    className="w-5 h-5 text-yellow-400"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <circle cx="12" cy="12" r="5" />
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                                    />
                                </svg>
                            ) : (
                                // Moon Icon (for dark mode switch)
                                <svg
                                    className="w-5 h-5 text-indigo-500"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                                    />
                                </svg>
                            )}
                        </button>

                        {/* Dashboard / Back / Logout */}
                        {isDashboard ? (
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 rounded-lg text-sm font-medium
                                text-gray-600 dark:text-gray-300
                                hover:text-black dark:hover:text-white
                                hover:bg-gray-200 dark:hover:bg-gray-800
                                transition-all duration-200"
                            >
                                Logout
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="px-4 py-2 rounded-lg text-sm font-medium
                                text-gray-600 dark:text-gray-300
                                hover:text-black dark:hover:text-white
                                hover:bg-gray-200 dark:hover:bg-gray-800
                                transition-all duration-200"
                            >
                                Back
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* PAGE CONTENT */}
            <main className="max-w-6xl mx-auto px-6 py-8 transition-colors duration-300">
                {children}
            </main>
        </div>
    );
}

export default Navbar;