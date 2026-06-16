"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"

export function UserMenu() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span>Welcome, {session.user?.name || session.user?.email}</span>
        <button
          onClick={() => signOut()}
          className="text-red-600 hover:text-red-700"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-4">
      <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700">
        Sign In
      </Link>
      <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700">
        Sign Up
      </Link>
    </div>
  )
}