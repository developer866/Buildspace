import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Log from "@/models/Log";

export default async function LogsPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/login?from=/logs");

  await dbConnect();
  const user = await User.findById(session.userId).select("role");
  if (!user || user.role !== "admin") {
    redirect("/"); // logged in, but not authorized — send home instead of showing an error page
  }

  const logs = await Log.find().sort({ createdAt: -1 }).limit(100).lean();

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">
        Request Logs
      </h1>

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
              <tr
                key={log._id.toString()}
                className="border-t border-slate-200 even:bg-slate-50"
              >
                <td className="px-4 py-2 whitespace-nowrap text-slate-600">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-2 font-mono font-medium">
                  {log.method}
                </td>
                <td className="px-4 py-2 font-mono text-slate-700">
                  {log.path}
                </td>
                <td
                  className={`px-4 py-2 font-semibold ${log.responseStatus >= 400 ? "text-red-600" : "text-green-600"}`}
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
