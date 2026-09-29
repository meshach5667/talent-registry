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
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, TrustScoreBadge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import api from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [spotlight, setSpotlight] = useState([]);
  const [stats, setStats] = useState({
    totalTalent: 6,
    totalExperiences: 8,
    totalProjects: 12,
    averageRating: "5.0",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getSpotlight();
        if (data.success) {
          if (data.spotlight?.length > 0) setSpotlight(data.spotlight);
          if (data.stats) setStats(data.stats);
        }
      } catch {
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
      <section className="relative overflow-hidden border-b border-neutral-200/80 bg-gradient-to-b from-neutral-50 via-white to-neutral-50/50 py-20 sm:py-28">
        {/* Subtle Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-100/40 via-transparent to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-950 tracking-tight leading-[1.1]">
              Showcase your real engineering impact.{" "}
              <span className="relative inline-block text-neutral-900 underline decoration-emerald-500 decoration-4 underline-offset-8">
                Stand out.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg lg:text-xl text-neutral-600 leading-relaxed font-normal">
              The discovery and reputation network for Africa’s top software engineers, system architects, and technical leaders. Turn your direct experience, projects, and client endorsements into a shareable Professional Passport.
            </p>

            {/* Live Search Bar */}
            <form
              onSubmit={handleHeroSearch}
              className="mt-8 bg-white p-2 rounded-2xl border border-neutral-300 shadow-lg shadow-neutral-900/5 flex flex-col sm:flex-row gap-2 max-w-2xl hover:border-neutral-400 transition-all"
            >
              <div className="flex-1 flex items-center px-3.5 gap-2.5 border-b sm:border-b-0 sm:border-r border-neutral-200 py-2 sm:py-0">
                <Search className="w-4 h-4 text-neutral-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search skills, roles (e.g. Go, Kubernetes, Fintech)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs sm:text-sm outline-none placeholder:text-neutral-400 text-neutral-900 bg-transparent font-medium"
                />
              </div>

              <div className="flex items-center px-3 py-1.5 sm:py-0">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="text-xs text-neutral-700 bg-transparent outline-none font-semibold pr-2 cursor-pointer"
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

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
              <span className="font-semibold text-neutral-700">Popular searches:</span>
              <Link
                href="/talent?skill=Go"
                className="px-2.5 py-0.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-950 transition-colors font-medium border border-neutral-200/60"
              >
                Go (Golang)
              </Link>
              <Link
                href="/talent?skill=Kubernetes"
                className="px-2.5 py-0.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-950 transition-colors font-medium border border-neutral-200/60"
              >
                Kubernetes
              </Link>
              <Link
                href="/talent?country=Ghana"
                className="px-2.5 py-0.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-950 transition-colors font-medium border border-neutral-200/60"
              >
                Ghana Engineers
              </Link>
              <Link
                href="/talent?country=Kenya"
                className="px-2.5 py-0.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-950 transition-colors font-medium border border-neutral-200/60"
              >
                Kenya Cloud Leads
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Platform Metric Counters */}
      <section className="border-b border-neutral-200/80 bg-white py-10 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/70 border-l-4 border-l-neutral-900">
              <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
                {stats.totalTalent || 6}+
              </div>
              <div className="text-[11px] text-neutral-600 uppercase tracking-wider font-semibold mt-1">
                Active Engineers
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 border-l-4 border-l-emerald-600">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950 tracking-tight">
                {stats.averageRating || "5.0"}
              </div>
              <div className="text-[11px] text-emerald-800 uppercase tracking-wider font-semibold mt-1">
                Average Client Rating
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/70 border-l-4 border-l-neutral-900">
              <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
                8+
              </div>
              <div className="text-[11px] text-neutral-600 uppercase tracking-wider font-semibold mt-1">
                African Tech Hubs
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 border-l-4 border-l-emerald-600">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950 tracking-tight">
                100%
              </div>
              <div className="text-[11px] text-emerald-800 uppercase tracking-wider font-semibold mt-1">
                Transparent Profiles
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works */}
      <section id="how-it-works" className="border-b border-neutral-200/80 bg-neutral-50/60 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Transparent Discovery</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight">
              How Talent Registry Works
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-600 leading-relaxed">
              A transparent discovery workflow that highlights engineering depth, project deliverables, and authentic client feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white p-7 rounded-2xl border border-neutral-200/80 shadow-xs relative card-hover-lift">
              <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white font-extrabold flex items-center justify-center text-sm mb-5 shadow-xs">
                01
              </div>
              <h3 className="text-base font-bold text-neutral-950 mb-2">
                Document Roles & Projects
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Professionals directly record their work history, roles, technical stack, key projects, and live portfolio links.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-7 rounded-2xl border-2 border-emerald-300 shadow-md shadow-emerald-500/5 relative card-hover-lift ring-4 ring-emerald-500/10">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm mb-5 shadow-xs">
                02
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-neutral-950">
                  Earn Client Feedback
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold">
                  Authentic
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Clients and employers submit transparent reviews and performance ratings upon completed engagements and project milestones.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-7 rounded-2xl border border-neutral-200/80 shadow-xs relative card-hover-lift">
              <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white font-extrabold flex items-center justify-center text-sm mb-5 shadow-xs">
                03
              </div>
              <h3 className="text-base font-bold text-neutral-950 mb-2">
                Unified Professional Passport
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Your unified profile, reputation score, completed deliverables, and client endorsements are consolidated into a shareable passport link.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Verified Talent Spotlight */}
      <section className="border-b border-neutral-200/80 bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Talent Spotlight</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-950 tracking-tight">
                African Technical Talent Spotlight
              </h2>
              <p className="mt-1.5 text-sm text-neutral-600">
                Engineers with proven track records across Africa’s leading tech ecosystems.
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
                  className="bg-white rounded-2xl border border-neutral-200 p-6 hover:border-emerald-500/40 card-hover-lift flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Avatar + Trust Score */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={u?.avatar}
                          name={u?.name}
                          size="lg"
                          className="border border-neutral-200 ring-2 ring-neutral-100"
                        />
                        <div>
                          <h3 className="font-bold text-neutral-950 text-base">
                            {u?.name}
                          </h3>
                          <div className="text-xs text-neutral-500 font-medium">
                            {item.city}, {item.country}
                          </div>
                        </div>
                      </div>

                      <TrustScoreBadge score={rep.score || 88} />
                    </div>

                    {/* Headline */}
                    <p className="text-xs sm:text-sm text-neutral-700 font-medium line-clamp-2 mb-3">
                      {item.headline}
                    </p>

                    {/* Candidate Info Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {item.yearsOfExperience > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-700 bg-neutral-100 px-2.5 py-0.5 rounded-full border border-neutral-200">
                          {item.yearsOfExperience}+ Yrs Exp
                        </span>
                      )}
                      {rep.completedJobs > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          {rep.completedJobs} Completed Jobs
                        </span>
                      )}
                      {rep.averageRating > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          {rep.averageRating}
                        </span>
                      )}
                      {u?.githubUsername && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200 font-mono">
                          @{u.githubUsername}
                        </span>
                      )}
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {item.skills?.slice(0, 4).map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2.5 py-0.5 bg-neutral-100 text-neutral-700 font-medium rounded-md border border-neutral-200/80"
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
                      className="text-xs font-bold text-neutral-900 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                    >
                      <span>Professional Passport</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <Link href={`/talent?q=${encodeURIComponent(u?.name || "")}`}>
                      <span className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 transition-colors">
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

      {/* 5. Organizations Ticker */}
      <section className="border-b border-neutral-200/80 bg-neutral-50/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-8">
            Companies & Startups Represented Across The Registry
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-neutral-800 font-bold text-sm">
            {["Paystack", "Flutterwave", "Safaricom PLC", "Andela", "Yoco", "Moniepoint"].map((org) => (
              <div
                key={org}
                className="bg-white p-3.5 rounded-xl border border-neutral-200/80 shadow-2xs flex items-center justify-center gap-2 hover:border-emerald-300 transition-colors"
              >
                <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">{org}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Call to Action */}
      <section className="relative overflow-hidden bg-neutral-950 text-white py-20 sm:py-28">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-semibold mb-6">
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            <span>Join 100+ African Tech Professionals</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Ready to showcase your engineering impact?
          </h2>
          <p className="mt-5 text-neutral-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Create your free Professional Passport today. Add your work history, link your projects, and stand out to top global and African employers.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-neutral-950 hover:bg-neutral-100 shadow-xl font-bold">
                Claim Your Passport URL
              </Button>
            </Link>
            <Link href="/talent">
              <Button
                variant="outline"
                size="lg"
                className="text-white border-neutral-700 bg-neutral-900/60 hover:bg-neutral-800 font-semibold"
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
