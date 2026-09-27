"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge, VerifiedBadge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Upload,
  Globe,
  MapPin,
  Users,
  Clock,
  ExternalLink,
  Edit2,
  Star,
} from "lucide-react";

export default function OrganizationDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit Organization State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [orgWebsite, setOrgWebsite] = useState("");
  const [orgIndustry, setOrgIndustry] = useState("");
  const [orgCountry, setOrgCountry] = useState("");
  const [orgCity, setOrgCity] = useState("");
  const [orgDescription, setOrgDescription] = useState("");
  const [orgWorkEmailDomain, setOrgWorkEmailDomain] = useState("");
  const [savingOrg, setSavingOrg] = useState(false);

  // Logo upload
  const logoInputRef = useRef(null);
  const [logoUploading, setLogoUploading] = useState(false);

  const loadOrgDashboard = async () => {
    if (!user) return;
    const orgId = user.organization?._id || user.organization;
    if (!orgId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await api.getOrganizationDashboard(orgId);
      if (data.success) {
        setDashboardData(data);
        const o = data.organization || {};
        setOrgName(o.name || "");
        setOrgWebsite(o.website || "");
        setOrgIndustry(o.industry || "");
        setOrgCountry(o.country || "");
        setOrgCity(o.city || "");
        setOrgDescription(o.description || "");
        setOrgWorkEmailDomain(o.workEmailDomain || "");
      }
    } catch (err) {
      setError(err.message || "Failed to load organization dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/auth/login");
      } else if (user.role !== "employer" && user.role !== "admin") {
        router.push("/dashboard");
      } else {
        loadOrgDashboard();
      }
    }
  }, [user, authLoading]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !dashboardData?.organization?._id) return;

    setLogoUploading(true);
    try {
      const data = await api.uploadOrgLogo(dashboardData.organization._id, file);
      if (data.success) {
        loadOrgDashboard();
      }
    } catch (err) {
      alert(err.message || "Failed to upload logo");
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSaveOrganization = async (e) => {
    e.preventDefault();
    setSavingOrg(true);
    try {
      await api.updateOrganization(dashboardData.organization._id, {
        name: orgName,
        website: orgWebsite,
        industry: orgIndustry,
        country: orgCountry,
        city: orgCity,
        description: orgDescription,
        workEmailDomain: orgWorkEmailDomain,
      });
      setIsEditOpen(false);
      loadOrgDashboard();
    } catch (err) {
      alert(err.message || "Failed to save organization");
    } finally {
      setSavingOrg(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { organization, metrics, pendingRequests = [], recentActivity = [] } =
    dashboardData || {};

  return (
    <div className="flex-1 bg-neutral-50/50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Organization Header */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="relative group">
              <div className="w-20 h-20 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center font-bold text-neutral-800 text-xl overflow-hidden shrink-0">
                {organization?.logo ? (
                  <img
                    src={organization.logo}
                    alt={organization.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="w-10 h-10 text-neutral-400" />
                )}
              </div>
              <input
                type="file"
                ref={logoInputRef}
                onChange={handleLogoUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={logoUploading}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl text-white transition-opacity text-xs"
              >
                Change
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold text-neutral-950">
                  {organization?.name || "Organization Portal"}
                </h1>
                {organization?.verified ? (
                  <VerifiedBadge label="Verified Organization" />
                ) : (
                  <Badge variant="pending">Pending Official Audit</Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                <span>
                  {organization?.city}, {organization?.country}
                </span>
                <span>•</span>
                <span>{organization?.industry}</span>
                {organization?.workEmailDomain && (
                  <>
                    <span>•</span>
                    <span className="font-mono">@{organization.workEmailDomain}</span>
                  </>
                )}
              </div>

              <p className="text-xs text-neutral-600 max-w-xl pt-1">
                {organization?.description || "No description configured yet."}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <Button size="sm" variant="outline" onClick={() => setIsEditOpen(true)}>
              <Edit2 className="w-3.5 h-3.5 mr-1.5" />
              <span>Edit Organization</span>
            </Button>

            <Link href={`/organizations/${organization?.slug || organization?._id}`}>
              <span className="text-xs text-emerald-800 hover:underline flex items-center gap-1 font-medium">
                <span>Public Org Page</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
            <div className="text-2xl font-bold text-amber-600">
              {metrics?.pendingRequestsCount || 0}
            </div>
            <div className="text-xs text-neutral-500 font-medium mt-1 uppercase tracking-wider">
              Pending Verifications to Review
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
            <div className="text-2xl font-bold text-emerald-700">
              {metrics?.verifiedEmployeesCount || 0}
            </div>
            <div className="text-xs text-neutral-500 font-medium mt-1 uppercase tracking-wider">
              Certified Technical Alumni
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
            <div className="text-2xl font-bold text-neutral-900">
              {metrics?.totalVerificationsReviewed || 0}
            </div>
            <div className="text-xs text-neutral-500 font-medium mt-1 uppercase tracking-wider">
              Total Audits Completed
            </div>
          </div>
        </div>

        {/* Pending Verification Claims Queue */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
          <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Incoming Employee Verification Queue
              </h2>
              <p className="text-xs text-neutral-500">
                Review and certify experience and project claims from engineers.
              </p>
            </div>
            <Badge variant="pending">{pendingRequests.length} pending</Badge>
          </div>

          {pendingRequests.length === 0 ? (
            <p className="text-xs text-neutral-500 py-6 text-center">
              No pending verification claims awaiting your review.
            </p>
          ) : (
            <div className="divide-y divide-neutral-100 text-xs">
              {pendingRequests.map((req) => (
                <div
                  key={req._id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <Avatar
                      src={req.professional?.avatar}
                      name={req.professional?.name}
                      size="md"
                    />
                    <div className="space-y-1">
                      <div className="font-bold text-neutral-900 text-sm">
                        {req.professional?.name}
                      </div>
                      <div className="text-neutral-700 font-medium">
                        Claimed {req.type === "experience" ? "Role" : "Project"}:{" "}
                        <span className="font-semibold">
                          {req.experience?.title || req.project?.title}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        {req.professional?.email} • {req.professional?.city},{" "}
                        {req.professional?.country}
                      </div>
                    </div>
                  </div>

                  <Link href={`/verification/${req.token}`}>
                    <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white">
                      Review & Audit Claim →
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Audit Activity */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3">
            Recent Audit & Verification History
          </h2>

          {recentActivity.length === 0 ? (
            <p className="text-xs text-neutral-500 py-4 text-center">
              No past verification reviews yet.
            </p>
          ) : (
            <div className="divide-y divide-neutral-100 text-xs">
              {recentActivity.map((item) => (
                <div key={item._id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-neutral-900">
                      {item.professional?.name}
                    </span>{" "}
                    – {item.experience?.title || item.project?.title}
                    <div className="text-[11px] text-neutral-400">
                      Processed on {new Date(item.updatedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <Badge
                    variant={item.status === "approved" ? "verified" : "rejected"}
                  >
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Organization Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Organization Details"
        description="Update your corporate profile and verified domain settings."
      >
        <form onSubmit={handleSaveOrganization} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-neutral-800 mb-1">
              Organization Name
            </label>
            <input
              type="text"
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-800 mb-1">
                Industry
              </label>
              <input
                type="text"
                required
                value={orgIndustry}
                onChange={(e) => setOrgIndustry(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-800 mb-1">
                Website URL
              </label>
              <input
                type="text"
                value={orgWebsite}
                onChange={(e) => setOrgWebsite(e.target.value)}
                placeholder="https://company.com"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-800 mb-1">
                Country
              </label>
              <input
                type="text"
                required
                value={orgCountry}
                onChange={(e) => setOrgCountry(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-800 mb-1">
                City / Hub
              </label>
              <input
                type="text"
                required
                value={orgCity}
                onChange={(e) => setOrgCity(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-neutral-800 mb-1">
              Corporate Email Domain (e.g. paystack.com)
            </label>
            <input
              type="text"
              value={orgWorkEmailDomain}
              onChange={(e) => setOrgWorkEmailDomain(e.target.value)}
              placeholder="paystack.com"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-neutral-800 mb-1">
              Organization Mission & Description
            </label>
            <textarea
              rows={3}
              value={orgDescription}
              onChange={(e) => setOrgDescription(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsEditOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" type="submit" loading={savingOrg}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
