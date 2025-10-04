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
import { useNavigate, useParams } from "react-router-dom";
import { getAndParseJWT } from "./jwt.tsx";
import { BACKEND_URL, showNotification } from "../App.tsx";
import {
  THEME_OPTIONS,
  FONT_OPTIONS,
  LAYOUT_OPTIONS,
  ThemeOption,
  FontOption,
  LayoutOption,
  usePreferences,
} from "./PreferencesContext.tsx";

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
  const [preference, setPreference] = useState<Preference>({
    user_id: "",
    theme: "light",
    font: "sans-serif",
    layout: "grid",
    active: true,
  });

  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();
  const { refreshPreference } = usePreferences();

  useEffect(() => {
    const fetchPreference = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/preferences/single/${id}`, {
          withCredentials: true,
        });
        const data: Preference = response.data;
        setPreference({
          user_id: data.user_id || "",
          theme: data.theme || "light",
          font: data.font || "sans-serif",
          layout: data.layout || "grid",
          active: data.active ?? true,
        });
        setEditing(true);
      } catch (error) {
        showNotification("Preferences Error", "Couldn't fetch preference");
      }
    };

    if (id) {
      fetchPreference();
    }
  }, [id]);

  const deactivateOtherPreferences = async (userId: string) => {
    try {
      await axios.put(
        `${BACKEND_URL}/preferences/deactivate-others/${userId}`, {
          withCredentials: true,
        });
    } catch (error) {
      console.error("Failed to deactivate other preferences:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = getAndParseJWT()?.payload.id;
    if (!userId) {
      showNotification("Auth Error", "User is not logged in");
      return;
    }

    const updatedPreference = { ...preference, user_id: userId };

    try {
      await deactivateOtherPreferences(userId);

      if (editing && id) {
        await axios.put(
          `${BACKEND_URL}/preferences/${id}`,
          updatedPreference, {
          withCredentials: true,
        });
        showNotification("Preferences", "Preferences updated");
        refreshPreference();
        navigate("/preferences");
      } else {
        await axios.post(
          `${BACKEND_URL}/preferences`,
          updatedPreference, {
          withCredentials: true,
        });
        showNotification("Preferences", "Preferences created");
        refreshPreference();
        navigate("/preferences");
      }
    } catch (error) {
      showNotification("Preferences Error", "Submit failed: " + error);
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
            onClick={() => navigate("/preferences")}
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

              <Button variant="contained" type="submit">
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
