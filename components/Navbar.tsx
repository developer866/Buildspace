'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
    router.push('/login');
  };

  if (loading) {
    return <nav className="h-16 border-b border-slate-200 bg-white" />;
  }

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
      <Link href="/" className="font-semibold text-slate-900">
        MyApp
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            Logout
          </button>
        ) : (
          <>
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">
              Login
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}