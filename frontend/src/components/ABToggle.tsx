import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

type Variant = "A" | "B";

const ABToggle: React.FC = () => {
  const [variant, setVariant] = useState<Variant>("A");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem("ab_variant");

    if (stored === "A" || stored === "B") {
      setVariant(stored);

      if ((window as any)._browsee) {
        (window as any)._browsee("event", "ab_variant_loaded", {
          variant: stored,
        });
      }
    } else {
      localStorage.setItem("ab_variant", "A");
      setVariant("A");

      if ((window as any)._browsee) {
        (window as any)._browsee("event", "ab_variant_loaded", {
          variant: "A",
        });
      }
    }
  }, []);

  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: Variant | null
  ) => {
    if (!newValue) return;

    localStorage.setItem("ab_variant", newValue);
    setVariant(newValue);

    if ((window as any)._browsee) {
      (window as any)._browsee("event", "ab_variant_set", {
        variant: newValue,
        path: location.pathname,
      });
    }

    const path = location.pathname;

    if (path === "/preferences" || path === "/preferences2") {
      navigate(newValue === "A" ? "/preferences" : "/preferences2");
      return;
    }

    if (path === "/tasks/add" || path === "/tasks/add2") {
      navigate(newValue === "A" ? "/tasks/add" : "/tasks/add2");
      return;
    }

    if (path.startsWith("/tasks/edit") || path.startsWith("/tasks/edit2")) {
      const id = path.split("/").pop();
      navigate(newValue === "A" ? `/tasks/edit/${id}` : `/tasks/edit2/${id}`);
      return;
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 2000,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          px: 2,
          py: 1.5,
          borderRadius: 3,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          Variant
        </Typography>

        <ToggleButtonGroup
          value={variant}
          exclusive
          size="small"
          onChange={handleChange}
        >
          <ToggleButton value="A">A</ToggleButton>
          <ToggleButton value="B">B</ToggleButton>
        </ToggleButtonGroup>
      </Paper>
    </Box>
  );
};

export default ABToggle;