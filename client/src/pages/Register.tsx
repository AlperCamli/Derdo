import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/register", { email, password });
      setUser({ id: res.data.id, pseudonym: res.data.pseudonym });
      navigate("/swipe");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 card">
      <h1 className="text-2xl font-bold mb-4">Create account</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            className="border w-full rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            className="border w-full rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn bg-slate-800 text-white w-full" type="submit">
          Register
        </button>
      </form>
      <p className="text-sm mt-3">
        Already have an account? <Link className="text-blue-600" to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;
