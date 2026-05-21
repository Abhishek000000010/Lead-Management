"use client";

import { useState } from "react";

export default function TestTools() {
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const resetQuota = async () => {
    setLoading(true);
    setOutput(null);
    try {
      const eventKey = `manual-reset-${Date.now()}`;
      const res = await fetch("/api/webhook/reset-quota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventKey }),
      });
      const data = await res.json();
      setOutput({
        action: "Reset Quota",
        eventKey,
        status: res.status,
        response: data,
      });
    } catch (error: any) {
      setOutput({ action: "Reset Quota", error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const callWebhookMultipleTimes = async () => {
    setLoading(true);
    setOutput(null);
    try {
      const eventKey = `idempotency-test-${Date.now()}`;
      const results = [];

      for (let attempt = 1; attempt <= 3; attempt++) {
        const res = await fetch("/api/webhook/reset-quota", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventKey }),
        });
        const data = await res.json();
        results.push({ attempt, status: res.status, response: data });
      }

      setOutput({
        action: "Webhook 3x Test (Idempotency)",
        sharedEventKey: eventKey,
        results,
      });
    } catch (error: any) {
      setOutput({
        action: "Webhook 3x Test (Idempotency)",
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const generateLeads = async () => {
    setLoading(true);
    setOutput(null);
    try {
      const res = await fetch("/api/test/generate-leads", {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        setOutput({
          action: "Generate 10 Leads",
          status: res.status,
          successCount: data.successCount,
          failedCount: data.failedCount,
          results: data.results,
        });
      } else {
        setOutput({
          action: "Generate 10 Leads",
          status: res.status,
          error: data.error,
        });
      }
    } catch (error: any) {
      setOutput({ action: "Generate 10 Leads", error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-12 animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Test Tools</h1>
          <p className="text-gray-500 mt-1">Simulate concurrent loads and test API idempotency.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col animate-fade-in-delayed transition-transform hover:-translate-y-1 hover:shadow-md">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-2">Reset Provider Quota</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Sends a single webhook payload with a unique event key to reset all provider used quotas back to 0.
              </p>
            </div>
            <button
              onClick={resetQuota}
              disabled={loading}
              className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-2.5 px-4 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 transition-colors"
            >
              Reset Quota
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col animate-fade-in-delayed transition-transform hover:-translate-y-1 hover:shadow-md">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-2">Webhook Idempotency</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Calls the reset webhook 3 times sequentially using the exact same event key to test database locks.
              </p>
            </div>
            <button
              onClick={callWebhookMultipleTimes}
              disabled={loading}
              className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-2.5 px-4 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 transition-colors"
            >
              Run 3x Test
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col animate-fade-in-delayed transition-transform hover:-translate-y-1 hover:shadow-md">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-2">Generate 10 Leads</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Fires 10 lead creation requests concurrently to test allocation logic under write pressure.
              </p>
            </div>
            <button
              onClick={generateLeads}
              disabled={loading}
              className="w-full bg-gray-900 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 transition-colors"
            >
              Generate Leads
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Execution Output</h2>
            {loading && <span className="text-xs font-medium text-gray-500 animate-pulse bg-gray-200 px-2 py-1 rounded-full">Running...</span>}
          </div>
          <div className="p-5 bg-[#0d1117] text-gray-300 font-mono text-sm overflow-y-auto max-h-[500px] min-h-[300px]">
            {output ? (
              <pre className="whitespace-pre-wrap break-all">
                {JSON.stringify(output, null, 2)}
              </pre>
            ) : (
              <div className="text-gray-500 h-full flex items-center justify-center italic pt-20">
                Awaiting action...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
