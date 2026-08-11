"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {box, Flex, Text, chakra, Button, Menu, Portal } from '@chakra-ui/react';

export default function LoginForm() {
  const router = useRouter();
  const { refetchUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

      await refetchUser();
      router.push("/");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Network error — please try again";
      setError(message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-5"
      >
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome back
          </h1>
          <p className="text-sm text-slate-500 mt-1">Log in to your account</p>
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
          {loading ? "Logging in..." : "Log in"}
        </button>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <p className="text-sm text-slate-500 text-center">
          Don&apos;t have an account?{" "}
          <a
            href="/signup"
            className="text-slate-900 font-medium hover:underline"
          >
            Sign up
          </a>
        </p>
      </form>
    </div>
    
  );
}


const Newform = () =>{
  return(
    <Box>
      <Text>Import </Text>
    </Box>
  )
}