import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  Card,
  CardContent,
  Typography,
  Box,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  Alert,
  AlertTitle,
} from "@mui/material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { BACKEND_URL, showNotification } from "../App";
import { getAndParseJWT } from "./jwt";
import { trackBrowseeEvent } from "../browsee"; 

export interface Task {
  _id: string;
  user_id: string | { _id: string };
  title: string;
  event_date: string;
  start_time: string;
  end_time: string;
  description: string;
  category: string;
  reminder: string;
  notes: string;
  status?: "started" | "completed";
}

const SUS_URL_A = "https://1ka.arnes.si/a/21fab734";

const getQueryParams = (search: string) => {
  return new URLSearchParams(search);
};

const TaskForm = () => {
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [newTask, setNewTask] = useState({
    user_id: "",
    title: "",
    event_date: "",
    start_time: "",
    end_time: "",
    description: "",
    category: "",
    reminder: "",
    notes: "",
    status: "started",
  });

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    const params = getQueryParams(location.search);
    const dateFromQuery = params.get("date");

    if (dateFromQuery) {
      setNewTask((prev) => ({ ...prev, event_date: dateFromQuery }));
    }
  }, [location.search]);

  useEffect(() => {
    if (id) {
      trackBrowseeEvent("task_form_view_edit_A");
    } else {
      trackBrowseeEvent("task_form_view_create_A");
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const formatDateTimeLocal = (isoString: string) => {
      if (!isoString) return "";
      const date = new Date(isoString);
      const offset = date.getTimezoneOffset();
      const localDate = new Date(date.getTime() - offset * 60000);
      return localDate.toISOString().slice(0, 16);
    };

    const fetchTask = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/tasks/${id}`, {
          withCredentials: true,
        });

        const task = response.data;

        const userId =
          typeof task.user_id === "object" && task.user_id !== null
            ? task.user_id._id
            : task.user_id?.toString() || "";

        setNewTask({
          user_id: userId,
          title: task.title || "",
          event_date: task.event_date?.slice(0, 10) || "",
          start_time: task.start_time?.slice(0, 5) || "",
          end_time: task.end_time?.slice(0, 5) || "",
          description: task.description || "",
          category: task.category || "",
          reminder: formatDateTimeLocal(task.reminder || ""),
          notes: task.notes || "",
          status: task.status || "started",
        });

        setEditingTask(task);
      } catch (error) {
        console.error("Error fetching task:", error);
      }
    };

    fetchTask();
  }, [id]);

  const handleSusClick = () => {
    const params = new URLSearchParams({
      page: editingTask ? "task_form_edit_A" : "task_form_create_A",
      variant: "A",
    });
    const url = `${SUS_URL_A}?${params.toString()}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    newTask.user_id = getAndParseJWT()?.payload.id;

    try {
      if (editingTask) {
        await axios.put(`${BACKEND_URL}/tasks/${editingTask._id}`, newTask, {
          withCredentials: true,
        });

        showNotification("Tasks", "Task was edited");
        trackBrowseeEvent("task_edit_success_A");

        navigate("/tasks");
      } else {
        await axios.post(`${BACKEND_URL}/tasks`, newTask, {
          withCredentials: true,
        });

        showNotification("Tasks", "Task was added");
        trackBrowseeEvent("task_submit_success_A");
      }

      setNewTask({
        user_id: "",
        title: "",
        event_date: "",
        start_time: "",
        end_time: "",
        description: "",
        category: "",
        reminder: "",
        notes: "",
        status: "started",
      });

      setEditingTask(null);
    } catch (error) {
      console.error("Error submitting task:", error);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <Box display="flex" justifyContent="center" paddingTop={5} mb={3}>
      <Box maxWidth="800px" width="100%">
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography variant="h4">Task</Typography>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Back to list
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
                onClick={handleSusClick}
              >
                Fill SUS
              </Button>
            }
          >
            <AlertTitle>SUS Questionnaire</AlertTitle>
            After using this form, please complete a short usability
            questionnaire (SUS). It will open in a new tab.
          </Alert>
        </Box>

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                required
                fullWidth
                sx={{ mb: 2 }}
              />

              <TextField
                label="Event Date"
                type="date"
                value={newTask.event_date}
                onChange={(e) =>
                  setNewTask({ ...newTask, event_date: e.target.value })
                }
                required
                fullWidth
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Start Time"
                type="time"
                value={newTask.start_time}
                onChange={(e) =>
                  setNewTask({ ...newTask, start_time: e.target.value })
                }
                required
                fullWidth
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="End Time"
                type="time"
                value={newTask.end_time}
                onChange={(e) =>
                  setNewTask({ ...newTask, end_time: e.target.value })
                }
                required
                fullWidth
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Description"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                fullWidth
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newTask.category}
                  onChange={(e) =>
                    setNewTask({ ...newTask, category: e.target.value })
                  }
                  label="Category"
                >
                  {["work", "school", "sport", "hobby", "personal"].map(
                    (option) => (
                      <MenuItem key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>

              <TextField
                label="Reminder"
                type="datetime-local"
                value={newTask.reminder}
                onChange={(e) =>
                  setNewTask({ ...newTask, reminder: e.target.value })
                }
                fullWidth
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Notes"
                value={newTask.notes}
                onChange={(e) =>
                  setNewTask({ ...newTask, notes: e.target.value })
                }
                fullWidth
                sx={{ mb: 2 }}
              />

              <Box display="flex" justifyContent="flex-end">
                <Button type="submit" variant="contained">
                  {editingTask ? "Update Task" : "Create Task"}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default TaskForm;