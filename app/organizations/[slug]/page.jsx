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
    <div className="flex-1 bg-neutral-50/50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Org Header Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-20 h-20 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center font-bold text-neutral-800 text-xl overflow-hidden shrink-0">
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

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
                  {organization.name}
                </h1>
                {organization.verified && (
                  <VerifiedBadge label="Verified Organization" />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-600">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                  {organization.city}, {organization.country}
                </span>

                <span className="font-mono px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200">
                  {organization.industry}
                </span>

                {organization.website && (
                  <a
                    href={organization.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-emerald-800 hover:underline font-medium"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Website</span>
                  </a>
                )}
              </div>

              {organization.description && (
                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed pt-2">
                  {organization.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Verified Alumni / Current Engineers */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-neutral-100 pb-4">
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Verified Engineers & Technical Alumni</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Professionals with employer-certified work records at {organization.name}.
            </p>
          </div>

          <div className="space-y-4">
            {verifiedAlumni.length === 0 ? (
              <p className="text-xs text-neutral-500">
                No public certified alumni listed yet for this organization.
              </p>
            ) : (
              verifiedAlumni.map((exp) => (
                <div
                  key={exp._id}
                  className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={exp.user?.avatar}
                      name={exp.user?.name}
                      size="md"
                    />
                    <div>
                      <div className="font-bold text-neutral-900 text-sm">
                        {exp.user?.name}
                      </div>
                      <div className="text-neutral-600 font-medium">
                        {exp.title}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        {exp.user?.city}, {exp.user?.country}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <VerifiedBadge label="Certified Record" />
                    <Link href={`/passport/${exp.user?._id}`}>
                      <Button size="sm" variant="outline" className="text-xs">
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
