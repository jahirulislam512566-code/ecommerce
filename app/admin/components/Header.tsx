'use client';

import { useSession, signOut } from 'next-auth/react';
import { LogOut, User } from 'lucide-react';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="border-b border-zinc-800 bg-zinc-950 px-8 py-4 flex items-center justify-between">
      <h2 className="text-xl font-semibold">Admin Dashboard</h2>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-medium text-sm">{session?.user?.name}</p>
            <p className="text-xs text-zinc-500">Administrator</p>
          </div>
          <div className="w-9 h-9 bg-zinc-800 rounded-full flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
        </div>
        
        <button
          onClick={() => signOut({ callbackUrl: '/auth/login' })}
          className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-900 rounded-xl text-sm"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </header>
  );
}