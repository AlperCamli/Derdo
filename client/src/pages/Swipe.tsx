import { useEffect, useState } from "react";
import api from "../lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Problem {
  _id: string;
  title: string;
  description: string;
  category: string;
  owner: string;
}

const Swipe = () => {
  const queryClient = useQueryClient();
  const [reporting, setReporting] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const { data, refetch, isFetching } = useQuery<Problem[]>({
    queryKey: ["swipe-deck"],
    queryFn: async () => {
      const res = await api.get("/api/problems/swipe-deck");
      return res.data;
    }
  });

  const problems = data || [];
  const current = problems[0];

  const swipe = async (direction: "left" | "right") => {
    if (!current) return;
    await api.post(`/api/problems/${current._id}/swipe`, { direction });
    queryClient.invalidateQueries({ queryKey: ["swipe-deck"] });
    refetch();
  };

  const sendReport = async (problemId: string) => {
    if (!reason.trim()) return;
    await api.post("/api/reports", { targetProblemId: problemId, reason });
    setReporting(null);
    setReason("");
  };

  return (
    <div className="max-w-2xl mx-auto mt-6 space-y-4">
      <div className="banner">
        This app is for peer support only and does not replace professional help.
        If you are in crisis, contact local emergency services or a professional.
      </div>
      <h1 className="text-2xl font-bold">Swipe problems</h1>
      {isFetching && <div>Loading...</div>}
      {!current && <div className="card">No more problems right now.</div>}
      {current && (
        <div className="card space-y-3">
          <span className="text-xs uppercase tracking-wide bg-slate-100 px-2 py-1 rounded">
            {current.category}
          </span>
          <h3 className="text-xl font-semibold">{current.title}</h3>
          <p className="text-slate-700">{current.description}</p>
          <div className="flex gap-3">
            <button
              className="btn bg-slate-200 text-slate-800"
              onClick={() => swipe("left")}
            >
              Skip
            </button>
            <button
              className="btn bg-emerald-600 text-white"
              onClick={() => swipe("right")}
            >
              Chat
            </button>
            <button
              className="text-sm underline"
              onClick={() => setReporting(current._id)}
            >
              Report
            </button>
          </div>
          {reporting === current._id && (
            <div className="space-y-2">
              <textarea
                className="w-full border rounded p-2"
                placeholder="Share why you are reporting"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  className="btn bg-red-600 text-white"
                  onClick={() => sendReport(current._id)}
                >
                  Submit report
                </button>
                <button
                  className="btn bg-slate-200"
                  onClick={() => setReporting(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Swipe;
