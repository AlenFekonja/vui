import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "./components/navbar.tsx";
import { Box, Typography, Stack } from "@mui/material";
import { getAndParseJWT } from "./components/jwt.tsx";
import { usePreferences } from "./components/PreferencesContext.tsx";

const Footer = () => {
  const { preference } = usePreferences();

  return (
    <Box
      component="footer"
      className="footer"
      sx={{
        py: 6,
        px: 4,
        backgroundColor: "#222",
        color: "white",
        mt: "auto",
        width: "100%",
      }}
    >
      <Box
        sx={{
          maxWidth: 950,
          margin: "0 auto",
          textAlign: { xs: "left", sm: "left" },
          alignItems: { xs: "flex-start", sm: "flex-start" },
        }}
      >
        <Typography
          variant="h6"
          alignItems={{ xs: "center", sm: "left" }}
          sx={{ mb: 2 }}
        >
          HobbyHub
        </Typography>

        {preference && (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent={{ xs: "flex-start", sm: "flex-start" }}
            alignItems={{ xs: "flex-start", sm: "flex-start" }}
            sx={{ mb: 2 }}
          >
            <Typography variant="caption">
              Theme: <strong>{preference.theme}</strong>
            </Typography>
            <Typography variant="caption">
              Font: <strong>{preference.font}</strong>
            </Typography>
            <Typography variant="caption">
              Layout: <strong>{preference.layout}</strong>
            </Typography>
          </Stack>
        )}

        <Typography
          variant="caption"
          sx={{ opacity: 0.7 }}
          alignItems={{ xs: "left", sm: "left" }}
        >
          © 2025 HobbyHub. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

const Layout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const jwt = getAndParseJWT();
    if (!jwt) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        padding: 0,
        width: "100%",
      }}
    >
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: "80vh",
          display: "flex",
          justifyContent: "center",
          padding: { xs: 1, sm: 2 },
          width: "100%",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: { xs: "100%", sm: 1000 },
            padding: { xs: 1, sm: 2 },
            borderRadius: 1,
          }}
        >
          <Outlet />
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout;
