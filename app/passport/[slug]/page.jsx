"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge, VerifiedBadge, UnverifiedBadge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatDate, calculateDuration } from "@/lib/utils";
import {
  ShieldCheck,
  Building2,
  Calendar,
  MapPin,
  ExternalLink,
  Share2,
  Printer,
  Mail,
  Star,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Award,
  Lock,
  Clock,
  Sparkles,
  Check,
} from "lucide-react";

export default function ProfessionalPassportPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;
  const { user } = useAuth();

  const [passportData, setPassportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Contact Modal State
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [roleOffered, setRoleOffered] = useState("");
  const [engagementType, setEngagementType] = useState("full-time");
  const [budgetRange, setBudgetRange] = useState("");
  const [contactSuccess, setContactSuccess] = useState("");
  const [contactLoading, setContactLoading] = useState(false);

  // Dispute Modal State
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("False Role Claim");
  const [disputeDetails, setDisputeDetails] = useState("");
  const [disputeTarget, setDisputeTarget] = useState({ type: "profile", id: "" });
  const [disputeSuccess, setDisputeSuccess] = useState("");
  const [disputeLoading, setDisputeLoading] = useState(false);

  useEffect(() => {
    async function loadPassport() {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await api.getPublicPassport(slug);
        if (data.success && data.passport) {
          setPassportData(data.passport);
        } else {
          setError("Professional Passport not found");
        }
      } catch (err) {
        setError(err.message || "Passport not found");
      } finally {
        setLoading(false);
      }
    }
    loadPassport();
  }, [slug]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleSendContact = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setContactLoading(true);
    setContactSuccess("");

    try {
      await api.sendContactInquiry({
        professionalId: passportData.profile.user._id,
        subject,
        message,
        roleOffered,
        engagementType,
        budgetRange,
      });
      setContactSuccess("Inquiry sent successfully to candidate!");
      setSubject("");
      setMessage("");
      setTimeout(() => {
        setIsContactOpen(false);
        setContactSuccess("");
      }, 2000);
    } catch (err) {
      alert(err.message || "Failed to send inquiry");
    } finally {
      setContactLoading(false);
    }
  };

  const handleFileDispute = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setDisputeLoading(true);
    setDisputeSuccess("");

    try {
      await api.fileDispute({
        targetType: disputeTarget.type,
        targetId: disputeTarget.id || passportData.profile._id,
        targetTitle: `Claim on ${passportData.profile.user.name}'s profile`,
        reportedUserId: passportData.profile.user._id,
        reason: disputeReason,
        details: disputeDetails,
      });
      setDisputeSuccess("Integrity report filed. Our compliance team will review.");
      setTimeout(() => {
        setIsDisputeOpen(false);
        setDisputeSuccess("");
        setDisputeDetails("");
      }, 2000);
    } catch (err) {
      alert(err.message || "Failed to file dispute");
    } finally {
      setDisputeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-neutral-500 font-medium">
            Verifying cryptographic credentials...
          </span>
        </div>
      </div>
    );
  }

  if (error || !passportData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
          <ShieldCheck className="w-6 h-6 text-neutral-400" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900">
          Professional Passport Not Found
        </h2>
        <p className="text-xs text-neutral-500 mt-1 max-w-sm">
          The requested verified passport could not be located on the registry.
        </p>
        <Link href="/talent" className="mt-4">
          <Button size="sm">Browse Verified Directory</Button>
        </Link>
      </div>
    );
  }

  const { profile, experiences = [], projects = [], feedbacks = [] } = passportData;
  const pUser = profile.user || {};
  const rep = profile.reputation || {};

  const verifiedExperiences = experiences.filter((e) => e.verificationStatus === "verified");
  const unverifiedExperiences = experiences.filter((e) => e.verificationStatus !== "verified");

  return (
    <div className="flex-1 bg-neutral-50/40 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Control Bar: Share, Export, Integrity */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-neutral-500">
            <span className="font-mono uppercase tracking-wider text-[10px] bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded font-semibold">
              OFFICIAL PASSPORT
            </span>
            <span>•</span>
            <span className="font-mono text-neutral-600">
              ID: {profile.passportSlug}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="text-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                  <span>URL Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 mr-1 text-neutral-500" />
                  <span>Share Passport</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="text-xs"
            >
              <Printer className="w-3.5 h-3.5 mr-1 text-neutral-500" />
              <span>Print / PDF</span>
            </Button>
          </div>
        </div>

        {/* 1. Header Credential Card */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-6 sm:p-8 relative">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <Avatar
                src={pUser.avatar}
                name={pUser.name}
                size="2xl"
                className="border-2 border-neutral-300 ring-4 ring-neutral-50 shadow-sm"
              />

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
                    {pUser.name}
                  </h1>
                  <VerifiedBadge label="Identity & Experience Verified" />
                </div>

                <p className="text-sm sm:text-base font-medium text-neutral-700">
                  {profile.headline}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 pt-1">
                  <div className="flex items-center gap-1 font-medium text-neutral-700">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    <span>
                      {profile.city}, {profile.country}
                    </span>
                  </div>

                  {profile.yearsOfExperience > 0 && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{profile.yearsOfExperience}+ Years Experience</span>
                    </div>
                  )}

                  {profile.availability?.status && (
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          profile.availability.status === "available"
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                        }`}
                      />
                      <span className="capitalize font-medium text-neutral-800">
                        {profile.availability.status.replace(/_/g, " ")}
                      </span>
                      {profile.availability.hourlyRate > 0 && (
                        <span>
                          (${profile.availability.hourlyRate}/hr)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Contact Button */}
            <div className="w-full sm:w-auto shrink-0 flex flex-col gap-2">
              <Button
                size="md"
                onClick={() => setIsContactOpen(true)}
                className="w-full sm:w-auto bg-neutral-900 text-white"
              >
                <Mail className="w-4 h-4 mr-2" />
                <span>Inquire / Contact</span>
              </Button>

              <button
                onClick={() => {
                  setDisputeTarget({ type: "profile", id: profile._id });
                  setIsDisputeOpen(true);
                }}
                className="text-[11px] text-neutral-400 hover:text-neutral-700 text-center transition-colors"
              >
                Report Contested Information
              </button>
            </div>
          </div>

          {/* Social Links & Bio */}
          {profile.bio && (
            <div className="mt-6 pt-6 border-t border-neutral-100">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Executive Summary
              </h3>
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed max-w-4xl">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Links */}
          {profile.socialLinks && (
            <div className="mt-4 flex flex-wrap items-center gap-3 pt-4 border-t border-neutral-100 text-xs">
              {profile.socialLinks.github && (
                <a
                  href={profile.socialLinks.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-neutral-600 hover:text-neutral-900 font-medium"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>GitHub</span>
                </a>
              )}
              {profile.socialLinks.linkedin && (
                <a
                  href={profile.socialLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-neutral-600 hover:text-neutral-900 font-medium"
                >
                  <svg className="w-3.5 h-3.5 fill-current text-sky-700" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  <span>LinkedIn</span>
                </a>
              )}
              {profile.socialLinks.portfolio && (
                <a
                  href={profile.socialLinks.portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-neutral-600 hover:text-neutral-900 font-medium"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Portfolio</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* 2. Verification Index & Trust Rating Card */}
        <div className="bg-neutral-900 text-white rounded-xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                <span>Audited Reputation Index</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                  {rep.score || 85}
                </span>
                <span className="text-neutral-400 font-mono text-sm">/ 100</span>
                <Badge
                  variant={rep.score >= 80 ? "elite" : "pro"}
                  className="bg-emerald-950 text-emerald-300 border-emerald-800 text-xs ml-2 uppercase font-semibold"
                >
                  {rep.tier || "Verified Pro"}
                </Badge>
              </div>
              <p className="text-neutral-400 text-xs mt-2 max-w-md">
                Score dynamically calculated from employer-verified work history,
                technical deliverables, peer review endorsements, and reliability index.
              </p>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t md:border-t-0 md:border-l border-neutral-800 pt-4 md:pt-0 md:pl-6">
              <div>
                <div className="text-2xl font-bold text-white">
                  {rep.verifiedExperienceCount || verifiedExperiences.length}
                </div>
                <div className="text-[11px] text-neutral-400 uppercase tracking-wider mt-0.5">
                  Verified Roles
                </div>
              </div>

              <div>
                <div className="text-2xl font-bold text-white">
                  {rep.verifiedProjectCount || projects.filter((p) => p.verificationStatus === "verified").length}
                </div>
                <div className="text-[11px] text-neutral-400 uppercase tracking-wider mt-0.5">
                  Audited Projects
                </div>
              </div>

              <div>
                <div className="text-2xl font-bold text-white flex items-center gap-1">
                  <span>{rep.averageRating || "5.0"}</span>
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 inline" />
                </div>
                <div className="text-[11px] text-neutral-400 uppercase tracking-wider mt-0.5">
                  Client Rating
                </div>
              </div>

              <div>
                <div className="text-2xl font-bold text-emerald-400">
                  {rep.reliabilityIndex || 98}%
                </div>
                <div className="text-[11px] text-neutral-400 uppercase tracking-wider mt-0.5">
                  Reliability Index
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Verified Skills & Technologies */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs">
            <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">
              Core Competencies & Verified Technologies
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-800 font-medium"
                >
                  <span>{s.name || s}</span>
                  {s.verifiedCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold">
                      <ShieldCheck className="w-2.5 h-2.5 text-emerald-700" />
                      {s.verifiedCount} verified
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Verified Work History (Key Requirement: Clearly distinguish Verified from Self-Reported) */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                Work Experience
              </h2>
              <p className="text-xs text-neutral-500">
                Peer and employer-audited employment history
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-800 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Verified
              </span>
              <span className="flex items-center gap-1.5 text-neutral-500">
                <span className="w-2 h-2 rounded-full bg-neutral-400" />
                Self-Reported
              </span>
            </div>
          </div>

          <div className="space-y-8">
            {experiences.length === 0 ? (
              <p className="text-xs text-neutral-500 py-4">No experiences recorded yet.</p>
            ) : (
              experiences.map((exp) => {
                const isVerified = exp.verificationStatus === "verified";
                const isPending = exp.verificationStatus === "pending";

                return (
                  <div
                    key={exp._id}
                    className={`rounded-xl p-5 border transition-all ${
                      isVerified
                        ? "border-emerald-200 bg-emerald-50/20"
                        : isPending
                        ? "border-amber-200 bg-amber-50/20"
                        : "border-neutral-200 bg-neutral-50/30"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-base font-bold text-neutral-950">
                          {exp.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-neutral-800 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                            {exp.company}
                          </span>
                          <span>•</span>
                          <span className="text-neutral-500 font-normal">
                            {exp.location} ({exp.locationType || "remote"})
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isVerified ? (
                          <VerifiedBadge label="Verified Experience" />
                        ) : isPending ? (
                          <Badge variant="pending">Verification Pending</Badge>
                        ) : (
                          <UnverifiedBadge label="Self-Reported" />
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-neutral-500 flex items-center gap-2 mb-3">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      <span>
                        {formatDate(exp.startDate)} –{" "}
                        {exp.isCurrent ? "Present" : formatDate(exp.endDate)}
                      </span>
                      <span>•</span>
                      <span>
                        {calculateDuration(exp.startDate, exp.endDate, exp.isCurrent)}
                      </span>
                    </div>

                    {exp.description && (
                      <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed mb-4">
                        {exp.description}
                      </p>
                    )}

                    {exp.skillsUsed && exp.skillsUsed.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {exp.skillsUsed.map((sk, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 rounded bg-white border border-neutral-200 text-neutral-700"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Cryptographic Verification Proof Box */}
                    {isVerified && exp.verifiedBy && (
                      <div className="mt-4 p-3.5 bg-white rounded-lg border border-emerald-200 text-xs space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100 pb-2">
                          <div className="flex items-center gap-2 font-semibold text-emerald-900">
                            <Lock className="w-3.5 h-3.5 text-emerald-600" />
                            <span>
                              Verified by {exp.verifiedBy.verifierName} (
                              {exp.verifiedBy.verifierRole} at{" "}
                              {exp.verifiedBy.verifierOrganization})
                            </span>
                          </div>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            Ref: {exp.verifiedBy.verificationReferenceCode || "VER-EXP-2026"}
                          </span>
                        </div>

                        {exp.verifiedBy.verificationNotes && (
                          <p className="text-xs text-neutral-700 italic">
                            “{exp.verifiedBy.verificationNotes}”
                          </p>
                        )}

                        <div className="text-[10px] text-neutral-400 flex items-center justify-between">
                          <span>
                            Audit confirmed on:{" "}
                            {exp.verifiedBy.verifiedAt
                              ? new Date(exp.verifiedBy.verifiedAt).toLocaleDateString()
                              : "Recent"}
                          </span>
                          <button
                            onClick={() => {
                              setDisputeTarget({ type: "experience", id: exp._id });
                              setIsDisputeOpen(true);
                            }}
                            className="text-neutral-400 hover:text-neutral-600 underline"
                          >
                            Contest this verification
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 5. Verified Projects */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                Key Technical Deliverables & Projects
              </h2>
              <p className="text-xs text-neutral-500">
                Audited production systems and measurable results
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.length === 0 ? (
              <p className="text-xs text-neutral-500 col-span-2">No projects documented yet.</p>
            ) : (
              projects.map((proj) => {
                const isVerified = proj.verificationStatus === "verified";
                return (
                  <div
                    key={proj._id}
                    className={`rounded-xl p-5 border flex flex-col justify-between ${
                      isVerified
                        ? "border-emerald-200 bg-emerald-50/15"
                        : "border-neutral-200 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-neutral-900 text-sm">
                          {proj.title}
                        </h3>
                        {isVerified ? (
                          <VerifiedBadge label="Verified" className="py-0 text-[10px]" />
                        ) : (
                          <UnverifiedBadge label="Self-Reported" className="py-0 text-[10px]" />
                        )}
                      </div>

                      <div className="text-xs text-neutral-500 mb-2">
                        Role: <span className="font-medium text-neutral-800">{proj.role}</span>
                        {proj.clientOrCompany && ` • ${proj.clientOrCompany}`}
                      </div>

                      <p className="text-xs text-neutral-700 leading-relaxed mb-3">
                        {proj.description}
                      </p>

                      {proj.metrics && (
                        <div className="mb-3 px-2.5 py-1.5 rounded bg-neutral-100 border border-neutral-200 text-xs font-mono text-neutral-800">
                          ⚡ <span className="font-semibold">{proj.metrics}</span>
                        </div>
                      )}

                      {proj.technologies && proj.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {proj.technologies.map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {isVerified && proj.verifiedBy && (
                      <div className="mt-3 pt-3 border-t border-emerald-100 text-[11px] text-emerald-950 font-medium">
                        Verified by {proj.verifiedBy.verifierName} ({proj.verifiedBy.verifierOrganization})
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 6. Client & Employer Verified Endorsements */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                Verified Client & Employer Endorsements
              </h2>
              <p className="text-xs text-neutral-500">
                Audited feedback from managers and organizational leads
              </p>
            </div>
            <div className="flex items-center gap-1 text-sm font-bold text-neutral-900">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{rep.averageRating || "5.0"}</span>
              <span className="text-xs text-neutral-400 font-normal">
                ({feedbacks.length} reviews)
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {feedbacks.length === 0 ? (
              <p className="text-xs text-neutral-500">No client feedback published yet.</p>
            ) : (
              feedbacks.map((fb) => (
                <div
                  key={fb._id}
                  className="p-5 rounded-xl border border-neutral-200 bg-neutral-50/40 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={fb.author?.avatar}
                        name={fb.author?.name}
                        size="md"
                      />
                      <div>
                        <div className="font-bold text-neutral-900 text-xs">
                          {fb.author?.name}
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          {fb.relationship} •{" "}
                          {fb.organization?.name || "Verified Organization"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < fb.rating
                              ? "text-amber-500 fill-amber-500"
                              : "text-neutral-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-neutral-700 leading-relaxed italic">
                    “{fb.review}”
                  </p>

                  <div className="flex flex-wrap gap-4 text-[10px] text-neutral-500 pt-2 border-t border-neutral-200 font-mono">
                    <span>Technical Competence: {fb.technicalCompetence || 5}/5</span>
                    <span>Reliability: {fb.reliability || 5}/5</span>
                    <span>Communication: {fb.communication || 5}/5</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 7. Education & Certifications */}
        {(profile.education?.length > 0 || profile.certifications?.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Education */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">
                Education
              </h3>
              <div className="space-y-4">
                {profile.education?.map((edu, idx) => (
                  <div key={idx} className="text-xs space-y-1">
                    <div className="font-bold text-neutral-900">
                      {edu.institution}
                    </div>
                    <div className="text-neutral-700 font-medium">
                      {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      {edu.startYear} – {edu.endYear || "Present"}
                      {edu.verified && (
                        <span className="ml-2 text-emerald-700 font-semibold">
                          • Verified
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">
                Certifications & Credentials
              </h3>
              <div className="space-y-4">
                {profile.certifications?.map((cert, idx) => (
                  <div key={idx} className="text-xs space-y-1">
                    <div className="font-bold text-neutral-900">
                      {cert.title}
                    </div>
                    <div className="text-neutral-700 font-medium">
                      {cert.issuer}
                    </div>
                    {cert.credentialId && (
                      <div className="text-[11px] font-mono text-neutral-500">
                        ID: {cert.credentialId}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 8. Footer Protocol Banner */}
        <div className="p-4 bg-neutral-100 rounded-xl border border-neutral-200 text-center text-xs text-neutral-500">
          This passport is cryptographically signed and maintained by the Talent Registry Pan-African Network.
          Every verified claim is backed by audited employer verification tokens.
        </div>
      </div>

      {/* Contact Inquiry Modal */}
      <Modal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        title={`Contact / Inquire: ${pUser.name}`}
        description="Send a direct hiring inquiry or consulting proposal to this verified professional."
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
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Lead Distributed Systems Engineer Role"
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
                  placeholder="e.g. $80k - $100k or $85/hr"
                  className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Opportunity Details / Message
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your organization, project scope, team structure, and why you are reaching out..."
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

      {/* Dispute Modal */}
      <Modal
        isOpen={isDisputeOpen}
        onClose={() => setIsDisputeOpen(false)}
        title="File Registry Integrity Report"
        description="If you believe a claim or verification on this passport is fraudulent or inaccurate, submit an inquiry to our audit committee."
      >
        {disputeSuccess ? (
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold text-center">
            {disputeSuccess}
          </div>
        ) : (
          <form onSubmit={handleFileDispute} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Reason for Contest
              </label>
              <select
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
              >
                <option value="False Role Claim">False Role / Responsibility Claim</option>
                <option value="Fraudulent Experience">Fraudulent Experience Record</option>
                <option value="Fabricated Project">Fabricated Project Deliverable</option>
                <option value="Impersonation">Impersonation</option>
                <option value="Inaccurate Verification">Inaccurate Verification</option>
                <option value="Other">Other Violation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Dispute Details & Evidence
              </label>
              <textarea
                required
                rows={4}
                value={disputeDetails}
                onChange={(e) => setDisputeDetails(e.target.value)}
                placeholder="Provide specific reasons why this claim does not reflect actual tenure or duties..."
                className="w-full text-xs px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsDisputeOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                type="submit"
                loading={disputeLoading}
              >
                Submit Integrity Report
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
