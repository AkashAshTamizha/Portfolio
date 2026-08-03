import { Navigate, useLocation } from "react-router-dom";
import { useUserAuth } from "../../hooks/useUserAuth";

// Wraps pages that require a logged-in viewer (e.g. "My Reviews"). Redirects
// anonymous visitors to /login and remembers the page they wanted, so Login
// can send them right back after a successful sign-in (see Login.jsx's use
// of location.state?.from).
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useUserAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
