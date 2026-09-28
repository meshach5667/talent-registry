"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight, Lock, KeyRound, CheckCircle2 } from "lucide-react";

export default function VerificationCenterPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [tokenInput, setTokenInput] = useState("");

  const handleLookup = (e) => {
    e.preventDefault();
    if (tokenInput.trim()) {
      router.push(`/verification/${tokenInput.trim()}`);
    }
  };

  return (
    <div className="flex-1 bg-neutral-50/50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7 text-emerald-400 stroke-[2.5]" />
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-950 tracking-tight">
            Verification Protocol Center
          </h1>
          <p className="text-sm text-neutral-600 max-w-lg mx-auto">
            Audit, certify, and manage professional experience claims across Africa's tech ecosystem.
          </p>
        </div>

        {/* Token Lookup Box */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/90 shadow-lg shadow-neutral-900/5 max-w-xl mx-auto">
          <h2 className="text-sm font-bold text-neutral-900 mb-1 flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-emerald-600" />
            <span>Have a Verification Request Token?</span>
          </h2>
          <p className="text-xs text-neutral-500 mb-4">
            Enter the unique review token from your employer verification email to review a candidate's claim.
          </p>

          <form onSubmit={handleLookup} className="flex gap-2">
            <input
              type="text"
              required
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Enter unique verification token"
              className="flex-1 text-xs px-3.5 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono transition-all"
            />
            <Button type="submit" size="md">
              Audit Claim
            </Button>
          </form>
        </div>

        {/* 3 Step Protocol Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs card-hover-lift">
            <div className="text-xs font-mono font-bold text-neutral-400 mb-2">01. INITIATION</div>
            <h3 className="text-sm font-bold text-neutral-900 mb-1">Professional Claim</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Professional documents employment role, stack, and metrics on their dashboard and issues an audit request.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border-2 border-emerald-300 ring-4 ring-emerald-500/10 shadow-xs card-hover-lift">
            <div className="text-xs font-mono font-bold text-emerald-700 mb-2">02. AUDIT</div>
            <h3 className="text-sm font-bold text-neutral-900 mb-1">Employer Review</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Verified employer validates tenure, rates competencies, and signs with institutional verification code.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs card-hover-lift">
            <div className="text-xs font-mono font-bold text-neutral-400 mb-2">03. IMMUTABILITY</div>
            <h3 className="text-sm font-bold text-neutral-900 mb-1">Verified Badge</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              The Professional Passport updates automatically with the official Verified Badge and recalculated trust score.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center pt-2">
          {user ? (
            <Link href="/dashboard">
              <Button size="md">Go to Your Dashboard →</Button>
            </Link>
          ) : (
            <Link href="/auth/register">
              <Button size="md">Create Professional Passport →</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
