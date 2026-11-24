
"use client";

import { useEffect, useState } from "react";
import {
  User,
  Bell,
  ShieldCheck,
  Save,
  Mail,
  Lock,
  Globe,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface NotificationSettings {
  email: boolean;
  tickets: boolean;
  updates: boolean;
}

export default function SettingsPage() {
  const [name, setName] = useState("Admin User");
  const [email, setEmail] = useState("admin@servicedesk.ai");
  const [role] = useState("Administrator");
  const [language, setLanguage] = useState("English");

  const [notifications, setNotifications] =
    useState<NotificationSettings>({
      email: true,
      tickets: true,
      updates: false,
    });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/settings");
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load settings");
        }

        const settings = result.data;

        setName(settings.name);
        setEmail(settings.email);
        setLanguage(settings.language);
        setNotifications(settings.notifications);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load settings"
        );
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          language,
          notifications,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save settings");
      }

      setName(result.data.name);
      setEmail(result.data.email);
      setLanguage(result.data.language);
      setNotifications(result.data.notifications);

      setMessage("Settings saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save settings"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F7F8FA]">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 className="animate-spin" size={20} />
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#F7F8FA] p-5 text-slate-900 md:p-8">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
          <span>Workspace</span>
          <span>/</span>
          <span className="text-slate-800">Settings</span>
        </div>

        <h1 className="text-2xl font-bold">Settings</h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage your account and application preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3 rounded-xl bg-violet-50 p-3">
              <User size={19} className="text-violet-700" />
              <span className="text-sm font-semibold text-violet-800">
                Profile Settings
              </span>
            </div>

            <div className="mt-3 flex items-center gap-3 p-3 text-sm text-slate-600">
              <Bell size={18} />
              Notifications
            </div>

            <div className="flex items-center gap-3 p-3 text-sm text-slate-600">
              <ShieldCheck size={18} />
              Security
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
              {name.trim().slice(0, 2).toUpperCase() || "AD"}
            </div>

            <h3 className="mt-3 font-semibold">{name}</h3>
            <p className="mt-1 break-all text-xs text-slate-500">{email}</p>

            <span className="mt-3 inline-block rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
              {role}
            </span>
          </div>
        </div>

        <div className="space-y-6 xl:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-violet-50 p-2.5 text-violet-700">
                <User size={20} />
              </div>

              <div>
                <h2 className="font-semibold">Profile Information</h2>
                <p className="text-xs text-slate-500">
                  Update your personal account details.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Full Name
                </label>

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-4 top-3.5 text-slate-400"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Role
                </label>

                <input
                  value={role}
                  readOnly
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Language
                </label>

                <div className="relative">
                  <Globe
                    size={17}
                    className="absolute left-4 top-3.5 text-slate-400"
                  />

                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-violet-500"
                  >
                    <option value="English">English</option>
                    <option value="Urdu">Urdu</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
                <Bell size={20} />
              </div>

              <div>
                <h2 className="font-semibold">
                  Notification Preferences
                </h2>
                <p className="text-xs text-slate-500">
                  Control which notifications you receive.
                </p>
              </div>
            </div>

            {[
              {
                key: "email" as const,
                title: "Email Notifications",
                description: "Receive important updates through email.",
              },
              {
                key: "tickets" as const,
                title: "Ticket Notifications",
                description: "Get notified about new and updated tickets.",
              },
              {
                key: "updates" as const,
                title: "Product Updates",
                description: "Receive announcements and feature updates.",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between border-b border-slate-100 py-4 last:border-0"
              >
                <div>
                  <h3 className="text-sm font-medium">{item.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      [item.key]: !prev[item.key],
                    }))
                  }
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    notifications[item.key]
                      ? "bg-violet-600"
                      : "bg-slate-300"
                  }`}
                  aria-label={`Toggle ${item.title}`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                      notifications[item.key] ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-700">
                <ShieldCheck size={20} />
              </div>

              <div>
                <h2 className="font-semibold">Security</h2>
                <p className="text-xs text-slate-500">
                  Manage your account security.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Lock size={19} className="text-slate-500" />

                <div>
                  <p className="text-sm font-medium">Password</p>
                  <p className="text-xs text-slate-500">
                    Change your account password.
                  </p>
                </div>
              </div>

              <span className="rounded-lg border border-slate-200 px-4 py-2 text-center text-xs font-medium text-slate-400">
                Authentication Required
              </span>
            </div>
          </section>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {message && (
            <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              <CheckCircle2 size={18} />
              {message}
            </div>
          )}

          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-xs text-slate-500">
              Settings are saved to your database.
            </p>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}

              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
