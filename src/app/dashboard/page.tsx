"use client";

import { useEffect, useState } from "react";

interface Lead {
  name: string;
  phone: string;
  city: string;
  serviceId: number;
  description: string;
  createdAt: string;
}

interface Provider {
  providerId: number;
  name: string;
  monthlyQuota: number;
  usedQuota: number;
  remainingQuota: number;
  leads: Lead[];
}

export default function Dashboard() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const data = await res.json();
          setProviders(data.providers || []);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
    const intervalId = setInterval(fetchDashboard, 2000);
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-12 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Realtime provider quota tracking and lead assignments.</p>
          </div>
          <div className="flex items-center text-sm text-gray-500 mt-4 sm:mt-0 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
            <span className="relative flex h-2.5 w-2.5 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            Live Updates
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {providers.map((provider) => {
            const isFull = provider.usedQuota >= provider.monthlyQuota;
            
            return (
              <div
                key={provider.providerId}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col animate-fade-in-delayed transition-transform hover:-translate-y-1 hover:shadow-md"
              >
                <div className="p-5 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg font-medium text-gray-900">{provider.name}</h2>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      isFull ? "bg-red-50 text-red-700 border border-red-100" : "bg-green-50 text-green-700 border border-green-100"
                    }`}>
                      {isFull ? "Quota Exhausted" : `Remaining: ${provider.remainingQuota}`}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${isFull ? "bg-red-500" : "bg-gray-900"}`} 
                      style={{ width: `${Math.min(100, (provider.usedQuota / provider.monthlyQuota) * 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-500 font-medium">
                    <span>Used: {provider.usedQuota} / {provider.monthlyQuota}</span>
                    <span>Total Leads: {provider.leads.length}</span>
                  </div>
                </div>

                <div className="p-0 flex-1 bg-gray-50/50 flex flex-col">
                  <div className="px-5 py-3 border-b border-gray-100 bg-white">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Leads</h3>
                  </div>
                  
                  <div className="overflow-y-auto max-h-[300px] p-4 space-y-3 flex-1">
                    {provider.leads.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-6 italic">No leads assigned</p>
                    ) : (
                      provider.leads.map((lead, index) => (
                        <div
                          key={index}
                          className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm text-sm"
                        >
                          <div className="font-medium text-gray-900 mb-1">{lead.name}</div>
                          <div className="text-gray-500 grid grid-cols-2 gap-x-2 gap-y-1 mb-3 text-xs">
                            <div className="flex items-center"><span className="mr-1">📞</span> {lead.phone}</div>
                            <div className="flex items-center"><span className="mr-1">📍</span> {lead.city}</div>
                          </div>
                          <div className="inline-flex px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
                            Service {lead.serviceId}
                          </div>
                          {lead.description && (
                            <div className="mt-3 pt-3 border-t border-gray-100 text-gray-500 text-xs italic">
                              "{lead.description}"
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
