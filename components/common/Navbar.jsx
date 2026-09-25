"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, DEMO_ACCOUNTS } from "@/lib/auth-context";
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
  Zap,
  CheckCircle,
} from "lucide-react";

export function Navbar() {
  const { user, logout, quickDemoLogin } = useAuth();
  const pathname = usePathname();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);
  const demoRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await api.getNotifications();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
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
      if (demoRef.current && !demoRef.current.contains(e.target)) {
        setShowDemoMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch (err) {
      // ignore
    }
  };

  const navLinks = [
    { href: "/talent", label: "Talent Discovery", icon: Search },
    { href: "/organizations", label: "Organizations", icon: Building2 },
    { href: "/#how-it-works", label: "Verification Model", icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded bg-neutral-900 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-emerald-400 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-neutral-900 text-base tracking-tight group-hover:text-black">
                Talent Registry
              </span>
              <span className="text-[10px] text-neutral-500 font-mono tracking-wider uppercase -mt-1">
                Verified Africa
              </span>
            </div>
          </Link>

          {/* Nav Items */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    active
                      ? "text-neutral-950 font-semibold"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  <Icon className="w-4 h-4 text-neutral-400" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Switcher (Instant Evaluation for users) */}
          <div className="relative" ref={demoRef}>
            <button
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium border border-neutral-300 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 flex items-center gap-1.5 transition-colors"
              title="One-click demo logins"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span className="hidden sm:inline">Demo Switcher</span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {showDemoMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-neutral-200 py-2 z-50 text-left">
                <div className="px-3 py-1.5 border-b border-neutral-100 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  1-Click Role Logins
                </div>
                {Object.entries(DEMO_ACCOUNTS).map(([key, acc]) => (
                  <button
                    key={key}
                    onClick={() => {
                      quickDemoLogin(key);
                      setShowDemoMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-neutral-50 flex flex-col transition-colors border-b border-neutral-50 last:border-none"
                  >
                    <div className="font-semibold text-neutral-900 flex items-center justify-between">
                      <span>{acc.label}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                        {acc.role}
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">
                      {acc.description}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <>
              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white" />
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-neutral-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-neutral-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                        Notifications ({unreadCount})
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] text-neutral-500 hover:text-neutral-800 underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-xs text-neutral-500">
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
                                className="inline-block mt-1.5 text-[11px] font-medium text-emerald-800 hover:underline"
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
                  className="flex items-center gap-2 p-1 pl-2 rounded-full border border-neutral-200 hover:border-neutral-300 transition-colors"
                >
                  <span className="text-xs font-medium text-neutral-800 max-w-[110px] truncate hidden sm:inline">
                    {user.name}
                  </span>
                  <Avatar src={user.avatar} name={user.name} size="sm" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-neutral-200 py-1.5 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-neutral-100">
                      <div className="font-semibold text-neutral-900">{user.name}</div>
                      <div className="text-[11px] text-neutral-500 truncate">
                        {user.email}
                      </div>
                      <div className="mt-1 inline-block uppercase text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700">
                        Role: {user.role}
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-left px-4 py-2 hover:bg-neutral-50 flex items-center gap-2 text-neutral-700"
                      >
                        <UserCheck className="w-4 h-4 text-neutral-400" />
                        Dashboard
                      </Link>

                      {user.role === "professional" && (
                        <Link
                          href={`/passport/${user.profile?.passportSlug || user.id}`}
                          onClick={() => setShowUserMenu(false)}
                          className="w-full text-left px-4 py-2 hover:bg-neutral-50 flex items-center gap-2 text-neutral-700"
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          Public Passport
                        </Link>
                      )}

                      {user.role === "employer" && (
                        <Link
                          href="/organization/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="w-full text-left px-4 py-2 hover:bg-neutral-50 flex items-center gap-2 text-neutral-700"
                        >
                          <Building2 className="w-4 h-4 text-neutral-400" />
                          Organization Portal
                        </Link>
                      )}

                      {user.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setShowUserMenu(false)}
                          className="w-full text-left px-4 py-2 hover:bg-neutral-50 flex items-center gap-2 text-neutral-700"
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
                        className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-700 flex items-center gap-2 transition-colors"
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
            <div className="flex items-center gap-2">
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
        </div>
      </div>
    </header>
  );
}
