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
              Institutional verification network bridging African technical
              excellence with global opportunities through cryptographically
              verifiable work histories.
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
                  Verified African Organizations
                </Link>
              </li>
              <li>
                <Link href="/passport/kwame-mensah" className="hover:text-white transition-colors">
                  Sample Professional Passport
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-white transition-colors">
                  Issue Your Passport
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
                <span>Zero Self-Attested Falsehoods</span>
              </li>
              <li className="flex items-center gap-1.5 text-neutral-300">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cryptographic Reference Codes</span>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white text-neutral-400 transition-colors">
                  Admin Console & Audit Trail
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-neutral-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} Talent Registry Africa. All rights reserved.
          </div>
          <div className="flex gap-6 mt-3 sm:mt-0">
            <span>Built for the continent</span>
            <span>Security First</span>
            <span>Audited & Verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
