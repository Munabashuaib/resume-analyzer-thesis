// src/components/SessionChecker.js
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api";

function SessionChecker({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // ✅ Skip check on public routes
    const publicPaths = ["/login", "/register"];
    if (publicPaths.includes(location.pathname)) return;

    const checkSession = async () => {
      try {
        const res = await api.get("/auth/status");
        if (!res.data.logged_in) {
          localStorage.clear();
          navigate("/login");
        }
      } catch {
        localStorage.clear();
        navigate("/login");
      }
    };

    checkSession();
  }, [navigate, location.pathname]);

  return children;
}

export default SessionChecker;


