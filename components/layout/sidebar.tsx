
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Ticket,
  Users,
  BarChart3,
  Settings,
  Bot,
  Headset,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navigation = [
  {
    title: "WORKSPACE",
    items: [
      { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { name: "Tickets", href: "/dashboard/tickets", icon: Ticket },
      { name: "Customers", href: "/dashboard/customers", icon: Users },
    ],
  },
  {
    title: "INSIGHTS",
    items: [
      { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { name: "AI Intelligence", href: "/dashboard/ai", icon: Bot },
    ],
  },
  {
    title: "PREFERENCES",
    items: [
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`relative flex h-full shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-300 ${
        collapsed ? "w-[76px]" : "w-[260px]"
      }`}
    >
      {/* Brand */}
      <div className="flex h-[76px] shrink-0 items-center gap-3 border-b border-slate-100 px-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
          <Headset size={21} />
        </div>

        {!collapsed && (
          <div className="min-w-0">
            <h1 className="text-sm font-bold tracking-tight text-slate-900">
              ServiceDesk
            </h1>
            <p className="text-[11px] text-slate-500">
              Intelligence Platform
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 space-y-7 overflow-y-auto overflow-x-hidden px-3 py-7">
        {navigation.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.13em] text-slate-400">
                {group.title}
              </p>
            )}

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href + "/"));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.name : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                      active
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={19} className="shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* AI Status */}
      {!collapsed && (
        <div className="mx-3 mb-5 shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-slate-700">
              AI Engine Ready
            </span>
          </div>
          <p className="mt-2 text-[11px] leading-5 text-slate-500">
            Intelligence services are configured.
          </p>
        </div>
      )}

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[90px] z-40 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
      </button>

      {/* Footer */}
      <div className="shrink-0 border-t border-slate-100 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
            SA
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">
                Admin User
              </p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
