import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import axios from "axios";
import { getAndParseJWT } from "./jwt";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { BACKEND_URL } from "../App";
export const THEME_OPTIONS = ["light", "dark"] as const;
export const FONT_OPTIONS = ["sans-serif", "serif", "monospace"] as const;
export const LAYOUT_OPTIONS = ["grid", "list", "compact"] as const;
export type ThemeOption = (typeof THEME_OPTIONS)[number];
export type FontOption = (typeof FONT_OPTIONS)[number];
export type LayoutOption = (typeof LAYOUT_OPTIONS)[number];

export interface Preference {
  _id?: string;
  user_id?: string;
  theme: ThemeOption;
  font: FontOption;
  layout: LayoutOption;
  active: boolean;
}

const DEFAULT_PREFERENCE: Preference = {
  theme: "light",
  font: "sans-serif",
  layout: "list",
  active: true,
};

interface PreferencesContextType {
  preference: Preference;
  refreshPreference: () => void;
  updatePreference: (updated: Partial<Preference>) => Promise<void>;
  setPreference: (pref: Preference | null) => void;
}

const PreferencesContext = createContext<PreferencesContextType>({
  preference: DEFAULT_PREFERENCE,
  refreshPreference: () => {},
  updatePreference: async () => {},
  setPreference: () => {},
});

export const usePreferences = () => useContext(PreferencesContext);

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [preference, setPreference] = useState<Preference | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchActivePreference = async () => {
    const userId = getAndParseJWT()?.payload.id;
    if (!userId) {
      setPreference(null);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${BACKEND_URL}/preferences/${userId}`,
        {
          withCredentials: true,
        }
      );
      const activePref = response.data.find(
        (p: Preference) => p.active === true
      );

      if (!activePref) {
        setPreference(DEFAULT_PREFERENCE);
      } else {
        setPreference(activePref);
      }
    } catch (error) {
      console.error("Error fetching active preference", error);
      setPreference(DEFAULT_PREFERENCE);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (updated: Partial<Preference>) => {
    if (!preference || !preference._id) return;
    try {
      await axios.put(
        `${BACKEND_URL}/preferences/${preference._id}`,
        updated,
        {
          withCredentials: true,
        }
      );
      await fetchActivePreference();
    } catch (error) {
      console.error("Error updating preference", error);
    }
  };

  useEffect(() => {
    fetchActivePreference();
  }, []);

  useEffect(() => {
    const effectivePref = preference || DEFAULT_PREFERENCE;

    document.body.classList.remove("theme-light", "theme-dark");
    document.body.classList.add(`theme-${effectivePref.theme}`);

    document.body.style.fontFamily = effectivePref.font;

    document.body.classList.remove(
      "layout-grid",
      "layout-list",
      "layout-compact"
    );
    document.body.classList.add(`layout-${effectivePref.layout}`);
  }, [preference]);

  const muiTheme = React.useMemo(() => {
    const effectivePref = preference || DEFAULT_PREFERENCE;
    return createTheme({
      palette: {
        mode: effectivePref.theme === "dark" ? "dark" : "light",
      },
      typography: {
        fontFamily: effectivePref.font,
      },
    });
  }, [preference]);

  if (loading) return null;

  return (
    <PreferencesContext.Provider
      value={{
        preference: preference || DEFAULT_PREFERENCE,
        refreshPreference: fetchActivePreference,
        updatePreference,
        setPreference,
      }}
    >
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </PreferencesContext.Provider>
  );
};