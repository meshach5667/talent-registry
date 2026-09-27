"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge, VerifiedBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  ShieldCheck,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  Lock,
  ArrowRight,
} from "lucide-react";

export default function VerificationReviewPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token;
  const { user } = useAuth();

  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Review Form
  const [decision, setDecision] = useState("approved");
  const [verifierName, setVerifierName] = useState("");
  const [verifierOrg, setVerifierOrg] = useState("");
  const [responseNotes, setResponseNotes] = useState("");
  const [rating, setRating] = useState(5);
  const [technicalCompetence, setTechnicalCompetence] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [reliability, setReliability] = useState(5);
  const [relationship, setRelationship] = useState("Direct Manager");

  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  useEffect(() => {
    async function loadVerification() {
      if (!token) return;
      setLoading(true);
      try {
        const data = await api.getVerificationByToken(token);
        if (data.success && data.verification) {
          setVerification(data.verification);
          setVerifierName(user?.name || data.verification.verifierName || "");
          setVerifierOrg(
            user?.organization?.name ||
              data.verification.targetOrganization?.name ||
              data.verification.experience?.company ||
              data.verification.project?.clientOrCompany ||
              ""
          );
        } else {
          setError("Verification request not found or link has expired.");
        }
      } catch (err) {
        setError(err.message || "Failed to load verification request.");
      } finally {
        setLoading(false);
      }
    }
    loadVerification();
  }, [token, user]);

  const handleSubmitDecision = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const data = await api.submitVerificationDecision(token, {
        status: decision,
        responseNotes,
        rating,
        technicalCompetence,
        communication,
        reliability,
        relationship,
        verifierName,
        verifierOrganization: verifierOrg,
      });

      if (data.success) {
        setSubmittedData(data);
      }
    } catch (err) {
      setError(err.message || "Failed to submit verification decision.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-neutral-500 font-medium">
            Loading secure verification portal...
          </span>
        </div>
      </div>
    );
  }

  if (error || !verification) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mb-4 text-rose-600">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900">
          Invalid or Expired Request
        </h2>
        <p className="text-xs text-neutral-500 mt-1 max-w-sm">
          {error || "This verification link is invalid or has already been reviewed."}
        </p>
        <Link href="/" className="mt-4">
          <Button size="sm">Return to Registry</Button>
        </Link>
      </div>
    );
  }

  const { professional = {}, experience, project, type, status } = verification;
  const isExperience = type === "experience";
  const claimItem = isExperience ? experience : project;

  if (status !== "pending" && !submittedData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4 text-emerald-600">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900">
          Already Processed
        </h2>
        <p className="text-xs text-neutral-600 mt-1 max-w-sm">
          This verification request was previously reviewed and marked as{" "}
          <span className="font-semibold uppercase">{status}</span>.
        </p>
        <Link href={`/passport/${professional._id}`} className="mt-4">
          <Button size="sm">View Candidate Passport</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-neutral-50/60 py-10 sm:py-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-semibold shadow-xs">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Official Credential Audit Interface</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
            Employer Experience Verification
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto leading-relaxed">
            You have been requested to audit and certify the technical contributions of <span className="font-semibold text-neutral-900">{professional.name}</span>.
          </p>
        </div>

        {submittedData ? (
          /* Confirmation State */
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-8 sm:p-10 shadow-sm text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
              <ShieldCheck className="w-9 h-9 stroke-[2.2]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                Verification Successfully {submittedData.status === "approved" ? "Certified" : "Declined"}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
                {submittedData.status === "approved"
                  ? `The claim has been authenticated with verified reference code ${submittedData.referenceCode}. A Verified Badge has been added to ${professional.name}'s Professional Passport.`
                  : "The record was updated with your feedback notes."}
              </p>
            </div>

            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <Link href={`/passport/${professional._id}`}>
                <Button size="md" className="rounded-xl shadow-xs">View Updated Passport</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="md" className="rounded-xl">
                  Home
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Review Form */
          <div className="space-y-6">
            {/* Candidate & Item Summary */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center gap-4 border-b border-neutral-100 pb-5">
                <Avatar
                  src={professional.avatar}
                  name={professional.name}
                  size="lg"
                  className="shadow-xs"
                />
                <div>
                  <h2 className="text-base font-bold text-neutral-900">
                    {professional.name}
                  </h2>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    {professional.email} • {professional.city}, {professional.country}
                  </div>
                </div>
              </div>

              {/* Claimed Experience Details */}
              <div className="p-5 rounded-xl bg-neutral-50/80 border border-neutral-200/80 space-y-3 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono uppercase text-[10px] text-neutral-500 font-semibold tracking-wider">
                      Claimed {isExperience ? "Role" : "Project"}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-neutral-900 mt-0.5">
                      {claimItem?.title}
                    </h3>
                  </div>
                  <Badge variant="pending">Pending Your Audit</Badge>
                </div>

                <div className="text-neutral-700 font-semibold text-xs">
                  {isExperience ? claimItem?.company : claimItem?.clientOrCompany}
                </div>

                {isExperience && (
                  <div className="text-neutral-500 text-xs flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    <span>
                      {formatDate(claimItem?.startDate)} –{" "}
                      {claimItem?.isCurrent
                        ? "Present"
                        : formatDate(claimItem?.endDate)}
                    </span>
                  </div>
                )}

                {claimItem?.description && (
                  <p className="text-neutral-600 text-xs leading-relaxed pt-1">
                    {claimItem.description}
                  </p>
                )}

                {claimItem?.skillsUsed && claimItem.skillsUsed.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {claimItem.skillsUsed.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-neutral-200/80 text-neutral-700 font-mono shadow-2xs"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {verification.requestMessage && (
                <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200/80 text-xs text-amber-900">
                  <span className="font-semibold">Candidate's Note:</span> “
                  {verification.requestMessage}”
                </div>
              )}
            </div>

            {/* Review Decision Form */}
            <form
              onSubmit={handleSubmitDecision}
              className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-sm space-y-6"
            >
              <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider border-b border-neutral-100 pb-3">
                Audit Decision & Endorsement
              </h2>

              {/* Decision Toggle */}
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-2">
                  Verification Decision
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDecision("approved")}
                    className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      decision === "approved"
                        ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20 shadow-xs"
                        : "border-neutral-200 hover:bg-neutral-50/80"
                    }`}
                  >
                    <CheckCircle2
                      className={`w-5 h-5 shrink-0 mt-0.5 ${
                        decision === "approved"
                          ? "text-emerald-600"
                          : "text-neutral-400"
                      }`}
                    />
                    <div>
                      <div className="text-xs font-bold text-neutral-900">
                        Approve & Certify Experience
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        Confirm candidate held this role and delivered described duties.
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecision("rejected")}
                    className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      decision === "rejected"
                        ? "border-rose-600 bg-rose-50/60 ring-2 ring-rose-600/20 shadow-xs"
                        : "border-neutral-200 hover:bg-neutral-50/80"
                    }`}
                  >
                    <XCircle
                      className={`w-5 h-5 shrink-0 mt-0.5 ${
                        decision === "rejected"
                          ? "text-rose-600"
                          : "text-neutral-400"
                      }`}
                    />
                    <div>
                      <div className="text-xs font-bold text-neutral-900">
                        Decline / Inaccurate Claim
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        Duties or dates do not match internal organization records.
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Verifier Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                    Your Name (Auditor)
                  </label>
                  <input
                    type="text"
                    required
                    value={verifierName}
                    onChange={(e) => setVerifierName(e.target.value)}
                    placeholder="e.g. Tunde Adebayo"
                    className="w-full text-xs px-3.5 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-all shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                    Auditing Organization
                  </label>
                  <input
                    type="text"
                    required
                    value={verifierOrg}
                    onChange={(e) => setVerifierOrg(e.target.value)}
                    placeholder="e.g. Paystack / Safaricom"
                    className="w-full text-xs px-3.5 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-all shadow-2xs"
                  />
                </div>
              </div>

              {decision === "approved" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                        Professional Relationship
                      </label>
                      <select
                        value={relationship}
                        onChange={(e) => setRelationship(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 bg-white font-medium transition-all shadow-2xs"
                      >
                        <option value="Direct Manager">Direct Manager</option>
                        <option value="Team Lead / CTO">Team Lead / CTO</option>
                        <option value="Client / Stakeholder">Client / Stakeholder</option>
                        <option value="Colleague / Peer">Colleague / Peer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                        Overall Performance Rating ({rating}/5 Stars)
                      </label>
                      <div className="flex items-center gap-1.5 pt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="p-1 hover:scale-115 transition-transform"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= rating
                                  ? "text-amber-500 fill-amber-500"
                                  : "text-neutral-200"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Competence breakdown sliders */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-neutral-50/80 rounded-xl border border-neutral-200/80 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                        Tech Competence: <span className="font-bold text-neutral-950">{technicalCompetence}/5</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={technicalCompetence}
                        onChange={(e) => setTechnicalCompetence(Number(e.target.value))}
                        className="w-full accent-neutral-900 cursor-pointer h-1.5 bg-neutral-200 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                        Reliability: <span className="font-bold text-neutral-950">{reliability}/5</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={reliability}
                        onChange={(e) => setReliability(Number(e.target.value))}
                        className="w-full accent-neutral-900 cursor-pointer h-1.5 bg-neutral-200 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                        Communication: <span className="font-bold text-neutral-950">{communication}/5</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={communication}
                        onChange={(e) => setCommunication(Number(e.target.value))}
                        className="w-full accent-neutral-900 cursor-pointer h-1.5 bg-neutral-200 rounded-lg"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                  {decision === "approved"
                    ? "Manager Endorsement & Audit Notes (Published on Passport)"
                    : "Rejection Reason (Internal)"}
                </label>
                <textarea
                  required
                  rows={3}
                  value={responseNotes}
                  onChange={(e) => setResponseNotes(e.target.value)}
                  placeholder={
                    decision === "approved"
                      ? "Describe candidate's accomplishments, reliability, and technical impact during their tenure..."
                      : "Explain why this experience cannot be certified..."
                  }
                  className="w-full text-xs px-3.5 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-all shadow-2xs leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  size="md"
                  loading={submitting}
                  className={`rounded-xl shadow-sm ${
                    decision === "approved"
                      ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                      : "bg-rose-600 hover:bg-rose-700 text-white"
                  }`}
                >
                  {decision === "approved"
                    ? "Confirm & Mint Verification Badge"
                    : "Decline Verification"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
