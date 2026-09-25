"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Search,
  ArrowRight,
  CheckCircle2,
  Lock,
  Building2,
  Users,
  Award,
  Globe2,
  Star,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, VerifiedBadge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import api from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [spotlight, setSpotlight] = useState([]);
  const [stats, setStats] = useState({
    totalTalent: 6,
    verifiedTalent: 5,
    totalExperiences: 8,
    verifiedExperiences: 6,
    verificationRate: 75,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getSpotlight();
        if (data.success) {
          if (data.spotlight?.length > 0) setSpotlight(data.spotlight);
          if (data.stats) setStats(data.stats);
        }
      } catch (err) {
        // Fallback default
      }
    }
    loadData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append("q", searchQuery.trim());
    if (selectedCountry !== "All") params.append("country", selectedCountry);
    router.push(`/talent?${params.toString()}`);
  };

  const countries = ["All", "Nigeria", "Kenya", "Ghana", "South Africa", "Egypt", "Rwanda"];

  return (
    <div className="flex flex-col w-full">
      {/* 1. Hero Section */}
      <section className="border-b border-neutral-200 bg-neutral-50/50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold mb-6">
              <ShieldCheck className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
              <span>Pan-African Professional Verification Protocol</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-950 tracking-tight leading-[1.1]">
              Don’t just claim your experience.{" "}
              <span className="text-neutral-900 underline decoration-emerald-500 decoration-4 underline-offset-8">
                Prove it.
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-neutral-600 leading-relaxed font-normal">
              The official verification and discovery platform for Africa’s top
              software engineers, system architects, and technical leaders.
              Turn self-attested resumes into cryptographically audited
              Professional Passports.
            </p>

            {/* Live Search Bar */}
            <form
              onSubmit={handleHeroSearch}
              className="mt-8 bg-white p-2 rounded-xl border border-neutral-300 shadow-sm flex flex-col sm:flex-row gap-2 max-w-2xl"
            >
              <div className="flex-1 flex items-center px-3 gap-2 border-b sm:border-b-0 sm:border-r border-neutral-200 py-1.5 sm:py-0">
                <Search className="w-4 h-4 text-neutral-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search skills, roles (e.g. Go, Kubernetes, Fintech)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm outline-none placeholder:text-neutral-400 text-neutral-900 bg-transparent"
                />
              </div>

              <div className="flex items-center px-2 py-1 sm:py-0">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="text-xs text-neutral-700 bg-transparent outline-none font-medium pr-2 cursor-pointer"
                >
                  {countries.map((c) => (
                    <option key={c} value={c}>
                      {c === "All" ? "All Africa" : c}
                    </option>
                  ))}
                </select>
              </div>

              <Button type="submit" size="md" className="shrink-0">
                <span>Discover Talent</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-neutral-500">
              <span className="font-medium text-neutral-700">Popular searches:</span>
              <Link href="/talent?skill=Go" className="hover:text-neutral-900 underline">
                Go (Golang)
              </Link>
              <Link href="/talent?skill=Kubernetes" className="hover:text-neutral-900 underline">
                Kubernetes
              </Link>
              <Link href="/talent?country=Ghana" className="hover:text-neutral-900 underline">
                Ghana Engineers
              </Link>
              <Link href="/talent?country=Kenya" className="hover:text-neutral-900 underline">
                Kenya Cloud Leads
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Platform Metric Counters */}
      <section className="border-b border-neutral-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="border-l-2 border-neutral-900 pl-4">
              <div className="text-2xl sm:text-3xl font-bold text-neutral-900">
                100%
              </div>
              <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium mt-0.5">
                Employer Verified Work
              </div>
            </div>

            <div className="border-l-2 border-emerald-600 pl-4">
              <div className="text-2xl sm:text-3xl font-bold text-neutral-900">
                {stats.verifiedTalent}+
              </div>
              <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium mt-0.5">
                Verified Technical Leaders
              </div>
            </div>

            <div className="border-l-2 border-neutral-900 pl-4">
              <div className="text-2xl sm:text-3xl font-bold text-neutral-900">
                5+
              </div>
              <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium mt-0.5">
                Key African Tech Hubs
              </div>
            </div>

            <div className="border-l-2 border-emerald-600 pl-4">
              <div className="text-2xl sm:text-3xl font-bold text-neutral-900">
                0
              </div>
              <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium mt-0.5">
                Unchecked Resume Claims
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Core Verification Protocol: How It Works */}
      <section id="how-it-works" className="border-b border-neutral-200 bg-neutral-50/50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
              The Protocol
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              How Professional Verification Works
            </h2>
            <p className="mt-3 text-sm text-neutral-600">
              A transparent, closed-loop verification workflow that eliminates resume fraud and certifies high-impact engineering accomplishments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-900 font-bold flex items-center justify-center text-sm mb-5">
                01
              </div>
              <h3 className="text-base font-semibold text-neutral-900 mb-2">
                Document Role & Project Metrics
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                The professional records their role, dates, tech stack, and measurable accomplishments (e.g. uptime metrics, latency reductions, volume processed).
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-xl border border-emerald-200 shadow-xs relative ring-1 ring-emerald-500/20">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold flex items-center justify-center text-sm mb-5">
                02
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-neutral-900">
                  Manager Review & Confirmation
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold">
                  Required
                </span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                A verification link is dispatched to the manager, CTO, or authorized employer. They audit the claim, submit performance ratings, and sign off.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-900 font-bold flex items-center justify-center text-sm mb-5">
                03
              </div>
              <h3 className="text-base font-semibold text-neutral-900 mb-2">
                Cryptographic Badge & Passport
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                The credential is locked with an immutable verification reference code. A verified badge and trust index are stamped on the shareable Professional Passport.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Verified Talent Spotlight */}
      <section className="border-b border-neutral-200 bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                Verified Leaders
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                African Technical Talent Spotlight
              </h2>
              <p className="mt-1 text-sm text-neutral-600">
                Engineers with proven track records at Africa’s leading fintechs and tech giants.
              </p>
            </div>

            <Link href="/talent">
              <Button variant="outline" size="sm">
                <span>View All Candidates</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spotlight.slice(0, 6).map((item) => {
              const u = item.user;
              const rep = item.reputation || {};
              return (
                <div
                  key={item._id}
                  className="bg-white rounded-xl border border-neutral-200 p-5 hover:border-neutral-400 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Avatar + Trust Score */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={u?.avatar}
                          name={u?.name}
                          size="lg"
                          className="border border-neutral-200"
                        />
                        <div>
                          <h3 className="font-bold text-neutral-950 text-base flex items-center gap-1.5">
                            {u?.name}
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          </h3>
                          <div className="text-xs text-neutral-500 font-medium">
                            {item.city}, {item.country}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-neutral-400 font-mono">Trust Score</div>
                        <div className="text-lg font-extrabold text-neutral-900">
                          {rep.score || 85}
                          <span className="text-xs text-neutral-400 font-normal">/100</span>
                        </div>
                      </div>
                    </div>

                    {/* Headline */}
                    <p className="text-xs text-neutral-700 font-medium line-clamp-2 mb-3">
                      {item.headline}
                    </p>

                    {/* Verified Badges Pill */}
                    <div className="flex items-center gap-2 mb-4">
                      <VerifiedBadge
                        label={`${rep.verifiedExperienceCount || 1} Verified Role${(rep.verifiedExperienceCount || 1) > 1 ? "s" : ""}`}
                        className="py-0.5 text-[11px]"
                      />
                      {rep.averageRating > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          {rep.averageRating}
                        </span>
                      )}
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {item.skills?.slice(0, 4).map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded border border-neutral-200"
                        >
                          {s.name || s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                    <Link
                      href={`/passport/${item.passportSlug || u?._id}`}
                      className="text-xs font-semibold text-neutral-900 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <span>Professional Passport</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <Link href={`/talent?q=${encodeURIComponent(u?.name || "")}`}>
                      <span className="text-[11px] text-neutral-500 hover:text-neutral-800">
                        Inquire →
                      </span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Verified Organizations Ticker */}
      <section className="border-b border-neutral-200 bg-neutral-50/50 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-6">
            Organizations Verifying Experience On The Registry
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-neutral-800 font-semibold text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Paystack</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Flutterwave</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Safaricom PLC</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Andela</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Yoco</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Moniepoint</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call to Action */}
      <section className="bg-neutral-900 text-white py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to prove your engineering impact?
          </h2>
          <p className="mt-4 text-neutral-400 text-sm sm:text-base max-w-xl mx-auto">
            Create your free Professional Passport today. Submit your first role
            for peer or manager verification and stand out to top global and
            African employers.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-neutral-950 hover:bg-neutral-100">
                Claim Your Passport URL
              </Button>
            </Link>
            <Link href="/talent">
              <Button
                variant="outline"
                size="lg"
                className="text-white border-neutral-700 bg-neutral-800 hover:bg-neutral-700"
              >
                Explore Talent Registry
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
