import { useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import ChatView from "../components/ChatView";

interface Match {
  _id: string;
  problem: { _id: string; title: string; category: string };
  owner: { _id: string; pseudonym: string };
  helper: { _id: string; pseudonym: string };
}

const Matches = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const { data: matches } = useQuery<Match[]>({
    queryKey: ["matches"],
    queryFn: async () => {
      const res = await axios.get("/api/matches");
      return res.data;
    }
  });

  const selectedMatch = matches?.find((m) => m._id === selected);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <div className="card h-full">
        <h2 className="text-lg font-semibold mb-2">Your matches</h2>
        <div className="space-y-2 max-h-[70vh] overflow-y-auto">
          {matches?.map((m) => (
            <button
              key={m._id}
              onClick={() => setSelected(m._id)}
              className={`w-full text-left p-2 rounded border ${
                selected === m._id ? "bg-slate-200" : "bg-white"
              }`}
            >
              <div className="text-sm text-slate-600">{m.problem.title}</div>
              <div className="text-xs text-slate-500">Category: {m.problem.category}</div>
              <div className="text-xs text-slate-500">
                Helper: {m.helper.pseudonym} · Owner: {m.owner.pseudonym}
              </div>
            </button>
          ))}
          {!matches?.length && <div className="text-sm">No matches yet.</div>}
        </div>
      </div>
      <div className="md:col-span-2 card h-[70vh]">
        {selectedMatch ? (
          <ChatView matchId={selectedMatch._id} />
        ) : (
          <div>Select a match to chat anonymously.</div>
        )}
      </div>
    </div>
  );
};

export default Matches;
