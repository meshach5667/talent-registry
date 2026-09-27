"use client";

import React, { useState, useEffect } from "react";
import { Download, X, WifiOff, ShieldCheck } from "lucide-react";

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // 1. Service Worker Registration
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("[PWA] Service Worker registered:", reg.scope);
          })
          .catch((err) => {
            console.warn("[PWA] Service Worker registration failed:", err);
          });
      });
    }

    // 2. Check offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    // 3. Check if already installed
    if (typeof window !== "undefined") {
      if (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true
      ) {
        setIsInstalled(true);
      }
    }

    // 4. Capture beforeinstallprompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // 5. App installed listener
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log("[PWA] Talent Registry successfully installed!");
    });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("talent_registry_pwa_dismissed", "true");
    }
  };

  return (
    <>
      {/* Offline Status Floating Banner */}
      {isOffline && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50 bg-neutral-900 text-white border border-neutral-700 rounded-xl p-3 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <WifiOff className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-semibold">You are browsing offline</div>
              <div className="text-[11px] text-neutral-400">
                Cached profiles & passports remain viewable.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PWA Install Promotion Banner */}
      {isInstallable && !isInstalled && !dismissed && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-6 duration-300">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-900 dark:bg-emerald-950 text-white flex items-center justify-center shadow-md">
                <ShieldCheck className="w-6 h-6 text-emerald-400 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-950 dark:text-white tracking-tight">
                  Install Talent Registry App
                </h4>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-tight mt-0.5">
                  Fast native access & offline verification on your device.
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 p-1"
              aria-label="Dismiss install prompt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleInstallClick}
              className="flex-1 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install PWA</span>
            </button>
            <button
              onClick={handleDismiss}
              className="h-8 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium transition-colors cursor-pointer"
            >
              Not now
            </button>
          </div>
        </div>
      )}
    </>
  );
}
