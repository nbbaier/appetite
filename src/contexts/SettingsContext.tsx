import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { userPreferencesService } from "../lib/database";
import type { UserPreferences } from "../types";
import { useAuth } from "./AuthContext";

interface SettingsContextType {
  settings: UserPreferences | null;
  loading: boolean;
  updateSettings: (updates: Partial<UserPreferences>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const prefs = await userPreferencesService.getPreferences(user.id);
      setSettings(prefs);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchSettings();
  }, [user, fetchSettings]);

  const updateSettings = useCallback(
    async (updates: Partial<UserPreferences>) => {
      if (!user) return;
      setLoading(true);
      try {
        const updated = await userPreferencesService.updatePreferences(
          user.id,
          updates,
        );
        setSettings(updated);
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  const refreshSettings = useCallback(async () => {
    await fetchSettings();
  }, [fetchSettings]);

  return (
    <SettingsContext.Provider
      value={{ settings, loading, updateSettings, refreshSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx)
    throw new Error("useSettings must be used within a SettingsProvider");
  return ctx;
}
