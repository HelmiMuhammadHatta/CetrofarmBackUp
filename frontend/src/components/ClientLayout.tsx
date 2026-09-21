"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [session, setSession] = useState<{ departemen: string; nama: string; token: string } | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const storedSession = sessionStorage.getItem("cetro_session");
    if (storedSession) {
      setSession(JSON.parse(storedSession));
    } else if (pathname !== "/") {
      router.push("/");
    }
  }, [pathname, router]);

  const handleLogout = () => {
    sessionStorage.removeItem("cetro_session");
    setSession(null);
    router.push("/");
  };

  if (!isMounted) return null; // Prevent hydration mismatch

  if (pathname === "/") {
    return <>{children}</>;
  }

  if (!session) return null;

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1F3864] text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-wider">Cetrofarm</h1>
          <p className="text-sm text-gray-300 mt-1">Backup Portal</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link 
            href="/upload" 
            className={`block px-4 py-3 rounded transition-colors ${pathname === '/upload' ? 'bg-white/10 font-medium' : 'hover:bg-white/5'}`}
          >
            Upload Dokumen
          </Link>
          <Link 
            href="/riwayat" 
            className={`block px-4 py-3 rounded transition-colors ${pathname === '/riwayat' ? 'bg-white/10 font-medium' : 'hover:bg-white/5'}`}
          >
            Riwayat & Arsip
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-8 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Departemen: {session.departemen}</h2>
            <p className="text-sm text-gray-500">Login sebagai: {session.nama}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-sm px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-md font-medium transition-colors"
          >
            Logout
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
