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
    <div className="flex h-screen text-ink">
      {/* Sidebar */}
      <aside className="w-64 bg-forest text-cream flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-wider">Cetrofarm</h1>
          <p className="text-sm text-cream/80 mt-1">Backup Portal</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link 
            href="/upload" 
            className={`block px-4 py-3 rounded transition-colors ${pathname === '/upload' ? 'bg-cream/10 font-medium' : 'hover:bg-cream/5'}`}
          >
            Upload Dokumen
          </Link>
          <Link 
            href="/riwayat" 
            className={`block px-4 py-3 rounded transition-colors ${pathname === '/riwayat' ? 'bg-cream/10 font-medium' : 'hover:bg-cream/5'}`}
          >
            Riwayat & Arsip
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-cream-dark/30 shadow-sm border-b border-sage/30 px-8 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-forest-dark">Departemen: {session.departemen}</h2>
            <p className="text-sm text-forest">Login sebagai: {session.nama}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-sm px-4 py-2 border border-harvest text-harvest hover:bg-harvest hover:text-cream rounded-md font-medium transition-colors"
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
