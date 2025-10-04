import React, { useState } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Link,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  useMediaQuery,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from "@mui/material";
import { MoreVertical, User, Menu as MenuIcon } from "lucide-react";
import VoiceCommand from "./voiceCommand.tsx";
import { useNavigate } from "react-router-dom";
import { getAndParseJWT } from "./jwt.tsx";

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const user = getAndParseJWT()?.payload;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    navigate("/");
  };

  const isMobile = useMediaQuery("(max-width:600px)");

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box
      onClick={toggleMobileMenu}
      sx={{
        width: 250,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
      role="presentation"
    >
      <Box sx={{ p: 2 }}>
        {user?.email && (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            Logged in as: {user.email}
          </Typography>
        )}
        <Divider />
      </Box>
      <List sx={{ flexGrow: 1 }}>
        <ListItemButton onClick={() => navigate("/tasks")}>
          <ListItemText primary="Tasks" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate("/preferences")}>
          <ListItemText primary="Preferences" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate("/profile")}>
          <ListItemIcon sx={{ minWidth: 30, mr: 0.5 }}>
            <User />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate("/shortcuts")}>
          <ListItemText primary="Shortcuts" />
        </ListItemButton>
        {user?.admin && (
          <>
            <ListItemButton onClick={() => navigate("/users")}>
              <ListItemText primary="Users (admin)" />
            </ListItemButton>
            <ListItemButton onClick={() => navigate("/rewards")}>
              <ListItemText primary="Rewards (admin)" />
            </ListItemButton>
          </>
        )}
      </List>
      <Box sx={{ p: 2 }}>
        <Divider />
        <ListItemButton onClick={handleLogout}>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <AppBar position="static" sx={{ backgroundColor: "#333" }}>
      <Toolbar
        sx={{
          maxWidth: 1200,
          height: "80px",
          width: "100%",
          marginX: "auto",
          justifyContent: "space-between",
        }}
      >
        <Box display="flex" alignItems="center">
          <Box
            component="img"
            src="/icons/logo.png"
            alt="logo"
            sx={{ height: "50px", width: "auto", marginRight: 1 }}
          />
          <Link
            href="/tasks"
            underline="none"
            color="inherit"
            sx={{ fontSize: "1.3em", fontWeight: "bold" }}
          >
            HobbyHub
          </Link>
        </Box>

        {isMobile ? (
          <>
            <IconButton
              onClick={toggleMobileMenu}
              sx={{ color: "inherit" }}
              aria-label="open menu"
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="right"
              open={mobileOpen}
              onClose={toggleMobileMenu}
              ModalProps={{
                keepMounted: true,
              }}
            >
              {drawer}
            </Drawer>
          </>
        ) : (
          <Stack
            direction="row"
            spacing={4}
            component="ul"
            sx={{ listStyle: "none", m: 0, p: 0, alignItems: "center" }}
          >
            <li>
              <Link
                href="/tasks"
                underline="none"
                color="inherit"
                sx={{ fontSize: "1.1em", "&:hover": { color: "#1e90ff" } }}
              >
                Tasks
              </Link>
            </li>
            <li>
              <Link
                href="/preferences"
                underline="none"
                color="inherit"
                sx={{ fontSize: "1.1em", "&:hover": { color: "#1e90ff" } }}
              >
                Preferences
              </Link>
            </li>
            <li>
              <Tooltip title="Profile">
                <IconButton
                  onClick={() => navigate("/profile")}
                  sx={{ color: "inherit", p: 0 }}
                >
                  <User />
                </IconButton>
              </Tooltip>
            </li>
            <li>
              <IconButton onClick={handleClick} sx={{ color: "inherit", p: 0 }}>
                <MoreVertical />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                {user?.email && (
                  <MenuItem disabled>Logged in as: {user.email}</MenuItem>
                )}
                <MenuItem onClick={handleClose}>
                  <VoiceCommand />
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleClose();
                    navigate("/shortcuts");
                  }}
                >
                  Shortcuts
                </MenuItem>
                {user?.admin && (
                  <>
                    <MenuItem
                      onClick={() => {
                        handleClose();
                        navigate("/users");
                      }}
                    >
                      Users (admin)
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleClose();
                        navigate("/rewards");
                      }}
                    >
                      Rewards (admin)
                    </MenuItem>
                  </>
                )}
                <MenuItem
                  onClick={() => {
                    handleClose();
                    handleLogout();
                  }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </li>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
