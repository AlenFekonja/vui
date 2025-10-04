import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL, showNotification } from "../App.tsx";
import { usePreferences } from "./PreferencesContext.tsx";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== password2) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/users`, {
        username,
        email,
        password,
      }, {
          withCredentials: true,
        });
      showNotification("Registration", "New user registered");
      navigate("/");
    } catch (error) {
      console.error("Error registering:", error);
      showNotification("Registration Error", "New user registration failed");
      setError("An error occurred during registration.");
    }
  };

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
        backgroundColor: theme === "dark" ? "#1e1e1e" : "#f0f0f0", 
      }}
    >
      <Card
        style={{
          maxWidth: 400,
          margin: "auto",
          padding: "20px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
        }}
      >
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Register
          </Typography>

          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              required
            />

            <TextField
              label="Email"
              type="email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />

            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
            />

            <TextField
              label="Confirm Password"
              type="password"
              variant="outlined"
              fullWidth
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              margin="normal"
              required
            />

            {error && (
              <Typography
                variant="body2"
                color="error"
                sx={{ marginTop: "10px" }}
              >
                {error}
              </Typography>
            )}

            <Link to={"/"} style={{ marginTop: 10 }}>
              Login
            </Link>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ marginTop: "1rem" }}
              style={{ marginTop: 10 }}
            >
              Submit
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
