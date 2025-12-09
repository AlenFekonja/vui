import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getAndParseJWT } from "./jwt";
import { BACKEND_URL, showNotification } from "../App";
import {
  THEME_OPTIONS,
  FONT_OPTIONS,
  LAYOUT_OPTIONS,
  ThemeOption,
  FontOption,
  LayoutOption,
  usePreferences,
} from "./PreferencesContext";
import { trackBrowseeEvent, getCurrentABVariant } from "../browsee";

type Variant = "A" | "B";

export interface Preference {
  _id?: string;
  user_id: string;
  theme: ThemeOption;
  font: FontOption;
  layout: LayoutOption;
  active: boolean;
}

const PreferenceForm = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshPreference } = usePreferences();

  const [from] = useState<string>(() => {
    const state = location.state as { from?: string } | null;
    if (state?.from) {
      return state.from;
    }

    const stored = sessionStorage.getItem("lastPreferencesPage");
    if (stored === "/preferences2") return "/preferences2";

    return "/preferences";
  });

  const variant: Variant =
    from === "/preferences2" ? "B" : getCurrentABVariant() || "A";
  const suffix = variant === "A" ? "_A" : "_B";

  const [preference, setPreference] = useState<Preference>({
    user_id: "",
    theme: "light",
    font: "sans-serif",
    layout: "grid",
    active: true,
  });

  const [originalActive, setOriginalActive] = useState<boolean | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchPreference = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/preferences/single/${id}`,
          {
            withCredentials: true,
          }
        );
        const data: Preference = response.data;
        setPreference({
          user_id: data.user_id || "",
          theme: data.theme || "light",
          font: data.font || "sans-serif",
          layout: data.layout || "grid",
          active: data.active ?? true,
        });
        setOriginalActive(data.active ?? true);
        setEditing(true);

        trackBrowseeEvent(`preferences_form_view_edit${suffix}`);
      } catch (error) {
        showNotification("Preferences Error", "Couldn't fetch preference");
        trackBrowseeEvent(`preferences_form_load_error${suffix}`, {
          error: String(error),
        });
      }
    };

    if (id) {
      fetchPreference();
    } else {
      setOriginalActive(null);
      trackBrowseeEvent(`preferences_form_view_create${suffix}`);
    }
  }, [id, suffix]);

  const deactivateOtherPreferences = async (userId: string) => {
    try {
      await axios.put(
        `${BACKEND_URL}/preferences/deactivate-others/${userId}`,
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error("Failed to deactivate other preferences:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = getAndParseJWT()?.payload.id;
    if (!userId) {
      showNotification("Auth Error", "User is not logged in");
      trackBrowseeEvent(`preferences_submit_error${suffix}`, {
        reason: "no_user",
      });
      return;
    }

    const updatedPreference = { ...preference, user_id: userId };

    const becameActiveNow =
      updatedPreference.active &&
      (!editing || originalActive === false);

    try {
      await deactivateOtherPreferences(userId);

      if (editing && id) {
        await axios.put(
          `${BACKEND_URL}/preferences/${id}`,
          updatedPreference,
          {
            withCredentials: true,
          }
        );
        showNotification("Preferences", "Preferences updated");
        trackBrowseeEvent(`preferences_edit_success${suffix}`);

        if (becameActiveNow) {
          trackBrowseeEvent(`preferences_set_active${suffix}`, {
            mode: "edit",
            preferenceId: id,
          });
        }
      } else {
        const res = await axios.post(
          `${BACKEND_URL}/preferences`,
          updatedPreference,
          {
            withCredentials: true,
          }
        );
        showNotification("Preferences", "Preferences created");
        trackBrowseeEvent(`preferences_submit_success${suffix}`);

        if (becameActiveNow) {
          trackBrowseeEvent(`preferences_set_active${suffix}`, {
            mode: "create",
            preferenceId: res.data?._id,
          });
        }
      }

      await refreshPreference();
      navigate(from);
    } catch (error) {
      showNotification("Preferences Error", "Submit failed: " + error);
      trackBrowseeEvent(`preferences_submit_error${suffix}`, {
        error: String(error),
      });
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      paddingTop={5}
      mb={3}
    >
      <Box sx={{ width: "100%", maxWidth: "600px" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            flexWrap: "wrap",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontFamily: "inherit",
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
            }}
          >
            {editing ? "Edit Preferences" : "Create Preferences"}
          </Typography>

          <Button
            variant="outlined"
            onClick={() => navigate(from)}
            sx={{
              fontFamily: "inherit",
              mt: { xs: 2, sm: 0 },
            }}
          >
            Back to list
          </Button>
        </Box>

        <Card
          className="preferenceForm"
          sx={{
            transition: "all 0.2s ease",
            borderRadius: "8px",
            boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.15)",
            border: "1px solid rgb(205, 205, 205)",
            marginBottom: "30px",
          }}
        >
          <CardContent sx={{ fontFamily: "inherit", mt: 2 }}>
            <form onSubmit={handleSubmit}>
              <FormControl fullWidth>
                <InputLabel>Theme</InputLabel>
                <Select
                  value={preference.theme}
                  sx={{ fontFamily: "inherit", mb: 3 }}
                  label="Theme"
                  name="theme"
                  onChange={(e) =>
                    setPreference({
                      ...preference,
                      theme: e.target.value as ThemeOption,
                    })
                  }
                >
                  {THEME_OPTIONS.map((theme) => (
                    <MenuItem
                      key={theme}
                      value={theme}
                      sx={{ fontFamily: "inherit" }}
                    >
                      {theme}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Font</InputLabel>
                <Select
                  value={preference.font}
                  label="Font"
                  name="font"
                  sx={{ fontFamily: "inherit", mb: 3 }}
                  onChange={(e) =>
                    setPreference({
                      ...preference,
                      font: e.target.value as FontOption,
                    })
                  }
                >
                  {FONT_OPTIONS.map((font) => (
                    <MenuItem
                      key={font}
                      value={font}
                      sx={{ fontFamily: "inherit" }}
                    >
                      {font}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Layout</InputLabel>
                <Select
                  value={preference.layout}
                  label="Layout"
                  name="layout"
                  sx={{ fontFamily: "inherit", mb: 3 }}
                  onChange={(e) =>
                    setPreference({
                      ...preference,
                      layout: e.target.value as LayoutOption,
                    })
                  }
                >
                  {LAYOUT_OPTIONS.map((layout) => (
                    <MenuItem
                      key={layout}
                      value={layout}
                      sx={{ fontFamily: "inherit" }}
                    >
                      {layout}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Active</InputLabel>
                <Select
                  value={preference.active ? "true" : "false"}
                  label="Active"
                  name="active"
                  sx={{ fontFamily: "inherit", mb: 3 }}
                  onChange={(e) =>
                    setPreference({
                      ...preference,
                      active: e.target.value === "true",
                    })
                  }
                >
                  <MenuItem value="true" sx={{ fontFamily: "inherit" }}>
                    Active
                  </MenuItem>
                  <MenuItem value="false" sx={{ fontFamily: "inherit" }}>
                    Inactive
                  </MenuItem>
                </Select>
              </FormControl>

              <Button variant="contained" name="submit" type="submit">
                {editing ? "Update Preference" : "Create Preference"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default PreferenceForm;