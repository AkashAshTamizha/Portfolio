import { useCallback, useEffect, useState } from "react";
import { getSettings } from "../utils/api";
import { DEFAULT_SETTINGS, SiteSettingsContext } from "./site-settings-context";

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getSettings()
      .then((data) => setSettings({ ...DEFAULT_SETTINGS, ...data }))
      .catch(() => setSettings(DEFAULT_SETTINGS)) // fall back quietly — this must never block the public site from rendering
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, reload: load }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}
