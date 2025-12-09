import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Navbar from "./components/navbar";
import NavbarB from "./components/navbarB";
import {
  Box,
  Typography,
  Stack,
  Paper,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { getAndParseJWT } from "./components/jwt";
import { usePreferences } from "./components/PreferencesContext";

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

interface ABVariantToggleProps {
  variant: "A" | "B";
  onChange: (newVariant: "A" | "B") => void;
}

const ABVariantToggle: React.FC<ABVariantToggleProps> = ({
  variant,
  onChange,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVar: "A" | "B" = event.target.checked ? "B" : "A";
    onChange(newVar);
  };

  return (
    <Paper
      elevation={4}
      sx={{
        position: "fixed",
        top: 88, 
        right: 16,
        zIndex: 2000,
        px: 2,
        py: 1,
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <FormControlLabel
        control={
          <Switch
            checked={variant === "B"}
            onChange={handleChange}
            size="small"
          />
        }
        label={variant === "B" ? "Variant B" : "Variant A"}
      />
    </Paper>
  );
};

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [variant, setVariant] = useState<"A" | "B">(() => {
    const stored = localStorage.getItem("abVariant");
    if (stored === "A" || stored === "B") return stored;
    return "A";
  });

  const NavComponent = variant === "B" ? NavbarB : Navbar;

  useEffect(() => {
    const jwt = getAndParseJWT();
    if (!jwt) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    const path = location.pathname;

    if (variant === "B" && path === "/preferences") {
      navigate("/preferences2", { replace: true });
      return;
    }
    if (variant === "A" && path === "/preferences2") {
      navigate("/preferences", { replace: true });
      return;
    }

    if (variant === "B" && path === "/tasks/add") {
      navigate("/tasks/add2", { replace: true });
      return;
    }
    if (variant === "A" && path === "/tasks/add2") {
      navigate("/tasks/add", { replace: true });
      return;
    }

    if (path.startsWith("/tasks/edit/") && variant === "A") {
      navigate(path.replace("/tasks/edit/", "/tasks/edit/"), {
        replace: true,
      });
      return;
    }
    if (path.startsWith("/tasks/edit/") && variant === "B") {
      navigate(path.replace("/tasks/edit/", "/tasks/edit/"), {
        replace: true,
      });
      return;
    }
  }, [variant, location.pathname, navigate]);

  const handleVariantChange = (newVariant: "A" | "B") => {
    setVariant(newVariant);
    localStorage.setItem("abVariant", newVariant);
  };

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
      <NavComponent />
      <ABVariantToggle variant={variant} onChange={handleVariantChange} />

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