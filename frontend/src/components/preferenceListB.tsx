import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Typography,
  Box,
  Stack,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Alert,
  AlertTitle,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import PaletteIcon from "@mui/icons-material/Palette";
import FontDownloadIcon from "@mui/icons-material/FontDownload";
import ViewQuiltIcon from "@mui/icons-material/ViewQuilt";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { getAndParseJWT } from "./jwt";
import { BACKEND_URL, showNotification } from "../App";
import { usePreferences } from "./PreferencesContext";
import { trackBrowseeEvent } from "../browsee";

export interface Preference {
  _id?: string;
  user_id?: string;
  theme: string;
  font: string;
  layout: string;
  active: boolean;
}

const SUS_URL_B = "https://1ka.arnes.si/a/c0f7b4dc";

const PreferencesListB = () => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<Preference[]>([]);

  const {
    preference: activePreference,
    refreshPreference,
  } = usePreferences();

  const layout = activePreference?.layout ?? "list";

  useEffect(() => {
    sessionStorage.setItem("lastPreferencesPage", "/preferences2");
    trackBrowseeEvent("preferences_list_view_B");
  }, []);

  const fetchPreferences = async () => {
    const userId = getAndParseJWT()?.payload.id;
    if (!userId) {
      showNotification("Auth Error", "User is not logged in");
      trackBrowseeEvent("preferences_list_error_B", {
        reason: "no_user",
      });
      return;
    }

    try {
      const response = await axios.get(
        `${BACKEND_URL}/preferences/${userId}`,
        {
          withCredentials: true,
        }
      );

      const data: Preference[] = response.data || [];

      const sorted = [...data].sort((a, b) => {
        const aActive = a.active ? 1 : 0;
        const bActive = b.active ? 1 : 0;

        if (aActive !== bActive) return bActive - aActive;

        if (a._id && b._id) return a._id.localeCompare(b._id);
        return 0;
      });

      setPreferences(sorted);

      trackBrowseeEvent("preferences_list_loaded_B", {
        count: sorted.length,
      });
    } catch (error) {
      showNotification(
        "Preferences Error",
        "Couldn't fetch preferences: " + error
      );
      trackBrowseeEvent("preferences_list_error_B", {
        error: String(error),
      });
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;

    try {
      await axios.delete(`${BACKEND_URL}/preferences/${id}`, {
        withCredentials: true,
      });

      showNotification("Preferences", "Preference was deleted");

      await fetchPreferences();
      await refreshPreference();

      trackBrowseeEvent("preferences_delete_B", {
        preferenceId: id,
      });
    } catch (error) {
      console.error("Delete error:", error);
      showNotification("Preferences Error", "Preference was not deleted");
      trackBrowseeEvent("preferences_delete_error_B", {
        preferenceId: id,
        error: String(error),
      });
    }
  };

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

  const handleSetActive = async (id?: string) => {
    if (!id) return;

    const userId = getAndParseJWT()?.payload.id;
    if (!userId) {
      showNotification("Auth Error", "User is not logged in");
      trackBrowseeEvent("preferences_set_active_error_B", {
        reason: "no_user",
        preferenceId: id,
      });
      return;
    }

    const current = preferences.find((p) => p._id === id);
    if (!current) {
      showNotification("Preferences Error", "Preference not found in list");
      trackBrowseeEvent("preferences_set_active_error_B", {
        reason: "not_in_state",
        preferenceId: id,
      });
      return;
    }

    const updatedPreference = {
      user_id: userId,
      theme: current.theme,
      font: current.font,
      layout: current.layout,
      active: true,
    };

    try {
      await deactivateOtherPreferences(userId);

      await axios.put(
        `${BACKEND_URL}/preferences/${id}`,
        updatedPreference,
        {
          withCredentials: true,
        }
      );

      showNotification("Preferences", "Active preference changed");

      await fetchPreferences();
      await refreshPreference();

      trackBrowseeEvent("preferences_set_active_B", {
        preferenceId: id,
      });
    } catch (error) {
      console.error("Set active error:", error);
      showNotification(
        "Preferences Error",
        "Could not change active preference: " + error
      );
      trackBrowseeEvent("preferences_set_active_error_B", {
        preferenceId: id,
        error: String(error),
      });
    }
  };

  const handleCardDoubleClick = (id?: string) => {
    if (!id) return;
    trackBrowseeEvent("preferences_edit_click_B", {
      source: "card_double_click",
      preferenceId: id,
    });
    navigate(`/preferences/edit/${id}`, { state: { from: "/preferences2" } });
  };

  const handleEditClick = (id?: string) => {
    if (!id) return;
    trackBrowseeEvent("preferences_edit_click_B", {
      source: "edit_button",
      preferenceId: id,
    });
    navigate(`/preferences/edit/${id}`, { state: { from: "/preferences2" } });
  };

  const handleAddClick = () => {
    trackBrowseeEvent("preferences_add_click_B");
    navigate("/preferences/add", { state: { from: "/preferences2" } });
  };

  const handleFillSusClick = () => {
    const params = new URLSearchParams({
      page: "preferences_list_B",
      variant: "B",
    });
    const url = `${SUS_URL_B}?${params.toString()}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [activePreference?._id]);

  const renderCards = () =>
    preferences.map((preference) => {
      const isActive = preference.active;

      return (
        <Card
          data-layout={layout}
          key={preference._id}
          className="preference"
          onDoubleClick={() => handleCardDoubleClick(preference._id)}
          sx={{
            transition: "all 0.2s ease",
            borderRadius: "8px",
            boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.15)",
            position: "relative",
            userSelect: "none",
            cursor: "pointer",
            border: isActive
              ? "2px solid #2e7d32"
              : "1px solid rgb(205, 205, 205)",
            ...(layout === "list" && {
              padding: 2,
            }),
            ...(layout === "compact" && {
              paddingTop: 1,
              paddingLeft: 1,
              minHeight: "50px",
            }),
            "&:hover": {
              transform: "scale(1.02)",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
              zIndex: 10,
            },
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              alignItems: layout === "compact" ? "flex-start" : "center",
              justifyContent: "space-between",
              flexDirection: "row",
              gap: layout === "compact" ? 0.5 : 2,
              padding: layout === "compact" ? 1 : 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: layout === "compact" ? 1 : 2,
                flexWrap: "wrap",
                flexGrow: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <PaletteIcon
                  fontSize={layout === "compact" ? "small" : "medium"}
                  color="primary"
                />
                <Typography variant="body1">{preference.theme}</Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <FontDownloadIcon
                  fontSize={layout === "compact" ? "small" : "medium"}
                  color="secondary"
                />
                <Typography variant="body1">{preference.font}</Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <ViewQuiltIcon
                  fontSize={layout === "compact" ? "small" : "medium"}
                  color="action"
                />
                <Typography variant="body1">{preference.layout}</Typography>
              </Box>

              <Chip
                label={isActive ? "Active" : "Inactive"}
                color={isActive ? "success" : "default"}
                size="small"
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: layout === "compact" ? "column" : "row",
                gap: 1,
                alignItems: "center",
                justifyContent: "flex-end",
                ml: 2,
              }}
            >
              <Button
                variant={isActive ? "outlined" : "contained"}
                size="small"
                disabled={isActive}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSetActive(preference._id);
                }}
              >
                {isActive ? "Currently active" : "Set active"}
              </Button>

              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(preference._id);
                }}
                color="primary"
                size="small"
                disableRipple
                disableFocusRipple
                sx={{
                  padding: 0,
                  margin: 0,
                  width: 24,
                  height: 24,
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>

              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(preference._id);
                }}
                color="error"
                size="small"
                disableRipple
                disableFocusRipple
                sx={{
                  padding: 0,
                  margin: 0,
                  width: 24,
                  height: 24,
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      );
    });

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      paddingTop={5}
      alignItems="center"
      mb={3}
    >
      <Box sx={{ width: "100%" }}>
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
            Preferences
          </Typography>

          <Button
            variant="contained"
            onClick={handleAddClick}
            sx={{
              fontFamily: "inherit",
              mt: { xs: 2, sm: 0 },
            }}
          >
            Add preference
          </Button>
        </Box>

        <Box mb={3}>
          <Alert
            severity="info"
            variant="outlined"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
            action={
              <Button
                color="primary"
                variant="contained"
                size="small"
                onClick={handleFillSusClick}
              >
                Fill SUS
              </Button>
            }
          >
            <AlertTitle>SUS Questionnaire</AlertTitle>
            After using this page, please complete a short usability
            questionnaire (SUS). It will open in a new tab.
          </Alert>
        </Box>

        {preferences.length === 0 && (
          <Typography>No preferences found.</Typography>
        )}

        {layout === "grid" ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr 1fr",
              },
              gap: 2,
            }}
          >
            {renderCards()}
          </Box>
        ) : (
          <Stack spacing={layout === "compact" ? 1 : 2}>{renderCards()}</Stack>
        )}
      </Box>
    </Box>
  );
};

export default PreferencesListB;