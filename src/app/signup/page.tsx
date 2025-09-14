"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:3000/api/v1/user/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Something went wrong");
      }

      router.push("/signin"); // สมัครเสร็จไปหน้า Sign In
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <form
        onSubmit={handleSignUp}
        className="flex flex-col gap-4 bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold text-gray-800">Sign Up</h2>

        <input
          type="text"
          placeholder="Name"
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

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>

        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          className={`bg-green-600 text-white py-2 rounded hover:bg-green-700 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
    </main>
  );
}
