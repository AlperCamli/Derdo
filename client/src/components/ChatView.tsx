import { useState } from "react";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";

interface Message {
  _id: string;
  sender: { _id: string; pseudonym: string } | string;
  content: string;
  createdAt: string;
}

const ChatView = ({ matchId }: { matchId: string }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [reporting, setReporting] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const { data: messages } = useQuery<Message[]>({
    queryKey: ["messages", matchId],
    queryFn: async () => {
      const res = await axios.get(`/api/matches/${matchId}/messages`);
      return res.data;
    }
  });

  const sendMessage = async () => {
    if (!content.trim()) return;
    await axios.post(`/api/matches/${matchId}/messages`, { content });
    setContent("");
    queryClient.invalidateQueries({ queryKey: ["messages", matchId] });
  };

  const submitReport = async (messageId: string) => {
    if (!reason.trim()) return;
    await axios.post("/api/reports", { targetMessageId: messageId, reason });
    setReporting(null);
    setReason("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-2 p-2">
        {messages?.map((m) => {
          const senderName =
            typeof m.sender === "string"
              ? ""
              : m.sender._id === user?.id
              ? "You"
              : m.sender.pseudonym;
          return (
            <div key={m._id} className="card">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>{senderName}</span>
                <button
                  className="underline"
                  onClick={() => setReporting(m._id)}
                >
                  Report
                </button>
              </div>
              <div>{m.content}</div>
              {reporting === m._id && (
                <div className="mt-2 space-y-2">
                  <textarea
                    className="w-full border rounded p-2 text-sm"
                    placeholder="Why are you reporting this message?"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  <div className="flex gap-2 text-sm">
                    <button
                      className="btn bg-red-600 text-white"
                      onClick={() => submitReport(m._id)}
                    >
                      Submit
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
          );
        })}
      </div>
      <div className="flex gap-2 p-2 border-t">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Type a message"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          onClick={sendMessage}
          className="btn bg-slate-800 text-white hover:bg-slate-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatView;
