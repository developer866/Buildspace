import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Log from '@/models/Log';

const PAGE_SIZE = 25;
const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

interface LogsPageProps {
  searchParams: Promise<{ page?: string; method?: string; statusRange?: string }>;
}

export default async function LogsPage({ searchParams }: LogsPageProps) {
  const session = await getCurrentUser();
  if (!session) redirect('/login?from=/logs');

  await dbConnect();
  const user = await User.findById(session.userId).select('role');
  if (!user || user.role !== 'admin') redirect('/');

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);
  const methodFilter = params.method || '';
  const statusRange = params.statusRange || '';

  const filter: Record<string, unknown> = {};
  if (methodFilter) filter.method = methodFilter;
  if (statusRange === '2xx') filter.responseStatus = { $gte: 200, $lt: 300 };
  if (statusRange === '4xx') filter.responseStatus = { $gte: 400, $lt: 500 };
  if (statusRange === '5xx') filter.responseStatus = { $gte: 500, $lt: 600 };

  const [logs, total] = await Promise.all([
    Log.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
    Log.countDocuments(filter),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const pageUrl = (p: number) => {
    const sp = new URLSearchParams();
    if (methodFilter) sp.set('method', methodFilter);
    if (statusRange) sp.set('statusRange', statusRange);
    sp.set('page', String(p));
    return `/logs?${sp.toString()}`;
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Request Logs</h1>
      <p className="text-sm text-slate-500 mb-6">{total.toLocaleString()} total requests</p>

      {/* Filters — plain GET form, no client JS needed */}
      <form method="GET" className="flex flex-wrap items-end gap-3 mb-6">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Method</label>
          <select
            name="method"
            defaultValue={methodFilter}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm min-w-30"
          >
            <option value="">All</option>
            {METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
          <select
            name="statusRange"
            defaultValue={statusRange}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm min-w-30"
          >
            <option value="">All</option>
            <option value="2xx">2xx — Success</option>
            <option value="4xx">4xx — Client Error</option>
            <option value="5xx">5xx — Server Error</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-slate-900 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-slate-800"
        >
          Apply
        </button>

        {(methodFilter || statusRange) && (
          <a href="/logs" className="text-sm text-slate-500 hover:text-slate-900 underline">
            Clear filters
          </a>
        )}
      </form>

      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium">Time</th>
              <th className="px-4 py-2.5 text-left font-medium">Method</th>
              <th className="px-4 py-2.5 text-left font-medium">Path</th>
              <th className="px-4 py-2.5 text-left font-medium">Status</th>
              <th className="px-4 py-2.5 text-left font-medium">Request</th>
              <th className="px-4 py-2.5 text-left font-medium">Response</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id.toString()} className="border-t border-slate-200 even:bg-slate-50">
                <td className="px-4 py-2 whitespace-nowrap text-slate-600">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-2 font-mono font-medium">{log.method}</td>
                <td className="px-4 py-2 font-mono text-slate-700">{log.path}</td>
                <td
                  className={`px-4 py-2 font-semibold ${
                    log.responseStatus >= 400 ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {log.responseStatus}
                </td>
                <td className="px-4 py-2 max-w-60 align-top text-slate-500">
                  <details>
                    <summary className="cursor-pointer truncate max-w-60 hover:text-slate-900">
                      {JSON.stringify(log.requestBody)}
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap wrap-break-words text-xs bg-slate-50 border border-slate-200 rounded p-2 max-w-md">
                      {JSON.stringify(log.requestBody, null, 2)}
                    </pre>
                  </details>
                </td>
                <td className="px-4 py-2 max-w-60 align-top text-slate-500">
                  <details>
                    <summary className="cursor-pointer truncate max-w-60 hover:text-slate-900">
                      {JSON.stringify(log.responseData)}
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap wrap-break-words text-xs bg-slate-50 border border-slate-200 rounded p-2 max-w-md">
                      {JSON.stringify(log.responseData, null, 2)}
                    </pre>
                  </details>
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No logs match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-6">
        <a
          href={page > 1 ? pageUrl(page - 1) : undefined}
          className={`text-sm px-4 py-2 rounded-lg border ${
            page <= 1
              ? 'text-slate-300 border-slate-200 pointer-events-none'
              : 'text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
        >
          ← Previous
        </a>
        <span className="text-sm text-slate-500">
          Page {page} of {totalPages}
        </span>
        <a
          href={page < totalPages ? pageUrl(page + 1) : undefined}
          className={`text-sm px-4 py-2 rounded-lg border ${
            page >= totalPages
              ? 'text-slate-300 border-slate-200 pointer-events-none'
              : 'text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
        >
          Next →
        </a>
      </div>
    </div>
  );
}