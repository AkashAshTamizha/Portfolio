import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Seo from "../components/ui/Seo";
import { useUserAuth } from "../hooks/useUserAuth";

// A dedicated /logout route (rather than only a navbar button) so logging
// out is a real, linkable, testable page — matches Login/Register having
// their own routes, and gives QA an explicit page to verify against.
export default function Logout() {
  const { logout, isAuthenticated } = useUserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      logout();
      toast.success("You've been logged out.");
    }
    navigate("/login", { replace: true });
    // Runs once on mount — logout()/navigate identities are stable, and we
    // don't want this firing again if isAuthenticated flips mid-navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Seo title="Log Out" path="/logout" />
      <div className="section-pad flex items-center justify-center">
        <p className="text-sm text-cloud-500">Signing you out…</p>
      </div>
    </>
  );
}
