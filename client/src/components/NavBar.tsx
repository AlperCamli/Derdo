import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../hooks/useAuth";

const NavBar = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const logout = async () => {
    await api.post("/api/auth/logout");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
      <Link to="/swipe" className="font-bold text-lg">
        AnonBuddy
      </Link>
      <div className="flex gap-4 items-center text-sm">
        <Link to="/swipe" className="hover:underline">
          Swipe
        </Link>
        <Link to="/post" className="hover:underline">
          Post Problem
        </Link>
        <Link to="/matches" className="hover:underline">
          Matches
        </Link>
        {user?.isAdmin && (
          <Link to="/admin" className="hover:underline">
            Admin
          </Link>
        )}
        {user && <span className="text-slate-300">You are {user.pseudonym}</span>}
        <button
          onClick={logout}
          className="bg-slate-700 px-3 py-1 rounded hover:bg-slate-600"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
