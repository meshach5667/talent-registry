"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge, VerifiedBadge, TrustScoreBadge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  Search,
  Filter,
  ShieldCheck,
  MapPin,
  Star,
  ExternalLink,
  Mail,
  X,
  SlidersHorizontal,
  CheckCircle2,
} from "lucide-react";

function TalentSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [profiles, setProfiles] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [country, setCountry] = useState(searchParams.get("country") || "All");
  const [profession, setProfession] = useState(searchParams.get("profession") || "All");
  const [skill, setSkill] = useState(searchParams.get("skill") || "All");
  const [minScore, setMinScore] = useState(searchParams.get("minScore") || 0);
  const [verifiedOnly, setVerifiedOnly] = useState(
    searchParams.get("verifiedOnly") !== "false"
  );
  const [sortBy, setSortBy] = useState("score_desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Contact Modal
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [roleOffered, setRoleOffered] = useState("");
  const [engagementType, setEngagementType] = useState("full-time");
  const [budgetRange, setBudgetRange] = useState("");
  const [contactSuccess, setContactSuccess] = useState("");
  const [contactLoading, setContactLoading] = useState(false);

  const countries = [
    "All",
    "Nigeria",
    "Kenya",
    "Ghana",
    "South Africa",
    "Egypt",
    "Rwanda",
    "Senegal",
    "Uganda",
  ];

  const professions = [
    "All",
    "Software Engineer",
    "Distributed Systems Engineer",
    "Frontend Engineer",
    "DevOps & Cloud Architect",
    "Machine Learning Engineer",
    "Security Engineer",
    "Full Stack Engineer",
  ];

  const popularSkills = [
    "All",
    "Go",
    "Kubernetes",
    "React",
    "TypeScript",
    "Python",
    "AWS",
    "Kafka",
    "PostgreSQL",
    "Terraform",
  ];

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const params = {
        q: query,
        country: country !== "All" ? country : undefined,
        profession: profession !== "All" ? profession : undefined,
        skill: skill !== "All" ? skill : undefined,
        minScore: minScore > 0 ? minScore : undefined,
        verifiedOnly: verifiedOnly ? "true" : "false",
        sort: sortBy,
        page,
        limit: 9,
      };

      const data = await api.searchProfiles(params);
      if (data.success) {
        setProfiles(data.profiles || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [country, profession, skill, minScore, verifiedOnly, sortBy, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProfiles();
  };

  const handleResetFilters = () => {
    setQuery("");
    setCountry("All");
    setProfession("All");
    setSkill("All");
    setMinScore(0);
    setVerifiedOnly(true);
    setSortBy("score_desc");
    setPage(1);
  };

  const handleOpenContact = (candidate) => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setSelectedCandidate(candidate);
    setContactSubject(`Opportunity for ${candidate.user?.name}`);
    setIsContactOpen(true);
  };

  const handleSendContact = async (e) => {
    e.preventDefault();
    setContactLoading(true);
    setContactSuccess("");

    try {
      await api.sendContactInquiry({
        professionalId: selectedCandidate.user._id,
        subject: contactSubject,
        message: contactMessage,
        roleOffered,
        engagementType,
        budgetRange,
      });

      setContactSuccess("Inquiry submitted successfully!");
      setTimeout(() => {
        setIsContactOpen(false);
        setContactSuccess("");
        setContactMessage("");
      }, 1800);
    } catch (err) {
      alert(err.message || "Failed to send inquiry");
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-neutral-50/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-200 pb-5">
          <div>
            <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
              Verified Discovery Network
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
              African Technical Talent Registry
            </h1>
            <p className="text-xs text-neutral-600 mt-1">
              Search and filter candidates by audited employer records, verified projects, and trust scores.
            </p>
          </div>

          <div className="text-xs font-mono text-neutral-500">
            Showing <span className="font-semibold text-neutral-900">{total}</span> verified candidates
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by keywords, technical stack, or candidate name..."
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
            <Button type="submit" size="md">
              Search
            </Button>
          </form>

          {/* Granular Filter Selectors */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs pt-2 border-t border-neutral-100">
            {/* Country */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                Country / Hub
              </label>
              <select
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setPage(1);
                }}
                className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-md bg-white text-xs font-medium text-neutral-800 outline-none"
              >
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c === "All" ? "All Africa" : c}
                  </option>
                ))}
              </select>
            </div>

            {/* Profession */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                Specialization
              </label>
              <select
                value={profession}
                onChange={(e) => {
                  setProfession(e.target.value);
                  setPage(1);
                }}
                className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-md bg-white text-xs font-medium text-neutral-800 outline-none"
              >
                {professions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Skill */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                Primary Skill
              </label>
              <select
                value={skill}
                onChange={(e) => {
                  setSkill(e.target.value);
                  setPage(1);
                }}
                className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-md bg-white text-xs font-medium text-neutral-800 outline-none"
              >
                {popularSkills.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Minimum Trust Score */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-neutral-600">
                  Min Trust Score: {minScore}
                </label>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="10"
                value={minScore}
                onChange={(e) => {
                  setMinScore(Number(e.target.value));
                  setPage(1);
                }}
                className="w-full accent-neutral-900 cursor-pointer h-1.5 bg-neutral-200 rounded-lg"
              />
            </div>

            {/* Sort & Reset */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                Sort Order
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-neutral-300 rounded-md bg-white text-xs font-medium text-neutral-800 outline-none"
              >
                <option value="score_desc">Reputation Score: High to Low</option>
                <option value="rating">Client Rating: Highest</option>
                <option value="newest">Recently Joined</option>
              </select>
            </div>
          </div>

          {/* Toggle verified only & Reset */}
          <div className="flex flex-wrap items-center justify-between pt-2 border-t border-neutral-100 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-neutral-800 select-none">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => {
                  setVerifiedOnly(e.target.checked);
                  setPage(1);
                }}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Show Only Candidates with Verified Work Experience
              </span>
            </label>

            <button
              onClick={handleResetFilters}
              className="text-neutral-500 hover:text-neutral-900 underline text-xs"
            >
              Reset All Filters
            </button>
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs text-neutral-500 flex flex-col items-center gap-3">
            <div className="w-7 h-7 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
            <span>Filtering audited registries...</span>
          </div>
        ) : profiles.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-xl border border-neutral-200 p-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">
              No matching verified professionals found
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Try broadening your filter criteria or unchecking the verified-only
              checkbox.
            </p>
            <Button variant="outline" size="sm" onClick={handleResetFilters}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((item) => {
              const u = item.user || {};
              const rep = item.reputation || {};
              const verifiedRoles = rep.verifiedExperienceCount || 0;

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-xl border border-neutral-200 p-5 hover:border-neutral-400 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Avatar & Reputation Gauge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={u.avatar}
                          name={u.name}
                          size="lg"
                          className="border border-neutral-200"
                        />
                        <div>
                          <h3 className="font-bold text-neutral-950 text-sm flex items-center gap-1.5">
                            {u.name}
                            {verifiedRoles > 0 && (
                              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </h3>
                          <div className="text-xs text-neutral-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-neutral-400" />
                            <span>
                              {item.city}, {item.country}
                            </span>
                          </div>
                        </div>
                      </div>

                      <TrustScoreBadge score={rep.score || 50} />
                    </div>

                    {/* Headline */}
                    <p className="text-xs text-neutral-700 font-medium line-clamp-2 mb-3 min-h-[32px]">
                      {item.headline}
                    </p>

                    {/* Verification Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {verifiedRoles > 0 ? (
                        <VerifiedBadge
                          label={`${verifiedRoles} Verified Role${verifiedRoles > 1 ? "s" : ""}`}
                          className="py-0.5 text-[10px]"
                        />
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-neutral-100 text-neutral-600 border border-neutral-200">
                          Self-Reported
                        </span>
                      )}

                      {u.githubUsername && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200 font-mono">
                          @{u.githubUsername}
                        </span>
                      )}

                      {rep.averageRating > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200">
                          <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                          {rep.averageRating} ({rep.feedbackCount || 1})
                        </span>
                      )}

                      {item.availability?.status === "available" && (
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Available Now
                        </span>
                      )}
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {item.skills?.slice(0, 5).map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 bg-neutral-50 text-neutral-700 rounded border border-neutral-200 font-medium"
                        >
                          {s.name || s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                    <Link
                      href={`/passport/${item.passportSlug || u._id}`}
                      className="text-xs font-semibold text-neutral-900 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <span>Professional Passport</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenContact(item)}
                      className="text-xs h-7.5 px-3"
                    >
                      <Mail className="w-3.5 h-3.5 mr-1" />
                      <span>Inquire</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="text-xs text-neutral-500 font-mono px-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Candidate Inquiry Modal */}
      {selectedCandidate && (
        <Modal
          isOpen={isContactOpen}
          onClose={() => setIsContactOpen(false)}
          title={`Inquire / Contact: ${selectedCandidate.user?.name}`}
          description={`Direct recruitment or consulting inquiry to ${selectedCandidate.user?.name}.`}
        >
          {contactSuccess ? (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold text-center">
              {contactSuccess}
            </div>
          ) : (
            <form onSubmit={handleSendContact} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  placeholder="e.g. Senior Backend Architect Role"
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1">
                    Engagement Type
                  </label>
                  <select
                    value={engagementType}
                    onChange={(e) => setEngagementType(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
                  >
                    <option value="full-time">Full-Time Hire</option>
                    <option value="contract">Contract</option>
                    <option value="consulting">Advisory / Consulting</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1">
                    Proposed Budget / Compensation
                  </label>
                  <input
                    type="text"
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    placeholder="e.g. $70k - $90k or $80/hr"
                    className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  Message / Role Scope
                </label>
                <textarea
                  required
                  rows={4}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Introduce your company and describe the technical challenge..."
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setIsContactOpen(false)}
                >
                  Cancel
                </Button>
                <Button size="sm" type="submit" loading={contactLoading}>
                  Send Official Inquiry
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}

export default function TalentSearchPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <TalentSearchContent />
    </React.Suspense>
  );
}

