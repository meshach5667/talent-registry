"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Bell,
  Search,
  Building2,
  UserCheck,
  ChevronDown,
  LogOut,
  User,
  Settings,
  ShieldAlert,
  Menu,
  X,
  Sparkles,
  Download,
} from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);
  const mobileRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await api.getNotifications();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (mobileRef.current && !mobileRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore
    }
  };

  const navLinks = [
    { href: "/talent", label: "Talent Discovery", icon: Search },
    { href: "/organizations", label: "Organizations", icon: Building2 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200/80 shadow-2xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8.5 h-8.5 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 text-emerald-400 stroke-[2.4]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-neutral-950 text-base tracking-tight group-hover:text-emerald-900 transition-colors">
                Talent Registry
              </span>
              <span className="text-[9.5px] text-neutral-500 font-mono tracking-wider uppercase -mt-1 flex items-center gap-1">
                <span>Pan-African Network</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-xs font-semibold px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    active
                      ? "text-neutral-950 bg-neutral-100 font-bold"
                      : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      active ? "text-emerald-700" : "text-neutral-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2.5">


          {user ? (
            <>
              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell className="w-4.5 h-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-2 ring-white animate-pulse" />
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-neutral-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2.5 border-b border-neutral-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                        Notifications ({unreadCount})
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-xs text-neutral-400">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <div
                            key={n._id}
                            className={`p-3 text-xs transition-colors ${
                              n.read ? "bg-white" : "bg-emerald-50/40"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-neutral-900">
                                {n.title}
                              </span>
                              <span className="text-[10px] text-neutral-400 shrink-0">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-neutral-600 mt-1 line-clamp-2">
                              {n.message}
                            </p>
                            {n.actionUrl && (
                              <Link
                                href={n.actionUrl}
                                onClick={() => setShowNotifications(false)}
                                className="inline-block mt-1.5 text-[11px] font-semibold text-emerald-800 hover:underline"
                              >
                                View Details →
                              </Link>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 pl-2.5 rounded-full border border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50 transition-colors shadow-2xs cursor-pointer"
                >
                  <span className="text-xs font-semibold text-neutral-800 max-w-[110px] truncate hidden sm:inline">
                    {user.name}
                  </span>
                  <Avatar src={user.avatar} name={user.name} size="sm" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-neutral-200 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2.5 border-b border-neutral-100">
                      <div className="font-bold text-neutral-900 truncate">{user.name}</div>
                      <div className="text-[11px] text-neutral-500 truncate">
                        {user.email}
                      </div>
                      <div className="mt-1.5 inline-block uppercase text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200">
                        {user.role}
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-left px-4 py-2 hover:bg-neutral-50 flex items-center gap-2.5 text-neutral-700 font-medium"
                      >
                        <UserCheck className="w-4 h-4 text-neutral-400" />
                        Dashboard
                      </Link>

                      {user.role === "professional" && (
                        <Link
                          href={`/passport/${user.profile?.passportSlug || user.id}`}
                          onClick={() => setShowUserMenu(false)}
                          className="w-full text-left px-4 py-2 hover:bg-neutral-50 flex items-center gap-2.5 text-neutral-700 font-medium"
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          Public Passport
                        </Link>
                      )}

                      {user.role === "employer" && (
                        <Link
                          href="/organization/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="w-full text-left px-4 py-2 hover:bg-neutral-50 flex items-center gap-2.5 text-neutral-700 font-medium"
                        >
                          <Building2 className="w-4 h-4 text-neutral-400" />
                          Organization Portal
                        </Link>
                      )}

                      {user.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setShowUserMenu(false)}
                          className="w-full text-left px-4 py-2 hover:bg-neutral-50 flex items-center gap-2.5 text-neutral-700 font-medium"
                        >
                          <ShieldAlert className="w-4 h-4 text-neutral-400" />
                          Admin Console
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-neutral-100 pt-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-700 flex items-center gap-2.5 transition-colors font-medium cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Create Passport</Button>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <div className="md:hidden" ref={mobileRef}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Mobile Dropdown Panel */}
            {mobileMenuOpen && (
              <div className="absolute top-16 left-0 right-0 bg-white border-b border-neutral-200 p-4 shadow-xl flex flex-col gap-3 animate-in slide-in-from-top-2 duration-150 z-50">
                <nav className="flex flex-col gap-1">
                  {navLinks.map((item) => {
                    const active = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`text-sm font-semibold px-3 py-2.5 rounded-lg flex items-center gap-2.5 ${
                          active
                            ? "bg-neutral-100 text-neutral-950 font-bold"
                            : "text-neutral-700 hover:bg-neutral-50"
                        }`}
                      >
                        <Icon className="w-4 h-4 text-emerald-600" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                {!user && (
                  <div className="pt-3 border-t border-neutral-100 flex flex-col gap-2">
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full"
                    >
                      <Button size="sm" className="w-full">
                        Create Passport
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
