import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  useMediaQuery,
} from "@mui/material";
import { BACKEND_URL, showNotification } from "../App.tsx";
import { getAndParseJWT } from "./jwt.tsx";
import { useNavigate } from "react-router-dom";

export interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  points: number;
  level: number;
  admin: boolean;
}

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<User>({
    _id: "",
    username: "",
    email: "",
    password: "",
    points: 0,
    level: 1,
    admin: false,
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    const userPayload = getAndParseJWT()?.payload;
    if (!userPayload?.admin) {
      navigate("/");
    }
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/users`, {
          withCredentials: true,
        });
      setUsers(response.data);
    } catch (error) {
      showNotification("Users Error", "Error fetching users");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await axios.put(
          `${BACKEND_URL}/users/${editingUser._id}`,
          newUser, {
          withCredentials: true,
        });
        showNotification("Users", "User was updated");
      } else {
        await axios.post(`${BACKEND_URL}/users`, newUser, {
          withCredentials: true,
        });
        showNotification("Users", "User was added");
      }
      setEditingUser(null);
      setNewUser({
        _id: "",
        username: "",
        email: "",
        password: "",
        points: 0,
        level: 1,
        admin: false,
      });
      fetchUsers();
    } catch (error) {
      console.error("Error submitting user:", error);
      showNotification("Users Error", "Error submitting user");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${BACKEND_URL}/users/${id}`, {
          withCredentials: true,
        });
      showNotification("Users", "User was deleted");
      fetchUsers();
    } catch (error: any) {
      showNotification(
        "Users Error",
        "Error deleting user: " + error.message || error
      );
    }
  };

  const handleAdminUpdate = async (id: string) => {
    try {
      await axios.put(
        `${BACKEND_URL}/users/admin/${id}`,
        {},
        { withCredentials: true }
      );
      fetchUsers();
      showNotification("Users", "User admin status updated");
    } catch (error: any) {
      showNotification(
        "Users Error",
        "Error updating user admin status: " + error.message || error
      );
    }
  };

  const handleEdit = (user: User) => {
    setNewUser(user);
    setEditingUser(user);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Box display="flex" justifyContent="center" px={2} py={4}>
      <Box maxWidth="800px" width="100%">
        <Typography
          variant="h4"
          mb={3}
          sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
        >
          Users List
        </Typography>

        {users.map((user) => (
          <Card key={user._id} sx={{ mb: 2, p: { xs: 1, sm: 2 } }}>
            <CardContent>
              <Typography
                sx={{
                  fontSize: { xs: "0.85rem", sm: "1rem" },
                  wordBreak: "break-word",
                }}
              >
                <strong>ID:</strong> {user._id}
              </Typography>
              <Typography sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}>
                <strong>Username:</strong> {user.username}
              </Typography>
              <Typography sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}>
                <strong>Email:</strong> {user.email}
              </Typography>
              <Typography sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}>
                <strong>Points:</strong> {user.points}
              </Typography>
              <Typography sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}>
                <strong>Level:</strong> {user.level}
              </Typography>
              <Typography sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}>
                <strong>Admin:</strong> {user.admin ? "Yes" : "No"}
              </Typography>
            </CardContent>

            <Box
              display="flex"
              gap={2}
              flexDirection={{ xs: "column", sm: "row" }}
              p={2}
            >
              <Button
                onClick={() => handleDelete(user._id)}
                variant="outlined"
                color="error"
                fullWidth={isSmallScreen}
              >
                Delete
              </Button>
              <Button
                onClick={() => handleAdminUpdate(user._id)}
                variant="outlined"
                color={user.admin ? "error" : "primary"}
                fullWidth={isSmallScreen}
              >
                {user.admin ? "Remove admin status" : "Give admin status"}
              </Button>
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default UserList;
