import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND_URL, showNotification } from "../App.tsx";
import { usePreferences } from "./PreferencesContext.tsx";

const AuthComponent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message] = useState("");
  const navigate = useNavigate();

  const { preference } = usePreferences();
  const theme = preference?.theme ?? "light";
  const font = preference?.font ?? "sans-serif";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme === "dark" ? "#1e1e1e" : "#f0f0f0", // sivo ozadje
      }}
    >
      <Card
        style={{
          maxWidth: 400,
          width: "100%",
          padding: "20px",
          backgroundColor: theme === "dark" ? "#333" : "#fff",
          color: theme === "dark" ? "#fff" : "#000",
          fontFamily: font,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
        }}
      >
        <CardContent>
          <Typography variant="h5" gutterBottom style={{ fontFamily: font }}>
            Authentication
          </Typography>
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{
              style: { color: theme === "dark" ? "#ccc" : "#000" },
            }}
            InputProps={{
              style: {
                color: theme === "dark" ? "#fff" : "#000",
                fontFamily: font,
              },
            }}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{
              style: { color: theme === "dark" ? "#ccc" : "#000" },
            }}
            InputProps={{
              style: {
                color: theme === "dark" ? "#fff" : "#000",
                fontFamily: font,
              },
            }}
          />
          <div style={{ marginTop: 10 }}>
            <Link
              to="/register"
              style={{
                color: theme === "dark" ? "#90caf9" : "#1976d2",
                fontFamily: font,
              }}
            >
              Register
            </Link>
          </div>
          <Button
            variant="contained"
            color="primary"
            onClick={async () => {
              try {
                const response = await axios.post(
                  `${BACKEND_URL}/users/login`,
                  { email, password }, {
          withCredentials: true,
        });

                navigate("/tasks");
                showNotification("Login", "You are now logged in");
              } catch (error) {
                showNotification("Login Failed", "Try again");
              }
            }}
            fullWidth
            style={{ marginTop: 10, fontFamily: font }}
          >
            Login
          </Button>
          {message && (
            <Typography color="error" style={{ marginTop: 10 }}>
              {message}
            </Typography>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthComponent;
