"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";
import { GithubButton } from "@/components/auth/GithubButton";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, authError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const queryError = searchParams.get("error");
    if (queryError) {
      setError(decodeURIComponent(queryError));
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === "admin") {
        router.push("/admin");
      } else if (user.role === "employer") {
        router.push("/organization/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12 bg-neutral-50/50">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl shadow-xl shadow-neutral-900/5 p-6 sm:p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-3 shadow-md shadow-neutral-900/10">
            <ShieldCheck className="w-7 h-7 text-emerald-400 stroke-[2.2]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Sign In to Talent Registry
          </h1>
          <p className="text-xs text-neutral-500 mt-1 max-w-xs">
            Access your verified Professional Passport or Organization portal
          </p>
        </div>

        {(error || authError) && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-tight">{error || authError}</span>
          </div>
        )}

        {/* GitHub OAuth Button */}
        <div className="mb-5">
          <GithubButton mode="login" />
        </div>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
            <span className="bg-white px-2 text-neutral-400 font-medium">
              or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.africa"
              className="w-full text-xs px-3.5 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 bg-white transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-neutral-800">
                Password
              </label>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs px-3.5 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 bg-white transition-all"
            />
          </div>

          <Button
            type="submit"
            loading={loading}
            size="md"
            className="w-full mt-2"
          >
            Sign In with Email
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-neutral-100 text-center text-xs text-neutral-500">
          Don’t have an account?{" "}
          <Link
            href="/auth/register"
            className="font-semibold text-neutral-900 hover:underline"
          >
            Create Professional Passport
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
