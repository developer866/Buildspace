'use client';
import { useState, useRef, FormEvent } from 'react';

export default function SignForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isSubmitting = useRef(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    const form = e.currentTarget;

    setMessage(null);
    setError(null);
    setLoading(true);

    const formData = new FormData(form);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Something went wrong');
        return;
      }

      setMessage('Account created successfully!');
      form.reset();
    } catch (err:unknown) {
      const message = err instanceof Error ? err.message : 'Network error — please try again';
      setError(message);
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-5"
      >
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Create an account</h1>
          <p className="text-sm text-slate-500 mt-1">Sign up to get started</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            name="firstName"
            placeholder="First name"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          <input
            name="lastName"
            placeholder="Last name"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Creating account...' : 'Sign up'}
        </button>

        {message && (
          <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            {message}
          </p>
        )}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <p className="text-sm text-slate-500 text-center">
          Already have an account?{' '}
          <a href="/login" className="text-slate-900 font-medium hover:underline">
            Log in
          </a>
        </p>
      </form>
    </div>
  );
}