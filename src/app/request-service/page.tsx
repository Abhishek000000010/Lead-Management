"use client";

import { useState } from "react";

export default function RequestService() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    serviceId: "1",
    description: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [assignedProviders, setAssignedProviders] = useState<number[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    setAssignedProviders([]);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          serviceId: parseInt(formData.serviceId, 10),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("Lead submitted successfully.");
        setAssignedProviders(data.assignedProviderIds || []);
        setFormData({
          name: "",
          phone: "",
          city: "",
          serviceId: "1",
          description: "",
        });
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to submit lead.");
      }
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="flex-1 p-6 md:p-12 animate-fade-in">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Request Service</h1>
          <p className="text-gray-500 mt-1">Submit a new lead to be allocated to providers.</p>
        </div>

        {status === "success" && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-100 text-green-800 shadow-sm">
            <p className="font-medium">{message}</p>
            {assignedProviders.length > 0 && (
              <p className="text-sm mt-1">Assigned to Providers: {assignedProviders.join(", ")}</p>
            )}
          </div>
        )}

        {status === "error" && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 text-red-800 shadow-sm">
            <p className="font-medium">Error: {message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              id="name"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone *
            </label>
            <input
              id="phone"
              type="tel"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              id="city"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="serviceId" className="block text-sm font-medium text-gray-700 mb-1">
              Service *
            </label>
            <select
              id="serviceId"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              value={formData.serviceId}
              onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
            >
              <option value="1">Service 1</option>
              <option value="2">Service 2</option>
              <option value="3">Service 3</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-gray-900 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {status === "loading" ? "Submitting..." : "Submit Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
