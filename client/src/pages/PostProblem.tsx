import { useState } from "react";
import api from "../lib/api";

const PostProblem = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("financial");
  const [status, setStatus] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/api/problems", { title, description, category });
      setStatus("Problem posted! You can head to Swipe to meet helpers.");
      setTitle("");
      setDescription("");
    } catch (err: any) {
      setStatus(err?.response?.data?.message || "Could not post problem");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-6 card">
      <h1 className="text-2xl font-bold mb-4">Share a problem</h1>
      <form className="space-y-3" onSubmit={submit}>
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            className="border w-full rounded px-3 py-2"
            value={title}
            maxLength={80}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            className="border w-full rounded px-3 py-2"
            value={description}
            maxLength={500}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Category</label>
          <select
            className="border w-full rounded px-3 py-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="financial">Financial</option>
            <option value="relationship">Relationship</option>
            <option value="career">Career</option>
            <option value="daily">Daily / life</option>
            <option value="other">Other</option>
          </select>
        </div>
        <button className="btn bg-slate-800 text-white" type="submit">
          Post
        </button>
      </form>
      {status && <div className="mt-3 text-sm text-slate-700">{status}</div>}
    </div>
  );
};

export default PostProblem;
