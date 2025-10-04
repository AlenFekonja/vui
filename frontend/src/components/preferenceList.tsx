import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Typography,
  Box,
  Stack,
  Card,
  CardContent,
  Button,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import PaletteIcon from "@mui/icons-material/Palette";
import FontDownloadIcon from "@mui/icons-material/FontDownload";
import ViewQuiltIcon from "@mui/icons-material/ViewQuilt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { getAndParseJWT } from "./jwt.tsx";
import { BACKEND_URL, showNotification } from "../App.tsx";
import { usePreferences } from "./PreferencesContext.tsx"; // Pomembno za layout

export interface Preference {
  _id?: string;
  user_id?: string;
  theme: string;
  font: string;
  layout: string;
  active: boolean;
}

const PreferencesList = () => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const { preference: activePreference } = usePreferences(); // pridobimo layout
  const layout = activePreference?.layout ?? "list"; // fallback če ni preference
  const { refreshPreference } = usePreferences();
  const fetchPreferences = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/preferences/${getAndParseJWT()?.payload.id}`, {
          withCredentials: true,
        });
      setPreferences(response.data);
    } catch (error) {
      showNotification(
        "Preferences Error",
        "Couldn't fetch preferences: " + error
      );
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      await axios.delete(`${BACKEND_URL}/preferences/${id}`, {
          withCredentials: true,
        });
      fetchPreferences();
      showNotification("Preferences", "Preference was deleted");
      await refreshPreference();
    } catch (error) {
      showNotification("Preferences Error", "Preference was not deleted");
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  const renderCards = () =>
    preferences.map((preference) => (
      <Card
        key={preference._id}
        className="preference"
        sx={{
          transition: "all 0.2s ease",
          borderRadius: "8px",
          boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.15)",
          position: "relative",
          userSelect: "none",
          border: "1px solid rgb(205, 205, 205)",
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

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {preference.active ? (
                <CheckCircleIcon
                  fontSize={layout === "compact" ? "small" : "medium"}
                  color="success"
                />
              ) : (
                <CancelIcon
                  fontSize={layout === "compact" ? "small" : "medium"}
                  color="error"
                />
              )}
              <Typography variant="body1">
                {preference.active ? "Active" : "Inactive"}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center", // to je pomembno
              gap: 1,
              mt: layout === "compact" ? 0 : 0,
              alignSelf: "center", // naj bo vedno center, ne flex-end
            }}
          >
            <IconButton
              onClick={() => navigate(`/preferences/edit/${preference._id}`)}
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
              onClick={() => handleDelete(preference._id)}
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
    ));

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
            onClick={() => navigate("/preferences/add")}
            sx={{
              fontFamily: "inherit",
              mt: { xs: 2, sm: 0 },
            }}
          >
            Add preference
          </Button>
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

export default PreferencesList;
