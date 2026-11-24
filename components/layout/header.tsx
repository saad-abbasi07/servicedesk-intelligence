
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  LogOut,
  User,
} from "lucide-react";

interface CurrentUser {
  name: string;
  email: string;
}

export default function Header() {
  const router = useRouter();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    }

    loadUser();
  }, []);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
    }
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("")
    : "U";

  return (
    <header className="sticky top-0 z-30 flex h-[76px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 md:px-8">
      {/* Search */}
      <div className="flex w-full max-w-md items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
        <Search size={18} className="text-slate-400" />

        <input
          type="text"
          placeholder="Search anything..."
          className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />

        <span className="hidden rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-400 sm:block">
          /
        </span>
      </div>

      {/* Actions */}
      <div className="ml-4 flex shrink-0 items-center gap-3">
        <button
          onClick={() =>
            router.push("/dashboard/tickets?newTicket=1")
          }
          className="hidden items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 sm:flex"
        >
          <Plus size={17} />
          New Ticket
        </button>

        <button
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <Bell size={19} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="hidden h-9 w-px bg-slate-200 sm:block" />

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
              {initials}
            </div>

            <div className="hidden text-left sm:block">
              <p className="max-w-[130px] truncate text-sm font-semibold text-slate-800">
                {user?.name || "Loading..."}
              </p>
              <p className="max-w-[130px] truncate text-xs text-slate-500">
                {user?.email || "Administrator"}
              </p>
            </div>

            <ChevronDown size={16} className="hidden text-slate-400 sm:block" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {user?.name || "User"}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {user?.email || ""}
                </p>
              </div>

              <div className="p-2">
                <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600">
                  <User size={17} />
                  Account
                </div>

                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                >
                  <LogOut size={17} />
                  {loggingOut ? "Signing out..." : "Logout"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
