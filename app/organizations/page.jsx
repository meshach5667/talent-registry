"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge, VerifiedBadge } from "@/components/ui/badge";
import {
  Building2,
  Search,
  MapPin,
  Globe,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");

  const countries = ["All", "Nigeria", "Kenya", "Ghana", "South Africa", "Rwanda", "Egypt"];

  const loadOrgs = async () => {
    setLoading(true);
    try {
      const data = await api.getOrganizations({
        q: query,
        country: selectedCountry !== "All" ? selectedCountry : undefined,
      });
      if (data.success) {
        setOrganizations(data.organizations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrgs();
  }, [selectedCountry]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadOrgs();
  };

  return (
    <div className="flex-1 bg-neutral-50/50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-200 pb-5">
          <div>
            <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
              Institutional Network
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
              Verified African Tech Organizations
            </h1>
            <p className="text-xs text-neutral-600 mt-1">
              Companies, fintechs, and labs actively verifying engineering accomplishments.
            </p>
          </div>

          <div className="text-xs text-neutral-500 font-mono">
            {organizations.length} organizations active
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search organizations by name..."
                className="w-full text-xs pl-9 pr-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
            <Button type="submit" size="sm">
              Search
            </Button>
          </form>

          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="text-xs px-3 py-2 border border-neutral-300 rounded-md bg-white font-medium text-neutral-800 outline-none"
          >
            {countries.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "All African Countries" : c}
              </option>
            ))}
          </select>
        </div>

        {/* Orgs Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs text-neutral-500">
            Loading verified organizations...
          </div>
        ) : organizations.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-xl border border-neutral-200 p-8 space-y-2">
            <Building2 className="w-10 h-10 text-neutral-400 mx-auto" />
            <h3 className="font-bold text-neutral-900 text-sm">No organizations found</h3>
            <p className="text-xs text-neutral-500">Try changing your search keywords or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <div
                key={org._id}
                className="bg-white rounded-xl border border-neutral-200 p-5 hover:border-neutral-400 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center font-bold text-neutral-800 text-sm overflow-hidden">
                        {org.logo ? (
                          <img
                            src={org.logo}
                            alt={org.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-neutral-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-neutral-950 text-sm flex items-center gap-1.5">
                          {org.name}
                          {org.verified && (
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                        </h3>
                        <div className="text-xs text-neutral-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-neutral-400" />
                          <span>
                            {org.city}, {org.country}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    {org.verified ? (
                      <VerifiedBadge label="Verified Organization" className="py-0 text-[10px]" />
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                        Unverified
                      </span>
                    )}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-50 text-neutral-700 border border-neutral-200">
                      {org.industry}
                    </span>
                  </div>

                  {org.description && (
                    <p className="text-xs text-neutral-600 line-clamp-3 mb-4 leading-relaxed">
                      {org.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <Link
                    href={`/organizations/${org.slug || org._id}`}
                    className="font-semibold text-neutral-900 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <span>View Profile & Talent</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  {org.website && (
                    <a
                      href={org.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-neutral-400 hover:text-neutral-700"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
