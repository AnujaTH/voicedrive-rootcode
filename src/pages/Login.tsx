import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const demoUsers = [
  { email: "admin@gmail.com", password: "admin123", role: "admin" },
  { email: "examiner@gmail.com", password: "examiner123", role: "examiner" },
];

export default function Login() {
  const [mode, setMode] = useState<"admin" | "candidate">("admin");
  // Admin/Examiner login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // Candidate login state
  const [code, setCode] = useState("");
  const [candidate, setCandidate] = useState(null);
  const [candidateError, setCandidateError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    setError("");
    setSuccess("");
    setCandidateError("");
    setCandidate(null);
  }, [mode]);

  React.useEffect(() => {
    if (location.search.includes("signup=1")) {
      setSuccess("Signup successful! Please log in.");
    }
  }, [location.search]);

  // Admin/Examiner login
  const handleLogin = (e) => {
    e.preventDefault();
    const users = [
      ...demoUsers,
      ...JSON.parse(localStorage.getItem("users") || "[]"),
    ];
    const user = users.find(
      (u) => u.email === email && u.password === password
    );
    if (!user) {
      setError("Invalid email or password");
      return;
    }
    localStorage.setItem(
      "user",
      JSON.stringify({ email: user.email, role: user.role })
    );
    if (user.role === "admin" || user.role === "examiner") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };

  // Candidate code login
  const handleCandidateCheck = (e) => {
    e.preventDefault();
    const candidates = JSON.parse(localStorage.getItem("candidates") || "[]");
    const found = candidates.find(
      (c) => c.code && c.code.toUpperCase() === code.trim().toUpperCase()
    );
    if (!found) {
      setCandidateError("Invalid code. Please check and try again.");
      setCandidate(null);
      return;
    }
    setCandidate(found);
    setCandidateError("");
  };

  const handleCandidateStart = () => {
    localStorage.setItem("candidate", JSON.stringify(candidate));
    navigate("/"); // or to a dedicated exam page if needed
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="flex gap-2 mb-6">
          <button
            className={`flex-1 py-2 rounded font-semibold ${
              mode === "admin"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setMode("admin")}
          >
            Admin/Examiner
          </button>
          <button
            className={`flex-1 py-2 rounded font-semibold ${
              mode === "candidate"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setMode("candidate")}
          >
            Candidate
          </button>
        </div>
        {mode === "admin" ? (
          <>
            <h1 className="text-2xl font-bold mb-4 text-center">
              Admin/Examiner Login
            </h1>
            <form className="flex flex-col gap-4" onSubmit={handleLogin}>
              <div>
                <label className="block font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border rounded px-3 py-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Password</label>
                <input
                  type="password"
                  className="w-full border rounded px-3 py-2"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              {success && (
                <div className="text-green-600 text-sm">{success}</div>
              )}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
              >
                Login
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-4 text-center">
              Candidate Login
            </h1>
            <form
              className="flex flex-col gap-4"
              onSubmit={handleCandidateCheck}
            >
              <div>
                <label className="block font-medium mb-1">
                  Enter Your Exam Code
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-lg font-mono tracking-widest"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  maxLength={8}
                  autoFocus
                />
              </div>
              {candidateError && (
                <div className="text-red-600 text-sm">{candidateError}</div>
              )}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
              >
                Check Code
              </button>
            </form>
            {candidate && (
              <div className="mt-6 bg-gray-50 p-4 rounded shadow text-center">
                <div className="mb-2 text-lg font-semibold">
                  Welcome, {candidate.name}!
                </div>
                {candidate.photo && (
                  <img
                    src={candidate.photo}
                    alt=""
                    className="mx-auto h-20 rounded mb-2"
                  />
                )}
                <div className="mb-2 text-gray-600">
                  NIC/ID: {candidate.nic}
                </div>
                <div className="mb-4 text-gray-600">
                  Code:{" "}
                  <span className="font-mono text-lg">{candidate.code}</span>
                </div>
                <button
                  className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 transition"
                  onClick={handleCandidateStart}
                >
                  Start Exam
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
