"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { ShieldCheck, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleOAuthToken } = useAuth();

  const [status, setStatus] = useState("loading"); // 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState("");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    async function processCallback() {
      const token = searchParams.get("token");
      const error = searchParams.get("error");
      const code = searchParams.get("code");

      if (error) {
        setStatus("error");
        setErrorMessage(decodeURIComponent(error));
        return;
      }

      if (token) {
        try {
          const user = await handleOAuthToken(token);
          setUserData(user);
          setStatus("success");
          setTimeout(() => {
            if (user?.role === "admin") router.push("/admin");
            else if (user?.role === "employer") router.push("/organization/dashboard");
            else router.push("/dashboard");
          }, 1200);
        } catch (err) {
          setStatus("error");
          setErrorMessage(err.message || "Failed to finalize GitHub authentication.");
        }
        return;
      }

      if (code) {
        try {
          const res = await api.exchangeGithubCode(code);
          if (res.token) {
            const user = await handleOAuthToken(res.token);
            setUserData(user);
            setStatus("success");
            setTimeout(() => {
              if (user?.role === "admin") router.push("/admin");
              else if (user?.role === "employer") router.push("/organization/dashboard");
              else router.push("/dashboard");
            }, 1200);
          } else {
            throw new Error("No token returned from server.");
          }
        } catch (err) {
          setStatus("error");
          setErrorMessage(err.message || "Failed to exchange GitHub authorization code.");
        }
        return;
      }

      setStatus("error");
      setErrorMessage("No authorization token or code provided.");
    }

    processCallback();
  }, [searchParams, handleOAuthToken, router]);

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-16 bg-neutral-50/50">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl shadow-xl p-8 text-center relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-14 h-14 rounded-2xl bg-neutral-900 text-white flex items-center justify-center mx-auto mb-5 shadow-md shadow-neutral-900/10">
          <ShieldCheck className="w-8 h-8 text-emerald-400 stroke-[2.2]" />
        </div>

        {status === "loading" && (
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                Authenticating with GitHub
              </h2>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                Verifying your credentials and synchronizing your verified developer passport...
              </p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto animate-in zoom-in-75 duration-200">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                Welcome back, {userData?.name || "Developer"}!
              </h2>
              <p className="text-xs text-emerald-700 font-medium mt-1">
                GitHub identity verified successfully. Redirecting to your dashboard...
              </p>
            </div>
            <div className="pt-2">
              <Button
                size="sm"
                onClick={() => {
                  if (userData?.role === "admin") router.push("/admin");
                  else if (userData?.role === "employer") router.push("/organization/dashboard");
                  else router.push("/dashboard");
                }}
                className="w-full"
              >
                <span>Continue to Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                Authentication Error
              </h2>
              <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3 mt-2 font-mono">
                {errorMessage}
              </p>
            </div>
            <div className="pt-2 flex gap-3">
              <Link href="/auth/login" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  Back to Sign In
                </Button>
              </Link>
              <Link href="/auth/register" className="flex-1">
                <Button size="sm" className="w-full">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AuthCallbackContent />
    </React.Suspense>
  );
}
