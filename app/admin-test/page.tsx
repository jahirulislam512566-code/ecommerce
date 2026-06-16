"use client";

import { useSession } from "next-auth/react";

export default function AdminTestPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading session...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Test Page</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold">Session Status:</h2>
        <p>Status: {status}</p>
        <p>Authenticated: {session ? "Yes" : "No"}</p>
        {session && (
          <>
            <p>Email: {session.user?.email}</p>
            <p>Role: {session.user?.role}</p>
            <p>Is Admin: {session.user?.role === "ADMIN" ? "✅ Yes" : "❌ No"}</p>
          </>
        )}
      </div>

      {session?.user?.role === "ADMIN" && (
        <div className="bg-green-100 p-4 rounded">
          <p className="text-green-700">✅ You are an admin! Admin panel should work.</p>
          <a href="/admin" className="text-blue-600 underline mt-2 inline-block">
            Go to Admin Panel →
          </a>
        </div>
      )}
    </div>
  );
}