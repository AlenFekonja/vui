import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Trophy, Edit2, Trash2 } from "lucide-react";
import { BACKEND_URL, showNotification } from "../App.tsx";
import { usePreferences } from "./PreferencesContext.tsx";

export interface Reward {
  _id: string;
  level_required: number;
  name: string;
  description?: string;
  condition_required?: string;
}

type AchievementType = "level" | "tasks";

const RewardList: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [type, setType] = useState<AchievementType>("level");
  const [threshold, setThreshold] = useState<number>(1);
  const [form, setForm] = useState<{ name: string; description: string }>({
    name: "",
    description: "",
  });

  const fetchRewards = async () => {
    try {
      const res = await axios.get<Reward[]>(`${BACKEND_URL}/rewards`, {
        withCredentials: true,
      });
      setRewards(res.data);
    } catch {
      showNotification("Rewards Error", "Couldn't fetch definitions");
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const handleOpen = (r?: Reward) => {
    if (r) {
      const cond = r.condition_required || "";
      if (cond.startsWith("level_")) {
        setType("level");
        setThreshold(parseInt(cond.replace("level_", ""), 10));
      } else if (cond.startsWith("tasks_completed_")) {
        setType("tasks");
        setThreshold(parseInt(cond.replace("tasks_completed_", ""), 10));
      }
      setEditingId(r._id);
      setForm({ name: r.name, description: r.description || "" });
    } else {
      setEditingId(null);
      setType("level");
      setThreshold(1);
      setForm({ name: "", description: "" });
    }
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const buildPayload = () => {
    const condition =
      type === "level" ? `level_${threshold}` : `tasks_completed_${threshold}`;
    const level_required = type === "level" ? threshold : 0;
    return {
      name: form.name,
      description: form.description,
      level_required,
      condition_required: condition,
    };
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      showNotification("Rewards Error", "Name is required");
      return;
    }
    try {
      const payload = buildPayload();
      if (editingId) {
        await axios.put(`${BACKEND_URL}/rewards/${editingId}`, payload, {
          withCredentials: true,
        });
        showNotification("Rewards", "Updated successfully");
      } else {
        await axios.post(`${BACKEND_URL}/rewards`, payload, {
          withCredentials: true,
        });
        showNotification("Rewards", "Created successfully");
      }
      handleClose();
      fetchRewards();
    } catch {
      showNotification("Rewards Error", "Save failed");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${BACKEND_URL}/rewards/${id}`, {
        withCredentials: true,
      });
      showNotification("Rewards", "Deleted");
      fetchRewards();
    } catch {
      showNotification("Rewards Error", "Delete failed");
    }
  };
  const { preference } = usePreferences();

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        paddingTop={5}
        alignItems="center"
        mb={3}
      >
        <Box sx={{ width: "100%" }}>
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
              All Achievement Definitions
            </Typography>

            <Button
              variant="contained"
              onClick={() => handleOpen()}
              sx={{
                fontFamily: "inherit",
                mt: { xs: 2, sm: 0 },
              }}
            >
              Add reward
            </Button>
          </Box>

          {rewards.length === 0 && <Typography>No rewards found.</Typography>}

          <Box
            className="reward-container"
            sx={{
              display: preference?.layout === "grid" ? "grid" : "flex",
              flexDirection:
                preference?.layout === "list" ||
                preference?.layout === "compact"
                  ? "column"
                  : undefined,
              gap: preference?.layout === "compact" ? 1 : 2,
              gridTemplateColumns: {
                xs: "1fr",
                sm:
                  preference?.layout === "grid"
                    ? "repeat(auto-fill, minmax(280px, 1fr))"
                    : undefined,
              },
              width: "100%",
              mb: 4,
            }}
          >
            {rewards.map((reward) => (
              <Card
                key={reward._id}
                sx={{
                  width: preference?.layout === "compact" ? "100%" : "auto",
                  transition: "all 0.2s ease",
                  borderRadius: "8px",
                  boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.15)",
                  border: "1px solid rgb(205, 205, 205)",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  "&:hover": {
                    transform: "scale(1.02)",
                    zIndex: 10,
                  },
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    p: {
                      xs: 2,
                      sm: preference?.layout === "list" ? 4 : 2,
                    },
                  }}
                >
                  {preference?.layout === "grid" ? (
                    // GRID
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        width: "100%",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="h6" fontWeight="bold">
                          {reward.name}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton
                            onClick={() => handleOpen(reward)}
                            color="primary"
                          >
                            <Edit2 size={20} />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDelete(reward._id)}
                            color="error"
                          >
                            <Trash2 size={20} />
                          </IconButton>
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 2,
                          alignItems: "center",
                          minHeight: "60px",
                        }}
                      >
                        <Box
                          sx={{
                            minWidth: 40,
                            minHeight: 40,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Trophy size={40} color="#f5a623" />
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          <Chip
                            label={reward.condition_required}
                            variant="outlined"
                            color="primary"
                            sx={{ width: "fit-content" }}
                          />
                          <Typography variant="body1">
                            {reward.description ?? ""}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ) : preference?.layout === "compact" ? (
                    // COMPACT
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr", // stack on mobile
                          sm: "2fr 1fr 3fr auto", // normal layout on sm+
                        },
                        alignItems: "center",
                        gap: 2,
                        width: "100%",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Trophy size={25} color="#f5a623" />
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: "bold",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={reward.name}
                        >
                          {reward.name}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          justifySelf: {
                            xs: "start", // levo poravnano na malih zaslonih
                            sm: "center",
                          },
                        }}
                      >
                        <Chip
                          label={reward.condition_required}
                          variant="outlined"
                          color="primary"
                          sx={{ whiteSpace: "nowrap" }}
                        />
                      </Box>
                      <Typography
                        variant="body1"
                        sx={{
                          whiteSpace: "normal",
                          overflowWrap: "break-word",
                          textAlign: {
                            xs: "left", // na malih zaslonih levo
                            sm: "center", // večji lahko center
                          },
                          justifySelf: {
                            xs: "start", // levo na malih
                            sm: "center",
                          },
                        }}
                      >
                        {reward.description ?? ""}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          gap: 0.5,
                          justifyContent: "flex-end",
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleOpen(reward)}
                          color="primary"
                        >
                          <Edit2 size={16} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(reward._id)}
                          color="error"
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </Box>
                    </Box>
                  ) : (
                    // LIST
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr", // stack on mobile
                          sm: "25% 20% 30% auto", // normal layout on sm+
                        },
                        alignItems: "center",
                        gap: 2,
                        width: "100%",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Trophy size={40} color="#f5a623" />
                        <Typography
                          variant="body1"
                          sx={{
                            fontFamily: "inherit",
                            fontWeight: "bold",
                          }}
                        >
                          {reward.name}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          justifySelf: {
                            xs: "start", // levo poravnano na malih zaslonih
                            sm: "center",
                          },
                        }}
                      >
                        <Chip
                          label={reward.condition_required}
                          variant="outlined"
                          color="primary"
                          sx={{ whiteSpace: "nowrap" }}
                        />
                      </Box>

                      <Typography
                        variant="body1"
                        sx={{
                          whiteSpace: "normal",
                          overflowWrap: "break-word",
                          textAlign: {
                            xs: "left", // na malih zaslonih levo
                            sm: "center", // večji lahko center
                          },
                          justifySelf: {
                            xs: "start", // levo na malih
                            sm: "center",
                          },
                        }}
                      >
                        {reward.description ?? ""}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 1,
                        }}
                      >
                        <IconButton
                          onClick={() => handleOpen(reward)}
                          color="primary"
                        >
                          <Edit2 size={20} />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(reward._id)}
                          color="error"
                        >
                          <Trash2 size={20} />
                        </IconButton>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      </Box>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontFamily: "inherit" }}>
          {editingId ? "Edit Achievement" : "Add Achievement"}
        </DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2 }}>
          <Box height={1} />
          <FormControl fullWidth>
            <InputLabel sx={{ fontFamily: "inherit" }}>Type</InputLabel>
            <Select
              value={type}
              label="Type"
              sx={{ fontFamily: "inherit" }}
              onChange={(e) => setType(e.target.value as AchievementType)}
            >
              <MenuItem value="level">Level Achievement</MenuItem>
              <MenuItem value="tasks">Task Count Achievement</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label={type === "level" ? "Level Number" : "Tasks Count"}
            type="number"
            value={threshold}
            sx={{ fontFamily: "inherit" }}
            onChange={(e) => setThreshold(+e.target.value)}
            fullWidth
          />

          <TextField
            label="Name"
            sx={{ fontFamily: "inherit" }}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Description"
            sx={{ fontFamily: "inherit" }}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            fullWidth
            multiline
            minRows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ fontFamily: "inherit" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ fontFamily: "inherit" }}
          >
            {editingId ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RewardList;
