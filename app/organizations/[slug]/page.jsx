"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge, VerifiedBadge } from "@/components/ui/badge";
import {
  Building2,
  MapPin,
  Globe,
  ShieldCheck,
  Calendar,
  Users,
  ExternalLink,
} from "lucide-react";

export default function OrganizationDetailsPage() {
  const params = useParams();
  const slug = params?.slug;

  const [orgData, setOrgData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrg() {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await api.getOrganization(slug);
        if (data.success && data.organization) {
          setOrgData(data);
        } else {
          setError("Organization not found.");
        }
      } catch (err) {
        setError(err.message || "Failed to load organization.");
      } finally {
        setLoading(false);
      }
    }
    loadOrg();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !orgData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <Building2 className="w-12 h-12 text-neutral-400 mb-3" />
        <h2 className="text-xl font-bold text-neutral-900">
          Organization Not Found
        </h2>
        <Link href="/organizations" className="mt-4">
          <Button size="sm">Back to Organizations</Button>
        </Link>
      </div>
    );
  }

  const { organization, verifiedAlumni = [] } = orgData;

  return (
    <div className="flex-1 bg-neutral-50/60 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Org Header Card */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-neutral-100 border border-neutral-200/80 flex items-center justify-center font-bold text-neutral-800 text-xl overflow-hidden shrink-0 shadow-xs">
              {organization.logo ? (
                <img
                  src={organization.logo}
                  alt={organization.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-10 h-10 text-neutral-400" />
              )}
            </div>

            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
                  {organization.name}
                </h1>
                {organization.verified && (
                  <VerifiedBadge label="Verified Organization" />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600">
                <span className="flex items-center gap-1.5 font-medium bg-neutral-100/80 px-2.5 py-1 rounded-lg">
                  <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                  {organization.city}, {organization.country}
                </span>

                <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-neutral-100/80 border border-neutral-200/60 text-neutral-700 font-semibold">
                  {organization.industry}
                </span>

                {organization.website && (
                  <a
                    href={organization.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 bg-emerald-50/70 border border-emerald-200/60 px-2.5 py-1 rounded-lg font-medium transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Website</span>
                  </a>
                )}
              </div>

              {organization.description && (
                <p className="text-sm text-neutral-600 leading-relaxed pt-1">
                  {organization.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Verified Alumni / Current Engineers */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-neutral-100 pb-4">
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Verified Engineers & Technical Alumni</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Professionals with employer-certified work records at {organization.name}.
            </p>
          </div>

          <div className="space-y-3">
            {verifiedAlumni.length === 0 ? (
              <div className="py-10 text-center rounded-xl bg-neutral-50 border border-neutral-200/60">
                <Users className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-xs text-neutral-500 font-medium">
                  No public certified alumni listed yet for this organization.
                </p>
              </div>
            ) : (
              verifiedAlumni.map((exp) => (
                <div
                  key={exp._id}
                  className="p-4 rounded-xl border border-neutral-200/70 bg-white hover:border-neutral-300 hover:shadow-sm transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3.5">
                    <Avatar
                      src={exp.user?.avatar}
                      name={exp.user?.name}
                      size="md"
                    />
                    <div>
                      <div className="font-bold text-neutral-900 text-sm">
                        {exp.user?.name}
                      </div>
                      <div className="text-neutral-700 font-medium text-xs">
                        {exp.title}
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        {exp.user?.city}, {exp.user?.country}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <VerifiedBadge label="Certified Record" />
                    <Link href={`/passport/${exp.user?._id}`}>
                      <Button size="sm" variant="outline" className="text-xs rounded-lg shadow-xs hover:border-neutral-400">
                        View Passport →
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
