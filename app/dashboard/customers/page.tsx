
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Users,
  UserPlus,
  Search,
  RefreshCw,
  Trash2,
  X,
  Loader2,
  Building2,
  Mail,
  Phone,
} from "lucide-react";

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  totalTickets: number;
  status: "Active" | "Inactive";
  createdAt: string;
}

const initialForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchCustomers = useCallback(async () => {
    try {
      setError("");

      const response = await fetch("/api/customers", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch customers");
      }

      setCustomers(result.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  function openCreateModal() {
    setEditingId(null);
    setForm(initialForm);
    setError("");
    setShowModal(true);
  }

  function openEditModal(customer: Customer) {
    setEditingId(customer._id);
    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || "",
      company: customer.company || "",
    });
    setError("");
    setShowModal(true);
  }

  async function saveCustomer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const isEditing = Boolean(editingId);

      const response = await fetch(
        isEditing ? `/api/customers/${editingId}` : "/api/customers",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save customer");
      }

      setShowModal(false);
      setForm(initialForm);
      setEditingId(null);

      setSuccess(
        isEditing
          ? "Customer updated successfully."
          : "Customer created successfully."
      );

      await fetchCustomers();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save customer"
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(`/api/customers/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update status");
      }

      setCustomers((prev) =>
        prev.map((customer) =>
          customer._id === id ? result.data : customer
        )
      );

      setSuccess("Customer status updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update status"
      );
      await fetchCustomers();
    }
  }

  async function deleteCustomer(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete customer");
      }

      setCustomers((prev) =>
        prev.filter((customer) => customer._id !== id)
      );

      setSuccess("Customer deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete customer"
      );
    }
  }

  const filteredCustomers = customers.filter((customer) => {
    const term = search.toLowerCase();

    return (
      customer.name.toLowerCase().includes(term) ||
      customer.email.toLowerCase().includes(term) ||
      (customer.company || "").toLowerCase().includes(term) ||
      (customer.phone || "").toLowerCase().includes(term)
    );
  });

  const activeCount = customers.filter(
    (customer) => customer.status === "Active"
  ).length;

  const inactiveCount = customers.filter(
    (customer) => customer.status === "Inactive"
  ).length;

  return (
    <div className="min-h-full bg-[#F7F8FA] p-5 text-slate-900 md:p-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-slate-800">Customers</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            Customer Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage customer profiles and their information.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchCustomers}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
          >
            <UserPlus size={17} />
            Add Customer
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

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total Customers</p>
            <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
              <Users size={19} />
            </div>
          </div>
          <h2 className="mt-4 text-3xl font-bold">
            {loading ? "..." : customers.length}
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            Live database records
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Active Customers</p>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <Users size={19} />
            </div>
          </div>
          <h2 className="mt-4 text-3xl font-bold">
            {loading ? "..." : activeCount}
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            Currently active
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Inactive Customers</p>
            <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
              <Users size={19} />
            </div>
          </div>
          <h2 className="mt-4 text-3xl font-bold">
            {loading ? "..." : inactiveCount}
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            Currently inactive
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">All Customers</h2>
            <p className="mt-1 text-xs text-slate-500">
              {filteredCustomers.length} customers found
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 sm:w-72">
            <Search size={17} className="shrink-0 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4 font-medium">Customer</th>
                <th className="px-5 py-4 font-medium">Contact</th>
                <th className="px-5 py-4 font-medium">Company</th>
                <th className="px-5 py-4 font-medium">Tickets</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Joined</th>
                <th className="px-5 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center">
                    <Loader2
                      size={22}
                      className="mx-auto animate-spin text-violet-600"
                    />
                    <p className="mt-3 text-sm text-slate-400">
                      Loading customers...
                    </p>
                  </td>
                </tr>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">
                            {customer.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            Customer
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail size={14} className="text-slate-400" />
                        {customer.email}
                      </p>
                      {customer.phone && (
                        <p className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                          <Phone size={13} />
                          {customer.phone}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <p className="flex items-center gap-2 text-sm text-slate-600">
                        <Building2 size={15} className="text-slate-400" />
                        {customer.company || "Not provided"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-slate-700">
                      {customer.totalTickets}
                    </td>

                    <td className="px-5 py-4">
                      <select
                        value={customer.status}
                        onChange={(e) =>
                          updateStatus(customer._id, e.target.value)
                        }
                        className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none ${
                          customer.status === "Active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-500">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(customer)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteCustomer(customer._id)}
                          title="Delete customer"
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-14 text-center text-sm text-slate-400"
                  >
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4">
          <div className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-bold">
                  {editingId ? "Edit Customer" : "Add New Customer"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Enter customer information below.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveCustomer} className="space-y-4 p-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Full Name
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="Enter full name"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  placeholder="customer@example.com"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Phone
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="03001234567"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Company
                  </label>
                  <input
                    value={form.company}
                    onChange={(e) =>
                      setForm({ ...form, company: e.target.value })
                    }
                    placeholder="Company name"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                  />
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
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Add Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
