import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { BACKEND_URL, showNotification } from "../../App.tsx";
import { usePreferences } from "../PreferencesContext.tsx";
import "./taskList.css";
import { getAndParseJWT } from "../jwt.tsx";

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

interface TaskListProps {
  embedded?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ embedded = false }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<"all" | "started" | "completed">("all");
  const [loadingComplete, setLoadingComplete] = useState<string | null>(null);
  const navigate = useNavigate();

  const { preference } = usePreferences();
  const layout = preference?.layout || "list";

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/tasks/user/${getAndParseJWT()?.payload.id}`, {
          withCredentials: true,
        });
      setTasks(response.data);
    } catch (error) {
      showNotification("Tasks Error", `Couldn't fetch tasks: ${error}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${BACKEND_URL}/tasks/${id}`, {
          withCredentials: true,
        });
      fetchTasks();
      showNotification("Tasks", "Task was deleted");
    } catch (error) {
      showNotification("Tasks Error", "Task was not deleted");
    }
  };

  const handleComplete = async (taskId: string) => {
    setLoadingComplete(taskId);
    try {
      const completeRes = await axios.put(
        `${BACKEND_URL}/tasks/${taskId}/complete`,
        {},
        { withCredentials: true }
      );
      fetchTasks();
      showNotification(
        "Tasks",
        `Task completed! +${completeRes.data.exp} EXP awarded.`
      );
    } catch (error: any) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message;
      showNotification("Error", msg);
    } finally {
      setLoadingComplete(null);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  return (
    <div>
      {!embedded && (
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ fontFamily: "inherit" }}
          >
            Tasks List
          </Typography>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              onClick={() => navigate("/calendar")}
              sx={{ fontFamily: "inherit" }}
            >
              Calendar View
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/tasks/add")}
              sx={{ fontFamily: "inherit" }}
            >
              Add task
            </Button>
          </Box>
        </Box>
      )}

      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }} // <-- sprememba!
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        mb={3}
        gap={1} // Da dodaš prostor med vrsticami na mobilnih
      >
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          alignItems="flex-start"
          justifyContent="flex-start"
          gap={1}
          width="100%"
        >
          <Button
            variant={filter === "all" ? "contained" : "outlined"}
            onClick={() => setFilter("all")}
            size="small"
            sx={{
              fontFamily: "inherit",
              width: { xs: "100%", sm: "auto" },
            }}
          >
            All
          </Button>
          <Button
            variant={filter === "started" ? "contained" : "outlined"}
            onClick={() => setFilter("started")}
            size="small"
            sx={{
              fontFamily: "inherit",
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Started
          </Button>
          <Button
            variant={filter === "completed" ? "contained" : "outlined"}
            onClick={() => setFilter("completed")}
            size="small"
            sx={{
              fontFamily: "inherit",
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Completed
          </Button>
        </Box>

        <Button
          variant="contained"
          onClick={() => navigate("/tasks/add")}
          size="small"
          sx={{
            fontFamily: "inherit",
            alignSelf: { xs: "stretch", sm: "auto" }, // xs: full width, sm+: normalno
            whiteSpace: "nowrap", // prepreči prelom besede
            px: { xs: 0, sm: 2 }, // malo več paddinga na desni/levo za večje zaslone
          }}
        >
          Add Task
        </Button>
      </Box>

      <div className={`task-container ${layout}`}>
        {filteredTasks.map((task) => (
          <div key={task._id} className={`task-card ${layout}`}>
            {layout === "compact" ? (
              <Box
                display="flex"
                flexDirection={{ xs: "column", sm: "row" }} // <- to je ključno
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                gap={2}
              >
                <Typography
                  fontWeight="bold"
                  sx={{ fontFamily: "inherit", flex: "1 1 20%" }}
                >
                  {task.title}
                </Typography>

                <Box
                  sx={{
                    flex: "1 1 15%",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    className="task-category"
                    sx={{ fontFamily: "inherit" }}
                  >
                    {task.category}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    flex: "1 1 40%",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {/* Description */}
                  <Typography
                    className="task-description"
                    sx={{
                      fontFamily: "inherit",
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                      whiteSpace: "normal",
                    }}
                  >
                    {task.description || "No description"}
                  </Typography>
                </Box>

                <Box
                  display="flex"
                  gap={1}
                  flexShrink={0}
                  sx={{
                    flex: { sm: "1 1 25%" },
                    justifyContent: { xs: "flex-end", sm: "flex-end" },
                    width: { xs: "100%", sm: "auto" },
                    mt: { xs: 1, sm: 0 },
                  }}
                >
                  <Tooltip title="Edit">
                    <IconButton
                      onClick={() => navigate(`/tasks/edit/${task._id}`)}
                      disabled={task.status === "completed"}
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      onClick={() => handleDelete(task._id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {task.status !== "completed" && (
                    <Button
                      onClick={() => handleComplete(task._id)}
                      variant="outlined"
                      color="primary"
                      size="small"
                      sx={{ fontWeight: "bold", fontFamily: "inherit" }}
                      disabled={loadingComplete === task._id}
                    >
                      {loadingComplete === task._id
                        ? "Completing..."
                        : "Complete"}
                    </Button>
                  )}
                </Box>
              </Box>
            ) : (
              <>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    className="task-title"
                    sx={{ fontFamily: "inherit" }}
                  >
                    {task.title}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    {task.status !== "completed" && layout === "list" && (
                      <Button
                        onClick={() => handleComplete(task._id)}
                        variant="outlined"
                        color="primary"
                        size="small"
                        sx={{ fontWeight: "bold", fontFamily: "inherit" }}
                        disabled={loadingComplete === task._id}
                      >
                        {loadingComplete === task._id
                          ? "Completing..."
                          : "Complete"}
                      </Button>
                    )}
                    {task.status === "completed" && (
                      <CheckCircleIcon
                        color="success"
                        titleAccess="Completed"
                      />
                    )}
                  </Box>
                </Box>

                {/* Basic info */}
                <Box
                  display="flex"
                  gap={3}
                  flexWrap="wrap"
                  color="text.secondary"
                  mb={2}
                  sx={{ fontSize: "0.9rem" }}
                >
                  <Box display="flex" alignItems="center" gap={0.4}>
                    <EventIcon fontSize="small" />
                    <Typography sx={{ fontFamily: "inherit" }}>
                      {new Date(task.event_date).toLocaleDateString("sl-SI", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.4}>
                    <AccessTimeIcon fontSize="small" />
                    <Typography sx={{ fontFamily: "inherit" }}>
                      {task.start_time} - {task.end_time}
                    </Typography>
                  </Box>
                  <Typography
                    className="task-category"
                    sx={{ fontFamily: "inherit" }}
                  >
                    {task.category}
                  </Typography>
                </Box>

                {/* Description */}
                <Typography
                  variant="body2"
                  className="task-description"
                  sx={{
                    fontFamily: "inherit",
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  {task.description || "No description"}
                </Typography>

                {/* Notes + Reminder + Buttons (list layout) */}
                {layout === "list" && (
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mt={2}
                    color="text.secondary"
                    flexWrap="wrap"
                  >
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: "inherit",
                          display: "block",
                          mb: 0.5,
                        }}
                      >
                        Reminder:{" "}
                        {new Date(task.event_date).toLocaleDateString("sl-SI", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        }) || "-"}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ fontFamily: "inherit", display: "block" }}
                      >
                        Notes: {task.notes || "-"}
                      </Typography>
                    </Box>

                    <Box display="flex" gap={1} mt={{ xs: 1, sm: 0 }}>
                      <Tooltip title="Edit">
                        <IconButton
                          onClick={() => navigate(`/tasks/edit/${task._id}`)}
                          disabled={task.status === "completed"}
                          color="primary"
                        >
                          <EditIcon fontSize="medium" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => handleDelete(task._id)}
                          color="error"
                        >
                          <DeleteIcon fontSize="medium" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                )}

                {/* Divider + Buttons (grid layout) */}
                {layout === "grid" && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      gap={1}
                      flexWrap="wrap"
                    >
                      {task.status !== "completed" && (
                        <Button
                          onClick={() => handleComplete(task._id)}
                          variant="outlined"
                          color="primary"
                          size="small"
                          sx={{
                            fontWeight: "bold",
                            fontFamily: "inherit",
                          }}
                          disabled={loadingComplete === task._id}
                        >
                          {loadingComplete === task._id
                            ? "Completing..."
                            : "Complete"}
                        </Button>
                      )}

                      <Box display="flex" gap={1} ml="auto">
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() => navigate(`/tasks/edit/${task._id}`)}
                            disabled={task.status === "completed"}
                            color="primary"
                          >
                            <EditIcon fontSize="medium" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => handleDelete(task._id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="medium" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;
