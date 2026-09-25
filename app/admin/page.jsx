"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge, VerifiedBadge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  ShieldAlert,
  Users,
  Building2,
  FileCheck2,
  AlertTriangle,
  History,
  Search,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Ban,
  Lock,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  // Users Tab State
  const [usersList, setUsersList] = useState([]);
  const [userQuery, setUserQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("All");
  const [usersLoading, setUsersLoading] = useState(false);

  // Organizations Tab State
  const [orgsList, setOrgsList] = useState([]);
  const [orgsLoading, setOrgsLoading] = useState(false);

  // Disputes Tab State
  const [disputesList, setDisputesList] = useState([]);
  const [disputesLoading, setDisputesLoading] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolutionStatus, setResolutionStatus] = useState("resolved");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);

  // Audit Logs Tab State
  const [auditLogs, setAuditLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const loadOverview = async () => {
    try {
      const data = await api.getAdminOverview();
      if (data.success) {
        setOverview(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await api.getAdminUsers({
        q: userQuery,
        role: userRoleFilter !== "All" ? userRoleFilter : undefined,
      });
      if (data.success) {
        setUsersList(data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadOrgs = async () => {
    setOrgsLoading(true);
    try {
      const data = await api.getOrganizations();
      if (data.success) {
        setOrgsList(data.organizations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOrgsLoading(false);
    }
  };

  const loadDisputes = async () => {
    setDisputesLoading(true);
    try {
      const data = await api.getDisputes();
      if (data.success) {
        setDisputesList(data.disputes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDisputesLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    setLogsLoading(true);
    try {
      const data = await api.getAuditLogs({ limit: 40 });
      if (data.success) {
        setAuditLogs(data.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/auth/login");
      } else if (user.role !== "admin") {
        router.push("/dashboard");
      } else {
        loadOverview().finally(() => setLoading(false));
      }
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (activeTab === "users") loadUsers();
    else if (activeTab === "organizations") loadOrgs();
    else if (activeTab === "disputes") loadDisputes();
    else if (activeTab === "audit") loadAuditLogs();
  }, [activeTab]);

  // Toggle user status
  const handleToggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === "active" ? "suspended" : "active";
    if (
      !confirm(
        `Are you sure you want to mark this account as ${nextStatus.toUpperCase()}?`
      )
    )
      return;

    try {
      await api.updateUserStatus(userId, nextStatus);
      loadUsers();
      loadOverview();
    } catch (err) {
      alert(err.message);
    }
  };

  // Toggle Org verification
  const handleToggleOrgVerification = async (orgId, currentVerified) => {
    const nextVal = !currentVerified;
    try {
      await api.toggleOrganizationVerification(orgId, nextVal);
      loadOrgs();
      loadOverview();
    } catch (err) {
      alert(err.message);
    }
  };

  // Resolve Dispute
  const handleResolveDispute = async (e) => {
    e.preventDefault();
    if (!selectedDispute) return;
    try {
      await api.resolveDispute(
        selectedDispute._id,
        resolutionStatus,
        resolutionNotes
      );
      setIsResolveModalOpen(false);
      setSelectedDispute(null);
      setResolutionNotes("");
      loadDisputes();
      loadOverview();
    } catch (err) {
      alert(err.message);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = overview?.stats || {};

  return (
    <div className="flex-1 bg-neutral-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="bg-neutral-900 text-white p-6 sm:p-8 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Registry Root Administration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Platform Governance Console
            </h1>
            <p className="text-xs text-neutral-400">
              Manage network participants, enforce verification integrity, and inspect audit logs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-neutral-800 text-neutral-300 border-neutral-700 font-mono text-xs">
              Region: Pan-Africa (Verified)
            </Badge>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
            <div className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
              Total Users
            </div>
            <div className="text-2xl font-bold text-neutral-900 mt-1">
              {stats.totalUsers || 0}
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">
              {stats.professionalsCount} Pros / {stats.employersCount} Orgs
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
            <div className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
              Organizations
            </div>
            <div className="text-2xl font-bold text-neutral-900 mt-1">
              {stats.totalOrganizations || 0}
            </div>
            <div className="text-[10px] text-emerald-700 mt-0.5 font-medium">
              {stats.verifiedOrganizations} Verified
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
            <div className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
              Verifications
            </div>
            <div className="text-2xl font-bold text-neutral-900 mt-1">
              {stats.totalVerifications || 0}
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">
              {stats.approvedVerifications} Certified
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
            <div className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
              Pending Audits
            </div>
            <div className="text-2xl font-bold text-amber-600 mt-1">
              {stats.pendingVerifications || 0}
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">In Review</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs col-span-2 sm:col-span-1">
            <div className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
              Open Disputes
            </div>
            <div className="text-2xl font-bold text-rose-600 mt-1">
              {stats.openDisputes || 0}
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">Integrity Queue</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-200 space-x-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "overview"
                ? "border-neutral-900 text-neutral-950 font-bold"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <span>Overview & Activity</span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "users"
                ? "border-neutral-900 text-neutral-950 font-bold"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Management</span>
          </button>

          <button
            onClick={() => setActiveTab("organizations")}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "organizations"
                ? "border-neutral-900 text-neutral-950 font-bold"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Organization Verification</span>
          </button>

          <button
            onClick={() => setActiveTab("disputes")}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "disputes"
                ? "border-neutral-900 text-neutral-950 font-bold"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Disputes & Reports ({stats.openDisputes || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "audit"
                ? "border-neutral-900 text-neutral-950 font-bold"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit Trail</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3">
              Recent System & Compliance Events
            </h2>

            <div className="divide-y divide-neutral-100 text-xs">
              {(overview?.recentLogs || []).map((log) => (
                <div key={log._id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono uppercase font-semibold text-neutral-800">
                      {log.action}
                    </span>{" "}
                    – {log.user?.name || "System"} ({log.user?.role || "kernel"})
                    <div className="text-[10px] text-neutral-400 mt-0.5">
                      IP: {log.ipAddress} • {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-500">
                    {log.targetType || "System"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Users Management */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row gap-3 text-xs">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadUsers()}
                  placeholder="Search users by name, email..."
                  className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-md"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => {
                  setUserRoleFilter(e.target.value);
                  setTimeout(loadUsers, 50);
                }}
                className="px-3 py-2 border border-neutral-300 rounded-md bg-white font-medium"
              >
                <option value="All">All Roles</option>
                <option value="professional">Professional</option>
                <option value="employer">Employer</option>
                <option value="admin">Admin</option>
              </select>

              <Button size="sm" onClick={loadUsers}>
                Filter
              </Button>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
              <div className="divide-y divide-neutral-100 text-xs">
                {usersList.map((u) => (
                  <div
                    key={u._id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar src={u.avatar} name={u.name} size="md" />
                      <div>
                        <div className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                          <span>{u.name}</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 uppercase">
                            {u.role}
                          </span>
                        </div>
                        <div className="text-neutral-500">
                          {u.email} • {u.city}, {u.country}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge
                        variant={u.status === "active" ? "verified" : "rejected"}
                      >
                        {u.status}
                      </Badge>

                      <Button
                        size="sm"
                        variant={u.status === "active" ? "outline" : "default"}
                        className="text-xs h-7 px-3"
                        onClick={() => handleToggleUserStatus(u._id, u.status)}
                      >
                        {u.status === "active" ? "Suspend" : "Activate"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Organizations Verification */}
        {activeTab === "organizations" && (
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-neutral-900">
                  Institutional Verification Control
                </h2>
                <p className="text-xs text-neutral-500">
                  Toggle official verified checkmarks for registered organizations.
                </p>
              </div>
            </div>

            <div className="divide-y divide-neutral-100 text-xs">
              {orgsList.map((org) => (
                <div
                  key={org._id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center font-bold text-neutral-800">
                      {org.logo ? (
                        <img
                          src={org.logo}
                          alt={org.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Building2 className="w-5 h-5 text-neutral-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-neutral-900 text-sm flex items-center gap-1.5">
                        <span>{org.name}</span>
                        {org.verified && (
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>
                      <div className="text-neutral-500">
                        {org.city}, {org.country} • {org.industry} • Domain: @{org.workEmailDomain || "N/A"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {org.verified ? (
                      <VerifiedBadge label="Verified Org" />
                    ) : (
                      <Badge variant="pending">Unverified</Badge>
                    )}

                    <Button
                      size="sm"
                      variant={org.verified ? "outline" : "default"}
                      className={`text-xs h-7 px-3 ${
                        !org.verified ? "bg-emerald-700 hover:bg-emerald-800 text-white" : ""
                      }`}
                      onClick={() => handleToggleOrgVerification(org._id, org.verified)}
                    >
                      {org.verified ? "Revoke Badge" : "Grant Verified Badge"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Disputes & Reports */}
        {activeTab === "disputes" && (
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-neutral-100">
              <h2 className="text-sm font-bold text-neutral-900">
                Integrity Reports & Content Disputes
              </h2>
              <p className="text-xs text-neutral-500">
                Audit community reports of fraudulent claims, misrepresentation, or disputed credentials.
              </p>
            </div>

            <div className="divide-y divide-neutral-100 text-xs">
              {disputesList.length === 0 ? (
                <div className="p-8 text-center text-neutral-500">
                  No active disputes filed on the registry.
                </div>
              ) : (
                disputesList.map((d) => (
                  <div key={d._id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-rose-700">{d.reason}</span>
                        <span className="text-neutral-400">•</span>
                        <span className="text-neutral-500">
                          Target: {d.targetType} ({d.targetTitle || d.targetId})
                        </span>
                      </div>
                      <Badge
                        variant={d.status === "open" ? "rejected" : "verified"}
                      >
                        {d.status}
                      </Badge>
                    </div>

                    <p className="text-neutral-700">{d.details}</p>

                    <div className="text-[11px] text-neutral-400 flex items-center justify-between pt-1">
                      <span>
                        Reported by: {d.reporter?.name} ({d.reporter?.email}) on{" "}
                        {new Date(d.createdAt).toLocaleDateString()}
                      </span>

                      {d.status === "open" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => {
                            setSelectedDispute(d);
                            setIsResolveModalOpen(true);
                          }}
                        >
                          Investigate & Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Audit Trail */}
        {activeTab === "audit" && (
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-neutral-900">
                  Cryptographic Audit Trail
                </h2>
                <p className="text-xs text-neutral-500">
                  Immutable event log recording all verification minting, updates, and logins.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={loadAuditLogs}>
                Refresh Trail
              </Button>
            </div>

            <div className="divide-y divide-neutral-100 text-xs font-mono">
              {auditLogs.map((log) => (
                <div
                  key={log._id}
                  className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-neutral-50"
                >
                  <div>
                    <span className="text-emerald-700 font-bold">
                      [{log.action}]
                    </span>{" "}
                    <span className="text-neutral-800">
                      {log.user ? `${log.user.name} (${log.user.role})` : "Anonymous"}
                    </span>
                    <div className="text-[11px] text-neutral-400 font-sans mt-0.5">
                      Target: {log.targetType || "System"} • IP: {log.ipAddress}
                    </div>
                  </div>

                  <span className="text-[11px] text-neutral-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resolve Dispute Modal */}
      {selectedDispute && (
        <Modal
          isOpen={isResolveModalOpen}
          onClose={() => setIsResolveModalOpen(false)}
          title="Resolve Integrity Dispute"
          description={`Report filed for ${selectedDispute.reason}`}
        >
          <form onSubmit={handleResolveDispute} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-800 mb-1">
                Resolution Outcome
              </label>
              <select
                value={resolutionStatus}
                onChange={(e) => setResolutionStatus(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md bg-white font-medium"
              >
                <option value="resolved">Resolved (Action Taken / Verified)</option>
                <option value="dismissed">Dismissed (Unsubstantiated Report)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">
                Resolution & Investigation Notes
              </label>
              <textarea
                rows={3}
                required
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Audit notes and reasoning for resolution..."
                className="w-full px-3 py-2 border border-neutral-300 rounded-md"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsResolveModalOpen(false)}
              >
                Cancel
              </Button>
              <Button size="sm" type="submit">
                Submit Resolution
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
