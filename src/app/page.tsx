import Link from "next/link";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 animate-fade-in">
      <div className="max-w-3xl w-full text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
          Mini Lead Distribution System
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto animate-fade-in-delayed">
          A backend-focused lead allocation demo with quotas, fair distribution, realtime dashboard updates, and webhook testing.
        </p>

        <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in-delayed">
          <Link
            href="/request-service"
            className="group flex flex-col items-center p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">Request Service</h3>
            <p className="text-sm text-gray-500 text-center">Submit new leads</p>
          </Link>

          <Link
            href="/dashboard"
            className="group flex flex-col items-center p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">View Dashboard</h3>
            <p className="text-sm text-gray-500 text-center">Monitor quotas in realtime</p>
          </Link>

          <Link
            href="/test-tools"
            className="group flex flex-col items-center p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">Test Tools</h3>
            <p className="text-sm text-gray-500 text-center">Simulate loads & webhooks</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
