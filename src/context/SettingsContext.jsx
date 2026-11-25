import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_SETTINGS } from '../lib/constants';
import { fetchSettings } from '../services/settingsService';

const SettingsContext = createContext({ settings: DEFAULT_SETTINGS, reload: () => {} });
export const useSettings = () => useContext(SettingsContext);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    fetchSettings()
      .then((s) => alive && setSettings(s))
      .catch(() => {}); // نكتفي بالقيم الافتراضية إن تعذرت القراءة
    return () => {
      alive = false;
    };
  }, [tick]);

  useEffect(() => {
    document.title = settings.siteName;
  }, [settings.siteName]);

  const value = useMemo(() => ({ settings, reload: () => setTick((t) => t + 1) }), [settings]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
