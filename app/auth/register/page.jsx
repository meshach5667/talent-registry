"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { ShieldCheck, AlertCircle, Building2, User, UserCheck } from "lucide-react";
import { GithubButton } from "@/components/auth/GithubButton";

export default function RegisterPage() {
  const router = useRouter();
  const { register, authError } = useAuth();

  const [role, setRole] = useState("professional");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [city, setCity] = useState("Lagos");
  const [headline, setHeadline] = useState("");
  const [profession, setProfession] = useState("Digital Professional");
  const [organizationName, setOrganizationName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await register({
        name,
        email,
        password,
        role,
        country,
        city,
        headline,
        profession,
        organizationName,
      });

      if (user.role === "admin") router.push("/admin");
      else if (user.role === "employer") router.push("/organization/dashboard");
      else router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const countries = [
    "Nigeria",
    "Kenya",
    "Ghana",
    "South Africa",
    "Rwanda",
    "Egypt",
    "Senegal",
    "Uganda",
    "Ethiopia",
    "Tanzania",
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12 bg-neutral-50/50">
      <div className="w-full max-w-lg bg-white border border-neutral-200 rounded-2xl shadow-xl shadow-neutral-900/5 p-6 sm:p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-3 shadow-md shadow-neutral-900/10">
            <ShieldCheck className="w-7 h-7 text-emerald-400 stroke-[2.2]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm">
            Join Africa's premier talent registry & professional discovery network for digital creators, writers, designers, and technical talent.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-6 p-1.5 bg-neutral-100/80 rounded-xl border border-neutral-200/60">
          <button
            type="button"
            onClick={() => setRole("professional")}
            className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              role === "professional"
                ? "bg-white text-neutral-950 shadow-xs border border-neutral-200/50"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Professional</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("employer")}
            className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              role === "employer"
                ? "bg-white text-neutral-950 shadow-xs border border-neutral-200/50"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Employer / Org</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("admin")}
            className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              role === "admin"
                ? "bg-white text-neutral-950 shadow-xs border border-neutral-200/50"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {(error || authError) && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-tight">{error || authError}</span>
          </div>
        )}

        {/* GitHub Signup Option for Professionals */}
        {role === "professional" && (
          <div className="mb-5">
            <GithubButton mode="register" />

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                <span className="bg-white px-2 text-neutral-400 font-medium">
                  or register manually
                </span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kwesi Appiah"
                className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.africa"
                className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1">
              Password (min 6 characters)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
              >
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                City / Hub
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Accra, Lagos, Nairobi"
                className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
              />
            </div>
          </div>

          {role === "professional" && (
            <div className="space-y-4 pt-2 border-t border-neutral-100">
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  Primary Profession
                </label>
                <input
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="e.g. Technical Writer, UI/UX Designer, or Software Engineer"
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  Professional Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Content Strategist & Writer | Developer Docs & Fintech"
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
                />
              </div>
            </div>
          )}

          {role === "employer" && (
            <div className="pt-2 border-t border-neutral-100">
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Company / Organization Name
              </label>
              <input
                type="text"
                required
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="e.g. Moniepoint, Flutterwave, Safaricom"
                className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
              />
            </div>
          )}

          <Button
            type="submit"
            loading={loading}
            size="md"
            className="w-full mt-3"
          >
            Create {role === "employer" ? "Organization" : role === "admin" ? "Admin" : "Professional"} Account
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-neutral-100 text-center text-xs text-neutral-500">
          Already registered?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-neutral-900 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
