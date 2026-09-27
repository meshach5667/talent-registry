"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge, VerifiedBadge, UnverifiedBadge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatDate, calculateDuration } from "@/lib/utils";
import {
  ShieldCheck,
  Building2,
  Calendar,
  Briefcase,
  FolderGit2,
  Mail,
  Send,
  UserCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Camera,
  Star,
  Lock,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, refreshUser, updateAvatar, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState("experiences");
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Photo upload state
  const fileInputRef = useRef(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoMessage, setPhotoMessage] = useState("");

  // Modals state
  const [isAddExpOpen, setIsAddExpOpen] = useState(false);
  const [isAddProjOpen, setIsAddProjOpen] = useState(false);
  const [isRequestVerifOpen, setIsRequestVerifOpen] = useState(false);
  const [verifTarget, setVerifTarget] = useState(null); // { type, item }

  // Experience Form State
  const [expTitle, setExpTitle] = useState("");
  const [expCompany, setExpCompany] = useState("");
  const [expLocation, setExpLocation] = useState("Lagos, Nigeria");
  const [expLocationType, setExpLocationType] = useState("remote");
  const [expEmploymentType, setExpEmploymentType] = useState("full-time");
  const [expStartDate, setExpStartDate] = useState("");
  const [expEndDate, setExpEndDate] = useState("");
  const [expIsCurrent, setExpIsCurrent] = useState(false);
  const [expDescription, setExpDescription] = useState("");
  const [expSkills, setExpSkills] = useState("");
  const [expLoading, setExpLoading] = useState(false);

  // Project Form State
  const [projTitle, setProjTitle] = useState("");
  const [projDescription, setProjDescription] = useState("");
  const [projRole, setProjRole] = useState("Lead Contributor");
  const [projClientOrCompany, setProjClientOrCompany] = useState("");
  const [projUrl, setProjUrl] = useState("");
  const [projRepoUrl, setProjRepoUrl] = useState("");
  const [projTechnologies, setProjTechnologies] = useState("");
  const [projMetrics, setProjMetrics] = useState("");
  const [projLoading, setProjLoading] = useState(false);

  // Verification Request Form State
  const [verifierEmail, setVerifierEmail] = useState("");
  const [verifierName, setVerifierName] = useState("");
  const [verifierTitle, setVerifierTitle] = useState("Engineering Lead / Manager");
  const [requestMessage, setRequestMessage] = useState("");
  const [verifLoading, setVerifLoading] = useState(false);
  const [verifResult, setVerifResult] = useState(null);

  // Inquiries / Contacts State
  const [inquiries, setInquiries] = useState([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [respondModalOpen, setRespondModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [respondDecision, setRespondDecision] = useState("accepted");
  const [respondMessage, setRespondMessage] = useState("");

  // Verification Requests List State
  const [verificationRequests, setVerificationRequests] = useState([]);

  // Profile Edit State
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [profession, setProfession] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [skillsStr, setSkillsStr] = useState("");
  const [hourlyRate, setHourlyRate] = useState(0);
  const [availabilityStatus, setAvailabilityStatus] = useState("open_to_offers");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaveMsg, setProfileSaveMsg] = useState("");

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (user.role === "professional") {
        const data = await api.getMyProfile();
        if (data.success) {
          setProfileData(data);
          if (data.profile) {
            setHeadline(data.profile.headline || "");
            setBio(data.profile.bio || "");
            setProfession(data.profile.profession || "");
            setCountry(data.profile.country || "");
            setCity(data.profile.city || "");
            setSkillsStr(
              (data.profile.skills || []).map((s) => s.name || s).join(", ")
            );
            setHourlyRate(data.profile.availability?.hourlyRate || 0);
            setAvailabilityStatus(
              data.profile.availability?.status || "open_to_offers"
            );
          }
        }
      }

      // Load inquiries
      const contactData = await api.getContactRequests();
      if (contactData.success) {
        setInquiries(contactData.contacts || []);
      }

      // Load verification requests
      const verifData = await api.getMyVerifications();
      if (verifData.success) {
        setVerificationRequests(verifData.requests || []);
      }
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/auth/login");
      } else {
        loadData();
      }
    }
  }, [user, authLoading]);

  // Handle Photo Upload
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large. Maximum allowed size is 5MB.");
      return;
    }

    setPhotoUploading(true);
    setPhotoMessage("");
    try {
      const data = await api.uploadProfilePhoto(file);
      if (data.success && data.avatar) {
        updateAvatar(data.avatar);
        setPhotoMessage("Profile photo updated successfully!");
        refreshUser();
      }
    } catch (err) {
      alert(err.message || "Failed to upload photo");
    } finally {
      setPhotoUploading(false);
      setTimeout(() => setPhotoMessage(""), 3000);
    }
  };

  const handleDeletePhoto = async () => {
    if (!confirm("Are you sure you want to remove your profile photo?")) return;
    setPhotoUploading(true);
    try {
      const data = await api.deleteProfilePhoto();
      if (data.success) {
        updateAvatar("");
        setPhotoMessage("Profile photo removed.");
        refreshUser();
      }
    } catch (err) {
      alert(err.message || "Failed to delete photo");
    } finally {
      setPhotoUploading(false);
      setTimeout(() => setPhotoMessage(""), 3000);
    }
  };

  // Add Experience
  const handleAddExperience = async (e) => {
    e.preventDefault();
    setExpLoading(true);
    try {
      await api.addExperience({
        title: expTitle,
        company: expCompany,
        location: expLocation,
        locationType: expLocationType,
        employmentType: expEmploymentType,
        startDate: expStartDate,
        endDate: expIsCurrent ? null : expEndDate,
        isCurrent: expIsCurrent,
        description: expDescription,
        skillsUsed: expSkills.split(",").map((s) => s.trim()).filter(Boolean),
      });

      setIsAddExpOpen(false);
      setExpTitle("");
      setExpCompany("");
      setExpDescription("");
      setExpSkills("");
      loadData();
    } catch (err) {
      alert(err.message || "Failed to add experience");
    } finally {
      setExpLoading(false);
    }
  };

  // Add Project
  const handleAddProject = async (e) => {
    e.preventDefault();
    setProjLoading(true);
    try {
      await api.addProject({
        title: projTitle,
        description: projDescription,
        role: projRole,
        clientOrCompany: projClientOrCompany,
        projectUrl: projUrl,
        repoUrl: projRepoUrl,
        technologies: projTechnologies.split(",").map((t) => t.trim()).filter(Boolean),
        metrics: projMetrics,
      });

      setIsAddProjOpen(false);
      setProjTitle("");
      setProjDescription("");
      setProjMetrics("");
      setProjTechnologies("");
      loadData();
    } catch (err) {
      alert(err.message || "Failed to add project");
    } finally {
      setProjLoading(false);
    }
  };

  // Request Verification
  const handleOpenVerification = (item, type = "experience") => {
    setVerifTarget({ item, type });
    setVerifierEmail("");
    setVerifierName("");
    setRequestMessage(
      `Hi, please certify my contributions as ${item.title} on Talent Registry.`
    );
    setVerifResult(null);
    setIsRequestVerifOpen(true);
  };

  const handleSendVerificationRequest = async (e) => {
    e.preventDefault();
    setVerifLoading(true);
    try {
      const payload = {
        type: verifTarget.type,
        experienceId: verifTarget.type === "experience" ? verifTarget.item._id : undefined,
        projectId: verifTarget.type === "project" ? verifTarget.item._id : undefined,
        verifierEmail,
        verifierName,
        verifierTitle,
        requestMessage,
      };

      const data = await api.requestVerification(payload);
      if (data.success) {
        setVerifResult(data);
        loadData();
      }
    } catch (err) {
      alert(err.message || "Failed to send verification request");
    } finally {
      setVerifLoading(false);
    }
  };

  // Delete Experience / Project
  const handleDeleteExperience = async (id) => {
    if (!confirm("Are you sure you want to delete this experience record?")) return;
    try {
      await api.deleteExperience(id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await api.deleteProject(id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Respond to Inquiry
  const handleRespondToInquiry = async (e) => {
    e.preventDefault();
    try {
      await api.respondToContact(
        selectedInquiry._id,
        respondDecision,
        respondMessage
      );
      setRespondModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Save Profile Settings
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSaveMsg("");
    try {
      const skillsArray = skillsStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => ({ name: s, category: "Technical" }));

      await api.updateProfile({
        headline,
        bio,
        profession,
        country,
        city,
        skills: skillsArray,
        availability: {
          status: availabilityStatus,
          hourlyRate: Number(hourlyRate),
          currency: "USD",
        },
      });

      setProfileSaveMsg("Profile details and reputation score recalculated!");
      setTimeout(() => setProfileSaveMsg(""), 3000);
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setProfileSaving(false);
    }
  };

  const copyPassportUrl = () => {
    if (typeof window !== "undefined" && profileData?.profile) {
      const url = `${window.location.origin}/passport/${profileData.profile.passportSlug || user.id}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-neutral-500 font-medium">
            Loading dashboard...
          </span>
        </div>
      </div>
    );
  }

  // If Employer user, show Employer quick view or redirect
  if (user?.role === "employer") {
    return (
      <div className="flex-1 bg-neutral-50/50 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                Employer Account
              </span>
              <h1 className="text-2xl font-bold text-neutral-900">
                Welcome, {user.name}
              </h1>
              <p className="text-xs text-neutral-500 mt-1">
                Organization: {user.organization?.name || "Verified Organization"}
              </p>
            </div>

            <Link href="/organization/dashboard">
              <Button size="md">Open Organization Portal →</Button>
            </Link>
          </div>

          {/* Pending Verifications list for employer */}
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-neutral-900">
              Incoming Employee Verification Requests
            </h2>
            {verificationRequests.length === 0 ? (
              <p className="text-xs text-neutral-500">No pending verification requests at this time.</p>
            ) : (
              <div className="divide-y divide-neutral-100">
                {verificationRequests.map((req) => (
                  <div key={req._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-semibold text-neutral-900">
                        {req.professional?.name} • {req.experience?.title || req.project?.title}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        Requested for {req.targetOrganization?.name || "your organization"}
                      </div>
                    </div>
                    <Link href={`/verification/${req.token}`}>
                      <Button size="sm">Audit & Certify</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const { profile, experiences = [], projects = [] } = profileData || {};
  const rep = profile?.reputation || {};

  return (
    <div className="flex-1 bg-neutral-50/50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Profile Card & Photo Uploader Header */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Photo Container with Live Upload/Replace/Delete */}
              <div className="relative group">
                <Avatar
                  src={user.avatar}
                  name={user.name}
                  size="2xl"
                  className="border-2 border-neutral-200"
                />

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoSelect}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />

                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={photoUploading}
                    className="p-1.5 rounded-full bg-white/90 text-neutral-800 hover:bg-white transition-colors"
                    title="Upload or replace photo"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  {user.avatar && (
                    <button
                      type="button"
                      onClick={handleDeletePhoto}
                      disabled={photoUploading}
                      className="p-1.5 rounded-full bg-rose-600/90 text-white hover:bg-rose-700 transition-colors"
                      title="Remove photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-neutral-950">
                    {user.name}
                  </h1>
                  <VerifiedBadge label="Verified Profile" />
                  {user.githubUsername && (
                    <a
                      href={`https://github.com/${user.githubUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs"
                      title="Connected GitHub Profile"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                      </svg>
                      <span>@{user.githubUsername}</span>
                    </a>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-neutral-600 font-medium">
                  {profile?.headline || "Professional on Talent Registry"}
                </p>
                <div className="text-xs text-neutral-500">
                  {profile?.city || user.city}, {profile?.country || user.country}
                </div>

                {photoMessage && (
                  <div className="text-[11px] text-emerald-700 font-semibold pt-1">
                    {photoMessage}
                  </div>
                )}
              </div>
            </div>

            {/* Passport Link & Share */}
            <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
              <Link href={`/passport/${profile?.passportSlug || user.id}`}>
                <Button size="sm" className="w-full sm:w-auto">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  <span>View Public Passport</span>
                </Button>
              </Link>

              <button
                onClick={copyPassportUrl}
                className="text-xs text-neutral-500 hover:text-neutral-800 flex items-center gap-1 self-start sm:self-end cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">URL Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Passport URL</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Reputation Index Strip */}
          <div className="mt-6 pt-6 border-t border-neutral-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-neutral-50/70 p-3.5 rounded-xl border border-neutral-200/80 shadow-2xs">
              <span className="text-[11px] text-neutral-500 font-mono">Reputation Score</span>
              <div className="text-xl font-extrabold text-neutral-900 mt-0.5">
                {rep.score || 40}
                <span className="text-xs text-neutral-400 font-normal">/100</span>
              </div>
            </div>

            <div className="bg-neutral-50/70 p-3.5 rounded-xl border border-neutral-200/80 shadow-2xs">
              <span className="text-[11px] text-neutral-500 font-mono">Tier</span>
              <div className="text-sm font-bold text-emerald-800 mt-1 uppercase">
                {rep.tier || "Emerging"}
              </div>
            </div>

            <div className="bg-neutral-50/70 p-3.5 rounded-xl border border-neutral-200/80 shadow-2xs">
              <span className="text-[11px] text-neutral-500 font-mono">Verified Roles</span>
              <div className="text-xl font-extrabold text-neutral-900 mt-0.5">
                {rep.verifiedExperienceCount || 0}
              </div>
            </div>

            <div className="bg-neutral-50/70 p-3.5 rounded-xl border border-neutral-200/80 shadow-2xs">
              <span className="text-[11px] text-neutral-500 font-mono">Reliability Rating</span>
              <div className="text-xl font-extrabold text-emerald-700 mt-0.5">
                {rep.reliabilityIndex || 75}%
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex bg-white p-1.5 rounded-xl border border-neutral-200/90 shadow-2xs gap-1.5 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab("experiences")}
            className={`py-2 px-3.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "experiences"
                ? "bg-neutral-900 text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Work Experiences ({experiences.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("projects")}
            className={`py-2 px-3.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "projects"
                ? "bg-neutral-900 text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50"
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>Projects ({projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("inquiries")}
            className={`py-2 px-3.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "inquiries"
                ? "bg-neutral-900 text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50"
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Inquiries & Offers ({inquiries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("verifications")}
            className={`py-2 px-3.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "verifications"
                ? "bg-neutral-900 text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verification Tracker ({verificationRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`py-2 px-3.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "settings"
                ? "bg-neutral-900 text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50"
            }`}
          >
            <Edit2 className="w-4 h-4" />
            <span>Profile Details</span>
          </button>
        </div>

        {/* Tab 1: Experiences */}
        {activeTab === "experiences" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-neutral-900">
                  Employment Records
                </h2>
                <p className="text-xs text-neutral-500">
                  Add your past or current roles and dispatch verification requests to managers.
                </p>
              </div>
              <Button size="sm" onClick={() => setIsAddExpOpen(true)}>
                <Plus className="w-4 h-4 mr-1" />
                <span>Add Experience</span>
              </Button>
            </div>

            <div className="space-y-3">
              {experiences.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-neutral-200 text-center space-y-2">
                  <p className="text-xs text-neutral-500">No experiences added yet.</p>
                  <Button size="sm" onClick={() => setIsAddExpOpen(true)}>
                    Add Your First Role
                  </Button>
                </div>
              ) : (
                experiences.map((exp) => {
                  const isVerified = exp.verificationStatus === "verified";
                  const isPending = exp.verificationStatus === "pending";

                  return (
                    <div
                      key={exp._id}
                      className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-neutral-900 text-sm">
                            {exp.title}
                          </h3>
                          {isVerified ? (
                            <VerifiedBadge label="Verified by Employer" />
                          ) : isPending ? (
                            <Badge variant="pending">Audit In Progress</Badge>
                          ) : (
                            <UnverifiedBadge label="Self-Reported" />
                          )}
                        </div>

                        <div className="text-xs font-semibold text-neutral-700">
                          {exp.company} • {exp.location}
                        </div>

                        <div className="text-[11px] text-neutral-500 flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-neutral-400" />
                          <span>
                            {formatDate(exp.startDate)} –{" "}
                            {exp.isCurrent ? "Present" : formatDate(exp.endDate)}
                          </span>
                        </div>

                        {exp.description && (
                          <p className="text-xs text-neutral-600 pt-1 leading-relaxed max-w-2xl">
                            {exp.description}
                          </p>
                        )}

                        {isVerified && exp.verifiedBy && (
                          <div className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 inline-block font-mono">
                            Verified by: {exp.verifiedBy.verifierName} ({exp.verifiedBy.verifierOrganization}) • Ref: {exp.verifiedBy.verificationReferenceCode}
                          </div>
                        )}
                      </div>

                      {/* Experience Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {!isVerified && !isPending && (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="text-xs border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                            onClick={() => handleOpenVerification(exp, "experience")}
                          >
                            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            <span>Request Verification</span>
                          </Button>
                        )}

                        <button
                          onClick={() => handleDeleteExperience(exp._id)}
                          className="p-1.5 rounded text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete experience"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Projects */}
        {activeTab === "projects" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-neutral-900">
                  Key Technical Projects
                </h2>
                <p className="text-xs text-neutral-500">
                  Document production deliverables, metrics, and architecture.
                </p>
              </div>
              <Button size="sm" onClick={() => setIsAddProjOpen(true)}>
                <Plus className="w-4 h-4 mr-1" />
                <span>Add Project</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.length === 0 ? (
                <div className="col-span-2 bg-white p-8 rounded-xl border border-neutral-200 text-center space-y-2">
                  <p className="text-xs text-neutral-500">No projects added yet.</p>
                  <Button size="sm" onClick={() => setIsAddProjOpen(true)}>
                    Add Project
                  </Button>
                </div>
              ) : (
                projects.map((proj) => {
                  const isVerified = proj.verificationStatus === "verified";
                  const isPending = proj.verificationStatus === "pending";

                  return (
                    <div
                      key={proj._id}
                      className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-neutral-900 text-sm">
                            {proj.title}
                          </h3>
                          {isVerified ? (
                            <VerifiedBadge label="Verified" className="py-0 text-[10px]" />
                          ) : isPending ? (
                            <Badge variant="pending">Pending</Badge>
                          ) : (
                            <UnverifiedBadge label="Self-Reported" className="py-0 text-[10px]" />
                          )}
                        </div>

                        <div className="text-xs text-neutral-500">
                          Role: <span className="font-medium text-neutral-800">{proj.role}</span>
                          {proj.clientOrCompany && ` • ${proj.clientOrCompany}`}
                        </div>

                        <p className="text-xs text-neutral-600 leading-relaxed">
                          {proj.description}
                        </p>

                        {proj.metrics && (
                          <div className="text-[11px] font-mono p-1.5 rounded bg-neutral-100 text-neutral-800 border border-neutral-200">
                            ⚡ {proj.metrics}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                        {!isVerified && !isPending ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="text-xs"
                            onClick={() => handleOpenVerification(proj, "project")}
                          >
                            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            <span>Verify Project</span>
                          </Button>
                        ) : (
                          <span className="text-[11px] text-neutral-400 font-mono">
                            {isVerified ? "Certified" : "In Review"}
                          </span>
                        )}

                        <button
                          onClick={() => handleDeleteProject(proj._id)}
                          className="p-1 rounded text-neutral-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Inquiries / Offers */}
        {activeTab === "inquiries" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Employer Inquiries & Interview Requests
              </h2>
              <p className="text-xs text-neutral-500">
                Direct hiring proposals and contract requests from verified employers.
              </p>
            </div>

            <div className="space-y-3">
              {inquiries.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-neutral-200 text-center">
                  <p className="text-xs text-neutral-500">No contact inquiries received yet.</p>
                </div>
              ) : (
                inquiries.map((inq) => (
                  <div
                    key={inq._id}
                    className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-3 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                      <div>
                        <div className="font-bold text-neutral-900 text-sm">
                          {inq.subject}
                        </div>
                        <div className="text-neutral-500">
                          From: {inq.employer?.name} ({inq.organization?.name || "Verified Org"})
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono uppercase text-[10px] px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200">
                          {inq.engagementType}
                        </span>
                        <Badge
                          variant={
                            inq.status === "accepted"
                              ? "verified"
                              : inq.status === "declined"
                              ? "rejected"
                              : "pending"
                          }
                        >
                          {inq.status}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-neutral-700 leading-relaxed">
                      {inq.message}
                    </p>

                    {inq.budgetRange && (
                      <div className="text-[11px] font-mono text-neutral-600">
                        Proposed Budget: {inq.budgetRange}
                      </div>
                    )}

                    {inq.responseMessage && (
                      <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200 text-neutral-700 italic">
                        Your response: “{inq.responseMessage}”
                      </div>
                    )}

                    {inq.status === "pending" && (
                      <div className="pt-2 flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedInquiry(inq);
                            setRespondDecision("declined");
                            setRespondModalOpen(true);
                          }}
                        >
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedInquiry(inq);
                            setRespondDecision("accepted");
                            setRespondModalOpen(true);
                          }}
                        >
                          Accept & Respond
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Verification Tracker */}
        {activeTab === "verifications" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Verification Request Status Tracker
              </h2>
              <p className="text-xs text-neutral-500">
                Monitor live audit requests sent to managers and companies.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
              {verificationRequests.length === 0 ? (
                <div className="p-8 text-center text-xs text-neutral-500">
                  You haven't requested any verifications yet.
                </div>
              ) : (
                <div className="divide-y divide-neutral-100 text-xs">
                  {verificationRequests.map((req) => (
                    <div
                      key={req._id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-neutral-900">
                          {req.type === "experience"
                            ? req.experience?.title
                            : req.project?.title}
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          Sent to: <span className="font-mono text-neutral-700">{req.verifierEmail}</span>
                          {req.verifierName && ` (${req.verifierName})`}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            req.status === "approved"
                              ? "verified"
                              : req.status === "rejected"
                              ? "rejected"
                              : "pending"
                          }
                        >
                          {req.status}
                        </Badge>

                        <Link
                          href={`/verification/${req.token}`}
                          className="text-[11px] text-emerald-800 underline font-medium"
                        >
                          Direct Audit Link →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Profile Details Form */}
        {activeTab === "settings" && (
          <div className="bg-white rounded-xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Edit Professional Profile
              </h2>
              <p className="text-xs text-neutral-500">
                Updates trigger a recalculation of your official reputation score.
              </p>
            </div>

            {profileSaveMsg && (
              <div className="p-3 rounded bg-emerald-50 text-emerald-800 text-xs font-semibold">
                {profileSaveMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-800 mb-1">
                    Specialization / Profession
                  </label>
                  <input
                    type="text"
                    required
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-800 mb-1">
                    Passport URL Slug
                  </label>
                  <input
                    type="text"
                    disabled
                    value={profile?.passportSlug || ""}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-md bg-neutral-100 text-neutral-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-800 mb-1">
                  Professional Headline
                </label>
                <input
                  type="text"
                  required
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-800 mb-1">
                  Executive Bio
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-800 mb-1">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  placeholder="Go, Kubernetes, React, Python, PostgreSQL"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-800 mb-1">
                    Availability Status
                  </label>
                  <select
                    value={availabilityStatus}
                    onChange={(e) => setAvailabilityStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md bg-white"
                  >
                    <option value="available">Available for New Roles</option>
                    <option value="open_to_offers">Open to Compelling Offers</option>
                    <option value="unavailable">Not Looking</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-800 mb-1">
                    Hourly Advisory Rate ($ USD)
                  </label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" size="md" loading={profileSaving}>
                  Save Profile & Recalculate Reputation
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Add Experience Modal */}
      <Modal
        isOpen={isAddExpOpen}
        onClose={() => setIsAddExpOpen(false)}
        title="Add Work Experience"
        description="Record your tenure at an organization. You can request manager verification once saved."
      >
        <form onSubmit={handleAddExperience} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-neutral-800 mb-1">
              Role Title
            </label>
            <input
              type="text"
              required
              value={expTitle}
              onChange={(e) => setExpTitle(e.target.value)}
              placeholder="e.g. Senior Backend Engineer"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-800 mb-1">
              Company / Organization Name
            </label>
            <input
              type="text"
              required
              value={expCompany}
              onChange={(e) => setExpCompany(e.target.value)}
              placeholder="e.g. Paystack, Flutterwave, Safaricom"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-800 mb-1">
                Location
              </label>
              <input
                type="text"
                value={expLocation}
                onChange={(e) => setExpLocation(e.target.value)}
                placeholder="Lagos, Nigeria"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-800 mb-1">
                Type
              </label>
              <select
                value={expLocationType}
                onChange={(e) => setExpLocationType(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md bg-white"
              >
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="on-site">On-site</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-800 mb-1">
                Start Date
              </label>
              <input
                type="date"
                required
                value={expStartDate}
                onChange={(e) => setExpStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-800 mb-1">
                End Date
              </label>
              <input
                type="date"
                disabled={expIsCurrent}
                value={expEndDate}
                onChange={(e) => setExpEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md disabled:bg-neutral-100"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer font-medium text-neutral-700">
            <input
              type="checkbox"
              checked={expIsCurrent}
              onChange={(e) => setExpIsCurrent(e.target.checked)}
              className="accent-neutral-900 rounded"
            />
            <span>I currently work here</span>
          </label>

          <div>
            <label className="block font-semibold text-neutral-800 mb-1">
              Description & Key Accomplishments
            </label>
            <textarea
              rows={3}
              value={expDescription}
              onChange={(e) => setExpDescription(e.target.value)}
              placeholder="Highlight technical challenges, system scale, and architectural contributions..."
              className="w-full px-3 py-2 border border-neutral-300 rounded-md"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-800 mb-1">
              Technologies Used (comma separated)
            </label>
            <input
              type="text"
              value={expSkills}
              onChange={(e) => setExpSkills(e.target.value)}
              placeholder="e.g. Go, Kafka, PostgreSQL, Docker"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsAddExpOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" type="submit" loading={expLoading}>
              Save Experience
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Project Modal */}
      <Modal
        isOpen={isAddProjOpen}
        onClose={() => setIsAddProjOpen(false)}
        title="Add Technical Project"
        description="Showcase an architectural deliverable or open-source contribution."
      >
        <form onSubmit={handleAddProject} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-neutral-800 mb-1">
              Project Title
            </label>
            <input
              type="text"
              required
              value={projTitle}
              onChange={(e) => setProjTitle(e.target.value)}
              placeholder="e.g. Sub-Second Multi-Currency Settlement Engine"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-800 mb-1">
                Your Role
              </label>
              <input
                type="text"
                required
                value={projRole}
                onChange={(e) => setProjRole(e.target.value)}
                placeholder="e.g. Lead Architect"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-800 mb-1">
                Client or Company
              </label>
              <input
                type="text"
                value={projClientOrCompany}
                onChange={(e) => setProjClientOrCompany(e.target.value)}
                placeholder="e.g. Paystack / Independent"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-neutral-800 mb-1">
              Measurable Result / Metrics
            </label>
            <input
              type="text"
              value={projMetrics}
              onChange={(e) => setProjMetrics(e.target.value)}
              placeholder="e.g. Reconciles 2.4M transactions daily with 99.99% uptime"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-800 mb-1">
              Project Description
            </label>
            <textarea
              required
              rows={3}
              value={projDescription}
              onChange={(e) => setProjDescription(e.target.value)}
              placeholder="Explain system architecture and business impact..."
              className="w-full px-3 py-2 border border-neutral-300 rounded-md"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-800 mb-1">
              Technologies (comma separated)
            </label>
            <input
              type="text"
              value={projTechnologies}
              onChange={(e) => setProjTechnologies(e.target.value)}
              placeholder="Go, Kafka, Redis, Docker"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsAddProjOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" type="submit" loading={projLoading}>
              Save Project
            </Button>
          </div>
        </form>
      </Modal>

      {/* Request Verification Modal */}
      <Modal
        isOpen={isRequestVerifOpen}
        onClose={() => setIsRequestVerifOpen(false)}
        title="Request Official Verification"
        description="Dispatch a verification request token to your manager, client, or employer."
      >
        {verifResult ? (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-lg text-center font-semibold">
              Verification Request Dispatched Successfully!
            </div>
            <p className="text-neutral-600">
              The reviewer can audit your claim directly using this secure link:
            </p>
            <div className="p-2.5 bg-neutral-100 rounded border border-neutral-200 font-mono text-[11px] break-all">
              {window.location.origin}{verifResult.verificationUrl}
            </div>
            <div className="pt-2 flex justify-end">
              <Button size="sm" onClick={() => setIsRequestVerifOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendVerificationRequest} className="space-y-3 text-xs">
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              <span className="font-mono uppercase text-[10px] text-neutral-500 font-semibold block">
                Item to Verify
              </span>
              <span className="font-bold text-neutral-900 text-sm">
                {verifTarget?.item?.title}
              </span>
              <span className="text-neutral-600 block text-xs">
                {verifTarget?.item?.company || verifTarget?.item?.clientOrCompany}
              </span>
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">
                Verifier Work Email Address
              </label>
              <input
                type="email"
                required
                value={verifierEmail}
                onChange={(e) => setVerifierEmail(e.target.value)}
                placeholder="manager@company.com"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
              <span className="text-[10px] text-neutral-400 mt-0.5 block">
                Official corporate email of your team lead, CTO, or HR department.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-800 mb-1">
                  Verifier Name (Optional)
                </label>
                <input
                  type="text"
                  value={verifierName}
                  onChange={(e) => setVerifierName(e.target.value)}
                  placeholder="e.g. Tunde Adebayo"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                />
              </div>
              <div>
                <label className="block font-semibold text-neutral-800 mb-1">
                  Verifier Title
                </label>
                <input
                  type="text"
                  value={verifierTitle}
                  onChange={(e) => setVerifierTitle(e.target.value)}
                  placeholder="VP Engineering / Team Lead"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">
                Personal Message to Verifier
              </label>
              <textarea
                rows={3}
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsRequestVerifOpen(false)}
              >
                Cancel
              </Button>
              <Button size="sm" type="submit" loading={verifLoading}>
                Dispatch Verification Request
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Inquiry Response Modal */}
      {selectedInquiry && (
        <Modal
          isOpen={respondModalOpen}
          onClose={() => setRespondModalOpen(false)}
          title={`Respond to Inquiry: ${selectedInquiry.subject}`}
          description={`From ${selectedInquiry.employer?.name} (${selectedInquiry.organization?.name || "Organization"}).`}
        >
          <form onSubmit={handleRespondToInquiry} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-800 mb-1">
                Decision
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="decision"
                    value="accepted"
                    checked={respondDecision === "accepted"}
                    onChange={() => setRespondDecision("accepted")}
                  />
                  <span>Accept Opportunity</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="decision"
                    value="declined"
                    checked={respondDecision === "declined"}
                    onChange={() => setRespondDecision("declined")}
                  />
                  <span>Decline Politely</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">
                Response Message
              </label>
              <textarea
                rows={3}
                required
                value={respondMessage}
                onChange={(e) => setRespondMessage(e.target.value)}
                placeholder="Thank you for reaching out..."
                className="w-full px-3 py-2 border border-neutral-300 rounded-md"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setRespondModalOpen(false)}
              >
                Cancel
              </Button>
              <Button size="sm" type="submit">
                Submit Response
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
