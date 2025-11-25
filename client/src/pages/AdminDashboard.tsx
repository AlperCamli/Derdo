import { useEffect, useState } from "react";
import api from "../lib/api";
import { useAuth } from "../hooks/useAuth";

interface ReportItem {
  _id: string;
  reporter?: { pseudonym: string };
  targetProblem?: { _id: string; title: string; owner?: string };
  targetMessage?: { _id: string; content: string; sender?: { pseudonym: string } };
  reason: string;
  status: "open" | "resolved";
  resolutionNote?: string;
  createdAt: string;
}

interface MatchItem {
  _id: string;
  isActive: boolean;
  problem?: { title: string };
  owner?: { pseudonym: string };
  helper?: { pseudonym: string };
}

interface UserItem {
  _id: string;
  pseudonym: string;
  email: string;
  isAdmin?: boolean;
  createdAt: string;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [reportRes, matchRes, userRes] = await Promise.all([
        api.get("/api/admin/reports"),
        api.get("/api/admin/matches"),
        api.get("/api/admin/users")
      ]);
      setReports(reportRes.data);
      setMatches(matchRes.data);
      setUsers(userRes.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateReport = async (id: string, status: "open" | "resolved") => {
    try {
      await api.patch(`/api/admin/reports/${id}`, {
        status,
        resolutionNote: resolutionNotes[id]
      });
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not update report");
    }
  };

  const closeMatch = async (id: string) => {
    try {
      await api.patch(`/api/admin/matches/${id}/close`);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to close match");
    }
  };

  const deleteUser = async (id: string) => {
    if (user?.id === id) {
      setError("You cannot delete your own account from the admin panel.");
      return;
    }
    try {
      await api.delete(`/api/admin/users/${id}`);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to delete user");
    }
  };

  if (loading) return <div className="p-6">Loading admin data...</div>;

  return (
    <div className="space-y-8 mt-6">
      <h1 className="text-3xl font-bold">Admin moderation</h1>
      {error && <div className="text-red-600">{error}</div>}

      <section className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Reports</h2>
          <button className="btn" onClick={loadData}>
            Refresh
          </button>
        </div>
        {reports.length === 0 ? (
          <p className="text-sm text-slate-600">No reports submitted.</p>
        ) : (
          <div className="space-y-4">
            {reports.map((r) => (
              <div key={r._id} className="border p-3 rounded bg-white shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    From <strong>{r.reporter?.pseudonym || "Unknown"}</strong> on
                    {" "}
                    {new Date(r.createdAt).toLocaleString()}
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      r.status === "resolved" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                {r.targetProblem && (
                  <div className="text-sm mt-1">
                    Problem: <strong>{r.targetProblem.title}</strong>
                  </div>
                )}
                {r.targetMessage && (
                  <div className="text-sm mt-1">
                    Message from <strong>{r.targetMessage.sender?.pseudonym}</strong>: {r.targetMessage.content}
                  </div>
                )}
                <p className="mt-2">Reason: {r.reason}</p>
                <div className="mt-2">
                  <label className="text-xs uppercase text-slate-600">Resolution note</label>
                  <textarea
                    className="w-full border rounded p-2 mt-1"
                    rows={2}
                    value={resolutionNotes[r._id] ?? r.resolutionNote ?? ""}
                    onChange={(e) =>
                      setResolutionNotes((prev) => ({ ...prev, [r._id]: e.target.value }))
                    }
                    placeholder="Add a note for audit trail"
                  />
                </div>
                <div className="flex gap-3 mt-2 text-sm">
                  <button className="btn" onClick={() => updateReport(r._id, "resolved")}>
                    Mark resolved
                  </button>
                  {r.status === "resolved" && (
                    <button
                      className="btn border border-slate-300"
                      onClick={() => updateReport(r._id, "open")}
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2 className="text-xl font-semibold mb-3">Matches</h2>
        {matches.length === 0 ? (
          <p className="text-sm text-slate-600">No matches found.</p>
        ) : (
          <div className="space-y-3">
            {matches.map((m) => (
              <div key={m._id} className="border p-3 rounded bg-white shadow-sm flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {m.problem?.title || "Unknown problem"}
                  </div>
                  <div className="text-sm text-slate-600">
                    Owner: {m.owner?.pseudonym || "?"} — Helper: {m.helper?.pseudonym || "?"}
                  </div>
                  <div className="text-xs text-slate-500">Status: {m.isActive ? "active" : "closed"}</div>
                </div>
                {m.isActive && (
                  <button className="btn" onClick={() => closeMatch(m._id)}>
                    Force unmatch
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2 className="text-xl font-semibold mb-3">Users</h2>
        {users.length === 0 ? (
          <p className="text-sm text-slate-600">No users.</p>
        ) : (
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u._id} className="border p-3 rounded bg-white shadow-sm flex items-center justify-between">
                <div>
                  <div className="font-medium">{u.pseudonym}</div>
                  <div className="text-xs text-slate-500">{u.email}</div>
                  <div className="text-xs text-slate-500">
                    Joined {new Date(u.createdAt).toLocaleDateString()} — {u.isAdmin ? "Admin" : "Member"}
                  </div>
                </div>
                <button
                  className="btn bg-red-600 text-white"
                  onClick={() => deleteUser(u._id)}
                  disabled={user?.id === u._id}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
