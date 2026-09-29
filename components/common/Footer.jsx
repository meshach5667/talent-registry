import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Globe2, CheckCircle2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-neutral-900 text-neutral-300 border-t border-neutral-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span>Talent Registry</span>
            </div>
            <p className="text-neutral-400 leading-relaxed text-xs">
              “Don’t just claim your experience. Prove it.”
            </p>
            <p className="text-neutral-500 text-[11px] leading-relaxed">
              Professional talent registry bridging African digital
              excellence—writers, designers, engineers, and creatives—with global
              opportunities through direct portfolios, work history, and client endorsements.
            </p>
          </div>

          {/* Verification Platform */}
          <div>
            <h4 className="text-neutral-200 font-medium uppercase tracking-wider text-[11px] mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <Link href="/talent" className="hover:text-white transition-colors">
                  Talent Discovery Directory
                </Link>
              </li>
              <li>
                <Link href="/organizations" className="hover:text-white transition-colors">
                  African Organizations
                </Link>
              </li>
              <li>
                <Link href="/passport/kwame-mensah" className="hover:text-white transition-colors">
                  Sample Professional Passport
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-white transition-colors">
                  Create Your Passport
                </Link>
              </li>
            </ul>
          </div>

          {/* Regional Hubs */}
          <div>
            <h4 className="text-neutral-200 font-medium uppercase tracking-wider text-[11px] mb-3">
              African Tech Hubs
            </h4>
            <div className="grid grid-cols-2 gap-2 text-neutral-400 text-[11px]">
              <div>🇳🇬 Lagos, Nigeria</div>
              <div>🇰🇪 Nairobi, Kenya</div>
              <div>🇬🇭 Accra, Ghana</div>
              <div>🇿🇦 Cape Town, SA</div>
              <div>🇷🇼 Kigali, Rwanda</div>
              <div>🇪🇬 Cairo, Egypt</div>
              <div>🇸🇳 Dakar, Senegal</div>
              <div>🇺🇬 Kampala, Uganda</div>
            </div>
          </div>

          {/* Trust & Administration */}
          <div>
            <h4 className="text-neutral-200 font-medium uppercase tracking-wider text-[11px] mb-3">
              Integrity & Trust
            </h4>
            <ul className="space-y-2 text-neutral-400">
              <li className="flex items-center gap-1.5 text-neutral-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Direct Work History & Portfolio</span>
              </li>
              <li className="flex items-center gap-1.5 text-neutral-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Audited Client Ratings & Feedback</span>
              </li>
              <li className="flex items-center gap-1.5 text-neutral-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Transparent Reputation Index</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-neutral-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} Talent Registry Africa. All rights reserved.
          </div>
          <div className="flex flex-wrap gap-4 sm:gap-6 mt-3 sm:mt-0 items-center">
            <span>Built for the continent</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              <span>PWA Ready & Offline Capable</span>
            </span>
            <span>Audited & Verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
