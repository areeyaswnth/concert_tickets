"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/config/api";

export default function AuthPage() {
  const { role, setAuth, logout } = useAuth();
  const router = useRouter();

  const [showSignUp, setShowSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (role === "user") router.push("/user");
    if (role === "admin") router.push("/admin");
  }, [role, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/user/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed");

      if (data.role) {
        setAuth(data.access_token, data.role, data._id);
      } else {
        const meRes = await fetch(`${API_BASE_URL}/api/v1/user/auth/me`, {
          headers: { Authorization: `Bearer ${data.access_token}` },
        });
        const meData = await meRes.json();
        setAuth(data.access_token, meData.role, meData._id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/user/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "user" }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Sign Up failed");

      setAuth(data.access_token, data.role ?? "user", data._id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.main
      className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
    <h1 className="text-4xl font-bold mb-8 text-gray-900 text-center">
  Concert Tickets
</h1>

      {role === "guest" ? (
        <div className="flex flex-col gap-6 items-center w-full max-w-md">
          {showSignUp ? (
            <form
            
              onSubmit={handleSignUp}
              className="flex flex-col gap-4 bg-white p-8 rounded-lg shadow-md w-full"
            >
              <h2 className="text-2xl font-bold mb-4 ">Sign Up</h2>
              
              <input
                type="text"
                placeholder="Full Name"
                className="border p-2 rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <input
                type="email"
                placeholder="Email"
                className="border p-2 rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Password"
                className="border p-2 rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Confirm Password"
                className="border p-2 rounded"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              {error && <p className="text-red-500">{error}</p>}

              <button
                style={{ backgroundColor: "#00A58B" }}
                type="submit"
                className={`bg-green-600 text-white py-2 rounded hover:bg-green-700 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </button>

              <p
                className="text-sm mt-2 cursor-pointer text-blue-600 hover:underline"
                onClick={() => {
                  setShowSignUp(false);
                  setError("");
                  setName(""); setEmail(""); setPassword(""); setConfirmPassword("");
                }}
              >
                Already have an account? Sign In
              </p>
            </form>
          ) : (
            <form
              onSubmit={handleSignIn}
              className="flex flex-col gap-4 bg-white p-8 rounded-lg shadow-md w-full"
            >
              <h2 className="text-2xl font-bold mb-4">Sign In</h2>
              
              <input
                type="email"
                placeholder="Email"
                className="border p-2 rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Password"
                className="border p-2 rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && <p className="text-red-500">{error}</p>}

              <button
                type="submit"
                style={{ backgroundColor: "#0070A4" }}
                className={` text-white py-2 rounded hover:bg-blue-700 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>

              <p
                className="text-sm mt-2 cursor-pointer text-green-600 hover:underline"
                onClick={() => {
                  setShowSignUp(true);
                  setError("");
                  setName(""); setEmail(""); setPassword(""); setConfirmPassword("");
                }}
              >
                Don&apos;t have an account? Sign Up
              </p>
            </form>
          )}
        </div>
      ) : (
        <div className="text-center">
          <p className="mb-4">You are logged in as {role}</p>
          <button
            className="px-6 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
            onClick={logout}
          >
            Log Out
          </button>
        </div>
      )}
    </motion.main>
  );
}
