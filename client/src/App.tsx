import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Swipe from "./pages/Swipe";
import PostProblem from "./pages/PostProblem";
import Matches from "./pages/Matches";
import AdminDashboard from "./pages/AdminDashboard";
import NavBar from "./components/NavBar";
import { useAuth } from "./hooks/useAuth";

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
};

const RequireAdmin = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!user.isAdmin) return <Navigate to="/swipe" replace state={{ from: location }} />;
  return children;
};

const App = () => {
  const { user } = useAuth();
  const location = useLocation();
  const hideNav = ["/login", "/register"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50">
      {!hideNav && <NavBar />}
      <div className="max-w-5xl mx-auto px-4 pb-10">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/swipe"
            element={
              <RequireAuth>
                <Swipe />
              </RequireAuth>
            }
          />
          <Route
            path="/post"
            element={
              <RequireAuth>
                <PostProblem />
              </RequireAuth>
            }
          />
          <Route
            path="/matches"
            element={
              <RequireAuth>
                <Matches />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            }
          />
          <Route
            path="*"
            element={<Navigate to={user ? "/swipe" : "/login"} replace />}
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;
