import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Typography,
  Alert,
  AlertTitle,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL, showNotification } from "../App";
import { getAndParseJWT } from "./jwt";
import dayjs from "dayjs";
import { trackBrowseeEvent } from "../browsee"; 

export interface TaskPayload {
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

const CATEGORY_OPTIONS = ["Work", "Study", "Exercise", "Hobby", "Other"];
const SUS_URL_B = "https://1ka.arnes.si/a/c0f7b4dc";

const TaskFormB: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Other");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const today = dayjs().format("YYYY-MM-DD");
  const [date, setDate] = useState<string>(today);
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("10:00");
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);

  const [errors, setErrors] = useState<{
    title?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    category?: string;
  }>({});

  const formatDateTimeLocal = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 16); 
  };

  useEffect(() => {
    if (id) {
      trackBrowseeEvent("task_form_view_edit_B");
    } else {
      trackBrowseeEvent("task_form_view_create_B");
    }
  }, [id]);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/tasks/${id}`, {
          withCredentials: true,
        });
        const task = res.data;

        setTitle(task.title || "");
        setCategory(task.category || "Other");
        setDescription(task.description || "");
        setNotes(task.notes || "");

        if (task.reminder) {
          const formatted = formatDateTimeLocal(task.reminder);
          const [rDate, rTime] = formatted.split("T");
          setReminderDate(rDate || "");
          setReminderTime(rTime || "");
        } else {
          setReminderDate("");
          setReminderTime("");
        }

        if (task.event_date) setDate(task.event_date);
        if (task.start_time) setStartTime(task.start_time);
        if (task.end_time) setEndTime(task.end_time);

        setEditing(true);
      } catch (e) {
        console.error(e);
        showNotification("Tasks Error", "Couldn't fetch task for editing");
      }
    };

    if (id) fetchTask();
  }, [id]);

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!title.trim()) newErrors.title = "Required";
    if (!date) newErrors.date = "Required";
    if (!startTime) newErrors.startTime = "Required";
    if (!endTime) newErrors.endTime = "Required";
    if (!category) newErrors.category = "Required";

    if (date && startTime && endTime) {
      const start = dayjs(`${date}T${startTime}`);
      const end = dayjs(`${date}T${endTime}`);
      if (end.isBefore(start)) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const userId = getAndParseJWT()?.payload.id;
    if (!userId) {
      showNotification("Auth Error", "User is not logged in");
      return;
    }

    const reminder =
      reminderDate && reminderTime ? `${reminderDate}T${reminderTime}` : "";

    const payload: TaskPayload = {
      title: title.trim(),
      event_date: date,
      start_time: startTime,
      end_time: endTime,
      description: description.trim(),
      category,
      reminder,
      notes: notes.trim(),
    };

    try {
      setSubmitting(true);

      if (editing && id) {
        await axios.put(`${BACKEND_URL}/tasks/${id}`, payload, {
          withCredentials: true,
        });
        showNotification("Tasks", "Task updated");
        trackBrowseeEvent("task_edit_success_B");
      } else {
        await axios.post(`${BACKEND_URL}/tasks`, payload, {
          withCredentials: true,
        });
        showNotification("Tasks", "Task created");
        trackBrowseeEvent("task_submit_success_B");
      }

      navigate("/tasks");
    } catch (error: any) {
      console.error(error);
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message;
      showNotification("Tasks Error", msg || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSusClick = () => {
    const params = new URLSearchParams({
      page: editing ? "task_form_edit_B" : "task_form_create_B",
      variant: "B",
    });
    const url = `${SUS_URL_B}?${params.toString()}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      paddingTop={5}
      mb={3}
    >
      <Box sx={{ width: "100%", maxWidth: 700 }}>
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
            {editing ? "Edit task" : "Task"}
          </Typography>

          <Button variant="outlined" onClick={() => navigate("/tasks")}>
            Back to list
          </Button>
        </Box>

        {/* SUS banner – Task form B */}
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

        <Card
          sx={{
            transition: "all 0.2s ease",
            borderRadius: "8px",
            boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.15)",
            border: "1px solid rgb(205, 205, 205)",
            marginBottom: "30px",
          }}
        >
          <CardContent sx={{ fontFamily: "inherit", mt: 2 }}>
            <form onSubmit={handleSubmit} noValidate>
              <Grid container spacing={2}>
                {/* TITLE */}
                <Grid item xs={12}>
                  <TextField
                    label="Title"
                    required
                    fullWidth
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    error={!!errors.title}
                    helperText={errors.title || "Required"}
                  />
                </Grid>

                {/* CATEGORY */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Category"
                    required
                    fullWidth
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    error={!!errors.category}
                    helperText={errors.category || "Required"}
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* REMINDER DATE */}
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Reminder date"
                    type="date"
                    fullWidth
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    helperText="Optional"
                  />
                </Grid>

                {/* REMINDER TIME */}
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Reminder time"
                    type="time"
                    fullWidth
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 60 }}
                    helperText="Optional"
                  />
                </Grid>

                {/* DATE */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Date"
                    type="date"
                    required
                    fullWidth
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.date}
                    helperText={errors.date || "Required"}
                  />
                </Grid>

                {/* START TIME */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Start time"
                    type="time"
                    required
                    fullWidth
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 60 }}
                    error={!!errors.startTime}
                    helperText={errors.startTime || "Required"}
                  />
                </Grid>

                {/* END TIME */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="End time"
                    type="time"
                    required
                    fullWidth
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 60 }}
                    error={!!errors.endTime}
                    helperText={
                      errors.endTime || "Required (must be after start time)"
                    }
                  />
                </Grid>

                {/* DESCRIPTION */}
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    fullWidth
                    multiline
                    minRows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    helperText="Optional – extra details"
                  />
                </Grid>

                {/* NOTES */}
                <Grid item xs={12}>
                  <TextField
                    label="Notes"
                    fullWidth
                    multiline
                    minRows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    helperText="Optional – personal notes"
                  />
                </Grid>

                {/* ACTIONS */}
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="flex-end" gap={1}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate("/tasks")}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      type="submit"
                      disabled={submitting}
                    >
                      {editing ? "Save changes" : "Create task"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default TaskFormB;