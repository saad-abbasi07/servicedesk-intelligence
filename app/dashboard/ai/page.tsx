
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BrainCircuit,
  Sparkles,
  MessageSquare,
  Activity,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  TrendingUp,
  Tag,
  ShieldAlert,
  Copy,
} from "lucide-react";

interface Ticket {
  _id: string;
  ticketId: string;
  subject: string;
  description: string;
  customerName: string;
  customerEmail: string;
  category: string;
  priority: string;
  status: string;
}

interface Analysis {
  _id: string;
  ticket: Ticket | null;
  suggestedCategory: string;
  suggestedPriority: string;
  sentiment: "Positive" | "Neutral" | "Negative";
  summary: string;
  reasoning: string;
  suggestedResponse: string;
  keywords: string[];
  createdAt: string;
}

export default function AIIntelligencePage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState("");

  const fetchAnalyses = useCallback(async () => {
    try {
      setError("");

      const response = await fetch("/api/ai/analyses", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load AI data.");
      }

      setAnalyses(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  const negativeCount = analyses.filter(
    (item) => item.sentiment === "Negative"
  ).length;

  const positiveCount = analyses.filter(
    (item) => item.sentiment === "Positive"
  ).length;

  const highPriorityCount = analyses.filter(
    (item) =>
      item.suggestedPriority === "High" ||
      item.suggestedPriority === "Urgent"
  ).length;

  const copyResponse = async (id: string, response: string) => {
    try {
      await navigator.clipboard.writeText(response);
      setCopiedId(id);
      setTimeout(() => setCopiedId(""), 2000);
    } catch {
      setError("Could not copy response.");
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleString();

  return (
    <div className="min-h-full bg-[#F7F8FA] p-5 text-slate-900 md:p-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-slate-800">AI Intelligence</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            AI Intelligence
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor AI-powered ticket analysis and recommendations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchAnalyses}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh Data
          </button>

          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            AI Engine Active
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "AI Analyzed Tickets",
            value: analyses.length,
            icon: MessageSquare,
            color: "text-violet-600",
            bg: "bg-violet-50",
          },
          {
            title: "Negative Sentiment",
            value: negativeCount,
            icon: AlertCircle,
            color: "text-red-600",
            bg: "bg-red-50",
          },
          {
            title: "High / Urgent Priority",
            value: highPriorityCount,
            icon: ShieldAlert,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            title: "Positive Sentiment",
            value: positiveCount,
            icon: TrendingUp,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
        ].map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.title}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{metric.title}</p>
                <div className={`rounded-xl p-2.5 ${metric.bg} ${metric.color}`}>
                  <Icon size={19} />
                </div>
              </div>

              <h2 className="mt-4 text-2xl font-bold">
                {loading ? "..." : metric.value}
              </h2>

              <p className="mt-2 text-xs text-slate-400">
                Based on saved AI analyses
              </p>
            </div>
          );
        })}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">AI Analysis Overview</h2>
              <p className="mt-1 text-xs text-slate-500">
                Actual ticket analysis distribution
              </p>
            </div>

            <Activity size={20} className="text-violet-600" />
          </div>

          {loading ? (
            <div className="flex h-40 items-center justify-center text-sm text-slate-400">
              Loading AI data...
            </div>
          ) : analyses.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-center">
              <BrainCircuit size={30} className="mb-3 text-slate-300" />
              <p className="text-sm font-medium text-slate-600">
                No AI analyses yet
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Analyze a ticket to see results here.
              </p>
            </div>
          ) : (
            <div className="space-y-6 pt-2">
              {[
                {
                  label: "Positive",
                  count: positiveCount,
                  color: "bg-emerald-500",
                },
                {
                  label: "Neutral",
                  count: analyses.filter(
                    (item) => item.sentiment === "Neutral"
                  ).length,
                  color: "bg-blue-500",
                },
                {
                  label: "Negative",
                  count: negativeCount,
                  color: "bg-red-500",
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-semibold">
                      {item.count} (
                      {Math.round((item.count / analyses.length) * 100)}%)
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all`}
                      style={{
                        width: `${(item.count / analyses.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-7 flex flex-wrap gap-5 text-xs text-slate-500">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Positive
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Neutral
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Negative
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-violet-100 p-3 text-violet-700">
              <BrainCircuit size={22} />
            </div>

            <div>
              <h2 className="font-semibold">AI Engine Status</h2>
              <p className="text-xs text-emerald-600">
                Backend connected
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {[
              "Ticket Classification",
              "Sentiment Analysis",
              "Priority Detection",
              "Response Generation",
            ].map((name) => (
              <div
                key={name}
                className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0"
              >
                <span className="text-sm text-slate-600">{name}</span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                  <CheckCircle2 size={14} />
                  Ready
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-xl bg-violet-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-violet-800">
              <Sparkles size={16} />
              AI Performance
            </div>

            <p className="mt-2 text-xs leading-5 text-violet-700">
              {analyses.length} ticket analyses are saved in the database.
              Recommendations are generated using Gemini.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Recent AI Activities</h2>
            <p className="mt-1 text-xs text-slate-500">
              Actual saved ticket analysis results
            </p>
          </div>

          <Activity size={19} className="text-slate-400" />
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-slate-400">
            Loading analyses...
          </div>
        ) : analyses.length === 0 ? (
          <div className="py-10 text-center">
            <MessageSquare className="mx-auto mb-3 text-slate-300" size={30} />
            <p className="text-sm text-slate-500">
              No analyzed tickets found.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {analyses.map((analysis) => (
              <div
                key={analysis._id}
                className="rounded-xl border border-slate-100 p-4"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <h3 className="font-semibold">
                      {analysis.ticket?.subject || "Ticket unavailable"}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {analysis.ticket?.ticketId || "Unknown ticket"} ·{" "}
                      {analysis.ticket?.customerName || "Unknown customer"}
                    </p>
                  </div>

                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock size={13} />
                    {formatDate(analysis.createdAt)}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {analysis.summary}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                    <Tag size={12} className="mr-1 inline" />
                    {analysis.suggestedCategory}
                  </span>

                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                    Priority: {analysis.suggestedPriority}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      analysis.sentiment === "Negative"
                        ? "bg-red-50 text-red-700"
                        : analysis.sentiment === "Positive"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {analysis.sentiment} Sentiment
                  </span>
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-slate-800">
                      Suggested Customer Response
                    </h4>

                    <button
                      onClick={() =>
                        copyResponse(
                          analysis._id,
                          analysis.suggestedResponse
                        )
                      }
                      className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      <Copy size={13} />
                      {copiedId === analysis._id ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <p className="text-sm leading-6 text-slate-600">
                    {analysis.suggestedResponse}
                  </p>
                </div>

                {analysis.keywords.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {analysis.keywords.map((keyword, index) => (
                      <span
                        key={`${keyword}-${index}`}
                        className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-500"
                      >
                        #{keyword}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 border-t border-slate-100 pt-3">
                  <p className="text-xs font-medium text-slate-500">
                    AI Reasoning
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    {analysis.reasoning}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="mt-5 text-center text-xs text-slate-400">
        Data sourced from your MongoDB AI analysis records.
      </p>
    </div>
  );
}
