
"use client";

import { useEffect, useState } from "react";
import {
  Ticket,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DashboardData {
  overview: {
    totalTickets: number;
    openTickets: number;
    inProgressTickets: number;
    resolvedTickets: number;
    closedTickets: number;
    totalCustomers: number;
    resolutionRate: number;
  };
  priorityDistribution: {
    Low: number;
    Medium: number;
    High: number;
    Urgent: number;
  };
  recentTickets: {
    _id: string;
    ticketId: string;
    subject: string;
    customerName: string;
    customerEmail: string;
    priority: string;
    status: string;
    createdAt: string;
  }[];
}

const COLORS = ["#94A3B8", "#3B82F6", "#F59E0B", "#EF4444"];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchDashboard() {
    try {
      setError("");

      const response = await fetch("/api/dashboard", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load dashboard");
      }

      setData(result.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  const overview = data?.overview;

  const stats = [
    {
      title: "Total Tickets",
      value: overview?.totalTickets ?? 0,
      icon: Ticket,
      color: "bg-violet-50 text-violet-600",
    },
    {
      title: "Open Tickets",
      value: overview?.openTickets ?? 0,
      icon: AlertCircle,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "In Progress",
      value: overview?.inProgressTickets ?? 0,
      icon: Clock,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Total Customers",
      value: overview?.totalCustomers ?? 0,
      icon: Users,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  const priorityData = data
    ? [
        { name: "Low", value: data.priorityDistribution.Low },
        { name: "Medium", value: data.priorityDistribution.Medium },
        { name: "High", value: data.priorityDistribution.High },
        { name: "Urgent", value: data.priorityDistribution.Urgent },
      ]
    : [];

  const statusData = data
    ? [
        { name: "Open", value: overview?.openTickets ?? 0 },
        { name: "In Progress", value: overview?.inProgressTickets ?? 0 },
        { name: "Resolved", value: overview?.resolvedTickets ?? 0 },
        { name: "Closed", value: overview?.closedTickets ?? 0 },
      ]
    : [];

  const hasPriorityData = priorityData.some((item) => item.value > 0);

  return (
    <div className="min-h-full w-full bg-[#F7F8FA] p-5 text-slate-900 md:p-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-slate-800">Overview</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            Dashboard Overview
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor your support operations and ticket performance.
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button
            onClick={fetchDashboard}
            className="ml-2 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{stat.title}</p>
                <div className={`rounded-xl p-2.5 ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>

              <h2 className="mt-4 text-3xl font-bold">
                {loading ? "..." : stat.value}
              </h2>

              <p className="mt-2 text-xs text-slate-400">
                Live database statistics
              </p>
            </div>
          );
        })}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-2">
          <div className="mb-6">
            <h2 className="font-semibold">Ticket Status Overview</h2>
            <p className="mt-1 text-xs text-slate-500">
              Current distribution of support tickets
            </p>
          </div>

          {loading ? (
            <div className="flex h-[260px] items-center justify-center text-sm text-slate-400">
              Loading ticket data...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={["#8B5CF6", "#3B82F6", "#10B981", "#64748B"][index]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col justify-center gap-4">
                {statusData.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor: [
                            "#8B5CF6",
                            "#3B82F6",
                            "#10B981",
                            "#64748B",
                          ][index],
                        }}
                      />
                      <span className="text-sm text-slate-600">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-5">
            <h2 className="font-semibold">Resolution Rate</h2>
            <p className="mt-1 text-xs text-slate-500">
              Resolved and closed tickets
            </p>
          </div>

          <div className="flex h-[180px] flex-col items-center justify-center">
            <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-[12px] border-violet-100">
              <div
                className="absolute inset-[-12px] rounded-full border-[12px] border-violet-600"
                style={{
                  clipPath: `inset(${100 - (overview?.resolutionRate ?? 0)}% 0 0 0)`,
                }}
              />
              <span className="text-3xl font-bold">
                {loading ? "..." : `${overview?.resolutionRate ?? 0}%`}
              </span>
            </div>
          </div>

          <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Resolved</span>
              <span className="font-semibold">
                {overview?.resolvedTickets ?? 0}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Closed</span>
              <span className="font-semibold">
                {overview?.closedTickets ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-5">
            <h2 className="font-semibold">Priority Distribution</h2>
            <p className="mt-1 text-xs text-slate-500">
              Tickets grouped by priority
            </p>
          </div>

          {loading ? (
            <div className="flex h-[220px] items-center justify-center text-sm text-slate-400">
              Loading...
            </div>
          ) : hasPriorityData ? (
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {priorityData.map((item, index) => (
                      <Cell key={item.name} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[220px] items-center justify-center text-sm text-slate-400">
              No priority data available.
            </div>
          )}

          <div className="mt-3 grid grid-cols-2 gap-3">
            {priorityData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2 text-sm">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[index] }}
                />
                <span className="text-slate-500">{item.name}</span>
                <span className="font-semibold">{loading ? "..." : item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Ticket Performance</h2>
              <p className="mt-1 text-xs text-slate-500">
                Current ticket counts by status
              </p>
            </div>
            <TrendingUp size={20} className="text-violet-600" />
          </div>

          {loading ? (
            <div className="flex h-[220px] items-center justify-center text-sm text-slate-400">
              Loading...
            </div>
          ) : (
            <div className="space-y-5 pt-3">
              {statusData.map((item, index) => {
                const total = overview?.totalTickets ?? 0;
                const percentage =
                  total > 0 ? (item.value / total) * 100 : 0;

                return (
                  <div key={item.name}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-slate-600">{item.name}</span>
                      <span className="font-semibold">{item.value}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: [
                            "#8B5CF6",
                            "#3B82F6",
                            "#10B981",
                            "#64748B",
                          ][index],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="font-semibold">Recent Tickets</h2>
            <p className="mt-1 text-xs text-slate-500">
              Latest tickets from your database
            </p>
          </div>
          <Ticket size={20} className="text-slate-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4 font-medium">Ticket</th>
                <th className="px-5 py-4 font-medium">Customer</th>
                <th className="px-5 py-4 font-medium">Priority</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Created</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-400">
                    Loading tickets...
                  </td>
                </tr>
              ) : data?.recentTickets.length ? (
                data.recentTickets.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold">{ticket.subject}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {ticket.ticketId}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium">{ticket.customerName}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {ticket.customerEmail}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-xs font-medium text-slate-700">
                        {ticket.priority}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                        ticket.status === "Open"
                          ? "bg-amber-50 text-amber-700"
                          : ticket.status === "In Progress"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}>
                        {ticket.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-400">
                    No tickets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-5 text-center text-xs text-slate-400">
        ServiceDesk Intelligence · Live MongoDB Data
      </p>
    </div>
  );
}
