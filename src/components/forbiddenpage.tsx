"use client";

import { useRouter } from "next/navigation";

type ForbiddenProps = {
  redirectPath?: string;
};

export default function Forbidden({ redirectPath = "/" }: ForbiddenProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800 px-4">
      <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>
      <h2 className="text-2xl font-semibold mb-2">Forbidden</h2>
      <p className="text-gray-600 mb-6">You don&apos;t have permission to access this page.</p>
      <button
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        onClick={() => router.push(redirectPath)}
      >
        Go Home
      </button>
    </div>
  );
}
