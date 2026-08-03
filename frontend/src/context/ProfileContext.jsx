import { useEffect, useState } from "react";
import { getProfile } from "../utils/api";
import { ProfileContext } from "./profile-context";

// Fetches the single Profile document once per app load and shares it with
// every component that needs it (Navbar, Footer, Home, About, Contact,
// Resume, SEO tags). Nothing here is hardcoded — if the admin hasn't filled
// in the profile yet, `profile.name` etc. come back as empty strings and
// consumers fall back to a "No data available" message instead of sample text.
export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getProfile()
      .then((data) => {
        if (mounted) setProfile(data);
      })
      .catch(() => {
        if (mounted) setProfile(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const hasProfile = Boolean(profile && profile.name);

  return (
    <ProfileContext.Provider value={{ profile, loading, hasProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}
