"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, DEMO_ACCOUNTS } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight, Zap, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, quickDemoLogin, authError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handleDemo = async (key) => {
    setError("");
    setLoading(true);
    try {
      const user = await quickDemoLogin(key);
      if (user.role === "admin") router.push("/admin");
      else if (user.role === "employer") router.push("/organization/dashboard");
      else router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12 bg-neutral-50/50">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-xl shadow-xs p-6 sm:p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-10 h-10 rounded bg-neutral-900 text-white flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400 stroke-[2.5]" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            Sign In to Talent Registry
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Access your verified Professional Passport or Organization portal
          </p>
        </div>

        {/* 1-Click Demo Accounts Bar */}
        <div className="mb-6 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800 mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Instant Demo Access</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleDemo("professional")}
              className="px-2 py-1.5 bg-white border border-neutral-200 hover:border-neutral-400 rounded text-[11px] font-medium text-neutral-800 text-center transition-colors"
            >
              Professional
            </button>
            <button
              type="button"
              onClick={() => handleDemo("employer")}
              className="px-2 py-1.5 bg-white border border-neutral-200 hover:border-neutral-400 rounded text-[11px] font-medium text-neutral-800 text-center transition-colors"
            >
              Employer
            </button>
            <button
              type="button"
              onClick={() => handleDemo("admin")}
              className="px-2 py-1.5 bg-white border border-neutral-200 hover:border-neutral-400 rounded text-[11px] font-medium text-neutral-800 text-center transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

        {(error || authError) && (
          <div className="mb-4 p-3 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error || authError}</span>
          </div>
        )}

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
              className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
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
              className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
            />
          </div>

          <Button
            type="submit"
            loading={loading}
            size="md"
            className="w-full mt-2"
          >
            Sign In
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
