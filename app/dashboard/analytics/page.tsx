
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  RefreshCw,
  Ticket,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Loader2,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface AnalyticsData {
  overview: {
    totalTickets: number;
    openTickets: number;
    inProgressTickets: number;
    resolvedTickets: number;
    closedTickets: number;
    resolutionRate: number;
  };
  priorityDistribution: {
    name: string;
    value: number;
  }[];
  statusDistribution: {
    name: string;
    value: number;
  }[];
  monthlyTickets: {
    month: string;
    tickets: number;
  }[];
  categoryDistribution: {
    name: string;
    value: number;
  }[];
}

const COLORS = ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B"];
const PRIORITY_COLORS = ["#94A3B8", "#3B82F6", "#F97316", "#EF4444"];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = useCallback(async () => {
    try {
      setError("");

      const response = await fetch("/api/analytics", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load analytics");
      }

      setData(result.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const overview = data?.overview;

  const stats = [
    {
      title: "Total Tickets",
      value: overview?.totalTickets ?? 0,
      description: "All recorded tickets",
      icon: Ticket,
      color: "bg-violet-50 text-violet-600",
    },
    {
      title: "Open Tickets",
      value: overview?.openTickets ?? 0,
      description: "Waiting for attention",
      icon: AlertCircle,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "In Progress",
      value: overview?.inProgressTickets ?? 0,
      description: "Currently being handled",
      icon: Clock,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Resolution Rate",
      value: `${overview?.resolutionRate ?? 0}%`,
      description: "Resolved and closed tickets",
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="min-h-full bg-[#F7F8FA] p-5 text-slate-900 md:p-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <span>Insights</span>
            <span>/</span>
            <span className="text-slate-800">Analytics</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            Analytics Overview
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor ticket performance and support operations.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
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
                  <Icon size={19} />
                </div>
              </div>

              <h2 className="mt-4 text-3xl font-bold">
                {loading ? "..." : stat.value}
              </h2>

              <p className="mt-2 text-xs text-slate-400">
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>

      {loading && !data ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center">
          <Loader2
            size={25}
            className="mx-auto animate-spin text-violet-600"
          />
          <p className="mt-3 text-sm text-slate-500">
            Loading analytics data...
          </p>
        </div>
      ) : data ? (
        <>
          <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-6">
                <h2 className="font-semibold">Ticket Volume</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Tickets created over the last six months
                </p>
              </div>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.monthlyTickets}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E2E8F0"
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748B", fontSize: 12 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748B", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #E2E8F0",
                      }}
                    />
                    <Bar
                      dataKey="tickets"
                      name="Tickets"
                      fill="#8B5CF6"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-4">
                <h2 className="font-semibold">Ticket Status Overview</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Current distribution of ticket statuses
                </p>
              </div>

              <div className="h-[300px]">
                {overview?.totalTickets ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.statusDistribution.filter(
                          (item) => item.value > 0
                        )}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        innerRadius={65}
                        outerRadius={100}
                        paddingAngle={3}
                      >
                        {data.statusDistribution
                          .filter((item) => item.value > 0)
                          .map((item) => (
                            <Cell
                              key={item.name}
                              fill={
                                COLORS[
                                  data.statusDistribution.findIndex(
                                    (status) => status.name === item.name
                                  )
                                ]
                              }
                            />
                          ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    No ticket data available
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="font-semibold">Priority Distribution</h2>
              <p className="mt-1 text-xs text-slate-500">
                Tickets grouped by priority level
              </p>

              <div className="mt-6 space-y-5">
                {data.priorityDistribution.map((item, index) => {
                  const percentage =
                    overview && overview.totalTickets > 0
                      ? (item.value / overview.totalTickets) * 100
                      : 0;

                  return (
                    <div key={item.name}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-600">
                          {item.name}
                        </span>
                        <span className="text-sm font-semibold">
                          {item.value}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: PRIORITY_COLORS[index],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="font-semibold">Top Ticket Categories</h2>
              <p className="mt-1 text-xs text-slate-500">
                Most common customer support categories
              </p>

              <div className="mt-5 space-y-3">
                {data.categoryDistribution.length > 0 ? (
                  data.categoryDistribution.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
                    >
                      <span className="text-sm font-medium text-slate-700">
                        {item.name}
                      </span>
                      <span className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-violet-700">
                        {item.value}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-center text-sm text-slate-400">
                    No category data available
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h2 className="font-semibold">Resolution Summary</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Resolved and closed tickets combined
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Resolved</p>
                <p className="mt-2 text-2xl font-bold">
                  {overview?.resolvedTickets}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Closed</p>
                <p className="mt-2 text-2xl font-bold">
                  {overview?.closedTickets}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Total Resolved</p>
                <p className="mt-2 text-2xl font-bold">
                  {(overview?.resolvedTickets ?? 0) +
                    (overview?.closedTickets ?? 0)}
                </p>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
