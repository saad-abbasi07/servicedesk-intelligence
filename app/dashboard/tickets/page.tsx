
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Ticket as TicketIcon,
  Plus,
  Search,
  RefreshCw,
  Trash2,
  X,
  AlertCircle,
  Clock,
  CheckCircle2,
  Loader2,
  BrainCircuit,
  Sparkles,
  Eye,
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
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  assignedTo: string;
  createdAt: string;
}

interface AIAnalysis {
  _id: string;
  ticket: {
    _id: string;
    ticketId: string;
  } | string;
  suggestedCategory: string;
  suggestedPriority: "Low" | "Medium" | "High" | "Urgent";
  sentiment: "Positive" | "Neutral" | "Negative";
  summary: string;
  reasoning: string;
  suggestedResponse: string;
  keywords: string[];
  createdAt: string;
}

const initialForm = {
  subject: "",
  description: "",
  customerName: "",
  customerEmail: "",
  category: "Technical",
  priority: "Medium",
};

const statusStyles: Record<string, string> = {
  Open: "bg-amber-50 text-amber-700",
  "In Progress": "bg-blue-50 text-blue-700",
  Resolved: "bg-emerald-50 text-emerald-700",
  Closed: "bg-slate-100 text-slate-600",
};

const priorityStyles: Record<string, string> = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-blue-50 text-blue-700",
  High: "bg-orange-50 text-orange-700",
  Urgent: "bg-red-50 text-red-700",
};

function normalizeKeywords(keywords: string[] = []): string[] {
  const stopWords = new Set([
    "the",
    "and",
    "for",
    "with",
    "from",
    "this",
    "that",
    "issue",
    "customer",
  ]);

  const result = keywords.flatMap((item) => {
    if (typeof item !== "string") return [];

    const cleaned = item
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/([a-zA-Z])(\d)/g, "$1 $2")
      .replace(/(\d)([a-zA-Z])/g, "$1 $2")
      .replace(/[^a-zA-Z0-9\s-]/g, " ")
      .trim();

    if (!cleaned) return [];

    const words = cleaned.split(/\s+/).filter(Boolean);

    if (words.length === 1 && words[0].length > 12) {
      const commonWords = [
        "authentication",
        "password",
        "technical",
        "account",
        "customer",
        "billing",
        "support",
        "access",
        "login",
        "error",
        "payment",
        "service",
        "security",
        "request",
        "system",
        "email",
        "profile",
        "network",
        "response",
      ];

      const word = words[0].toLowerCase();
      const separated: string[] = [];
      let remaining = word;

      while (remaining.length > 0) {
        const match = commonWords
          .sort((a, b) => b.length - a.length)
          .find((candidate) => remaining.startsWith(candidate));

        if (!match) {
          separated.push(remaining);
          break;
        }

        separated.push(match);
        remaining = remaining.slice(match.length);
      }

      return separated;
    }

    return words;
  });

  return [
    ...new Set(
      result
        .map((word) => word.toLowerCase().trim())
        .filter((word) => word.length > 1 && !stopWords.has(word))
    ),
  ].slice(0, 10);
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, AIAnalysis>>({});
  const [selectedAnalysis, setSelectedAnalysis] =
    useState<AIAnalysis | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzingId, setAnalyzingId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchTickets = useCallback(async () => {
    try {
      setError("");

      const [ticketResponse, analysisResponse] = await Promise.all([
        fetch("/api/tickets", { cache: "no-store" }),
        fetch("/api/ai/analyses", { cache: "no-store" }),
      ]);

      const ticketResult = await ticketResponse.json();

      if (!ticketResponse.ok || !ticketResult.success) {
        throw new Error(ticketResult.message || "Failed to fetch tickets");
      }

      setTickets(ticketResult.data);

      if (analysisResponse.ok) {
        const analysisResult = await analysisResponse.json();

        if (analysisResult.success) {
          const analysisMap: Record<string, AIAnalysis> = {};

          analysisResult.data.forEach((analysis: AIAnalysis) => {
            const ticketId =
              typeof analysis.ticket === "string"
                ? analysis.ticket
                : analysis.ticket?._id;

            if (ticketId) {
              analysisMap[ticketId] = analysis;
            }
          });

          setAnalyses(analysisMap);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Open the ticket modal when navigating from the Header button.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("newTicket") === "1") {
      setError("");
      setShowModal(true);

      window.history.replaceState(
        {},
        "",
        window.location.pathname
      );
    }
  }, []);

  async function createTicket(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create ticket");
      }

      setForm(initialForm);
      setShowModal(false);
      setSuccess("Ticket created successfully.");
      await fetchTickets();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create ticket"
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateTicket(
    id: string,
    field: "status" | "priority",
    value: string
  ) {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(`/api/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update ticket");
      }

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket._id === id ? result.data : ticket
        )
      );

      setSuccess("Ticket updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update ticket"
      );
      await fetchTickets();
    }
  }

  async function analyzeTicket(id: string) {
    try {
      setAnalyzingId(id);
      setError("");
      setSuccess("");

      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: id }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "AI analysis failed.");
      }

      const analysis = result.data as AIAnalysis;

      setAnalyses((prev) => ({
        ...prev,
        [id]: analysis,
      }));

      setSelectedAnalysis(analysis);
      setSuccess("AI analysis completed successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to analyze ticket."
      );
    } finally {
      setAnalyzingId("");
    }
  }

  async function deleteTicket(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this ticket?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const response = await fetch(`/api/tickets/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete ticket");
      }

      setTickets((prev) => prev.filter((ticket) => ticket._id !== id));

      setAnalyses((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });

      setSuccess("Ticket deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete ticket"
      );
    }
  }

  const filteredTickets = tickets.filter((ticket) => {
    const searchTerm = search.toLowerCase();

    const matchesSearch =
      ticket.ticketId.toLowerCase().includes(searchTerm) ||
      ticket.subject.toLowerCase().includes(searchTerm) ||
      ticket.customerName.toLowerCase().includes(searchTerm) ||
      ticket.customerEmail.toLowerCase().includes(searchTerm);

    const matchesStatus =
      statusFilter === "All" || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = [
    {
      title: "Total Tickets",
      value: tickets.length,
      icon: TicketIcon,
      color: "bg-violet-50 text-violet-600",
    },
    {
      title: "Open Tickets",
      value: tickets.filter((t) => t.status === "Open").length,
      icon: AlertCircle,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "In Progress",
      value: tickets.filter((t) => t.status === "In Progress").length,
      icon: Clock,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Resolved",
      value: tickets.filter(
        (t) => t.status === "Resolved" || t.status === "Closed"
      ).length,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="min-h-full bg-[#F7F8FA] p-5 text-slate-900 md:p-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-slate-800">Tickets</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            Tickets Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage and track all customer support tickets.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchTickets}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={() => {
              setError("");
              setShowModal(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            <Plus size={17} />
            New Ticket
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button onClick={() => setError("")}>
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {success}
          <button onClick={() => setSuccess("")}>
            <X size={17} />
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
                  <Icon size={19} />
                </div>
              </div>

              <h2 className="mt-4 text-3xl font-bold">
                {loading ? "..." : stat.value}
              </h2>

              <p className="mt-2 text-xs text-slate-400">
                Live database records
              </p>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold">All Tickets</h2>
            <p className="mt-1 text-xs text-slate-500">
              {filteredTickets.length} tickets found
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 sm:w-64">
              <Search size={17} className="shrink-0 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tickets..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-500"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1250px] text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4 font-medium">Ticket</th>
                <th className="px-5 py-4 font-medium">Customer</th>
                <th className="px-5 py-4 font-medium">Category</th>
                <th className="px-5 py-4 font-medium">Priority</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Created</th>
                <th className="px-5 py-4 font-medium">AI Analysis</th>
                <th className="px-5 py-4 text-right font-medium">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-14 text-center">
                    <Loader2
                      size={22}
                      className="mx-auto animate-spin text-violet-600"
                    />
                    <p className="mt-3 text-sm text-slate-400">
                      Loading tickets...
                    </p>
                  </td>
                </tr>
              ) : filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => {
                  const analysis = analyses[ticket._id];

                  return (
                    <tr key={ticket._id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold">
                          {ticket.subject}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {ticket.ticketId}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium">
                          {ticket.customerName}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {ticket.customerEmail}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {ticket.category}
                      </td>

                      <td className="px-5 py-4">
                        <select
                          value={ticket.priority}
                          onChange={(e) =>
                            updateTicket(ticket._id, "priority", e.target.value)
                          }
                          className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none ${priorityStyles[ticket.priority]}`}
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Urgent">Urgent</option>
                        </select>
                      </td>

                      <td className="px-5 py-4">
                        <select
                          value={ticket.status}
                          onChange={(e) =>
                            updateTicket(ticket._id, "status", e.target.value)
                          }
                          className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none ${statusStyles[ticket.status]}`}
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-500">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4">
                        {analyzingId === ticket._id ? (
                          <button
                            disabled
                            className="flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700"
                          >
                            <Loader2 size={15} className="animate-spin" />
                            Analyzing...
                          </button>
                        ) : analysis ? (
                          <button
                            onClick={() => setSelectedAnalysis(analysis)}
                            className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                          >
                            <Eye size={15} />
                            View Analysis
                          </button>
                        ) : (
                          <button
                            onClick={() => analyzeTicket(ticket._id)}
                            className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-100"
                          >
                            <BrainCircuit size={15} />
                            Analyze with AI
                          </button>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => deleteTicket(ticket._id)}
                          title="Delete ticket"
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={17} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-14 text-center text-sm text-slate-400"
                  >
                    No tickets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAnalysis && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
          <div className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-violet-100 p-2.5 text-violet-700">
                  <BrainCircuit size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">AI Ticket Analysis</h2>
                  <p className="text-xs text-slate-500">
                    AI-generated insights and recommendations
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedAnalysis(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Suggested Category
                  </p>
                  <p className="mt-2 font-semibold">
                    {selectedAnalysis.suggestedCategory}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Suggested Priority
                  </p>
                  <p className="mt-2 font-semibold">
                    {selectedAnalysis.suggestedPriority}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Customer Sentiment
                  </p>
                  <p className="mt-2 font-semibold">
                    {selectedAnalysis.sentiment}
                  </p>
                </div>
              </div>

              <section>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <Sparkles size={16} className="text-violet-600" />
                  Issue Summary
                </h3>
                <p className="rounded-xl border border-slate-200 p-4 text-sm leading-6 text-slate-600">
                  {selectedAnalysis.summary}
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-sm font-semibold">AI Reasoning</h3>
                <p className="rounded-xl border border-slate-200 p-4 text-sm leading-6 text-slate-600">
                  {selectedAnalysis.reasoning}
                </p>
              </section>

              <section>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">
                    Suggested Customer Response
                  </h3>

                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          selectedAnalysis.suggestedResponse
                        );
                        setSuccess("Suggested response copied.");
                      } catch {
                        setError("Unable to copy response.");
                      }
                    }}
                    className="flex items-center gap-1 text-xs font-medium text-violet-700 hover:text-violet-900"
                  >
                    <Copy size={14} />
                    Copy
                  </button>
                </div>

                <p className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm leading-6 text-slate-700">
                  {selectedAnalysis.suggestedResponse}
                </p>
              </section>

              <section>
                <h3 className="mb-3 text-sm font-semibold">
                  Detected Keywords
                </h3>

                <div className="flex flex-wrap gap-2">
                  {normalizeKeywords(selectedAnalysis.keywords).length > 0 ? (
                    normalizeKeywords(selectedAnalysis.keywords).map(
                      (keyword, index) => (
                        <span
                          key={`${keyword}-${index}`}
                          className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-medium capitalize text-violet-700"
                        >
                          {keyword}
                        </span>
                      )
                    )
                  ) : (
                    <p className="text-sm text-slate-400">
                      No keywords detected.
                    </p>
                  )}
                </div>
              </section>

              <p className="text-xs text-slate-400">
                Analysis generated:{" "}
                {new Date(selectedAnalysis.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="flex justify-end border-t border-slate-100 p-5">
              <button
                onClick={() => setSelectedAnalysis(null)}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4">
          <div className="my-auto w-full max-w-xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-bold">Create New Ticket</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Add a new customer support ticket.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={createTicket} className="space-y-4 p-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Subject
                </label>
                <input
                  required
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                  placeholder="Enter ticket subject"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe the issue..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Customer Name
                  </label>
                  <input
                    required
                    value={form.customerName}
                    onChange={(e) =>
                      setForm({ ...form, customerName: e.target.value })
                    }
                    placeholder="Customer name"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Customer Email
                  </label>
                  <input
                    required
                    type="email"
                    value={form.customerEmail}
                    onChange={(e) =>
                      setForm({ ...form, customerEmail: e.target.value })
                    }
                    placeholder="customer@example.com"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Billing">Billing</option>
                    <option value="Account">Account</option>
                    <option value="General">General</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Priority
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
                >
                  {saving && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  {saving ? "Creating..." : "Create Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
