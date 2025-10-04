import React, { useState } from "react";
import { Box, Typography, IconButton, Tooltip, Fade } from "@mui/material";
import ListIcon from "@mui/icons-material/List";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import TaskList from "./TaskList/taskList.tsx";
import CalendarView from "./CalendarView/calendarView.tsx";
const TaskManager = () => {
  const [view, setView] = useState<"list" | "calendar">("list");

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        paddingTop={5}
        alignItems="center"
        mb={3}
      >
        <Typography
          variant="h4"
          sx={{
            fontFamily: "inherit",
            fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" }, 
          }}
        >
          Task Manager
        </Typography>

        <Box display="flex" gap={1}>
          <Tooltip title="List View">
            <IconButton
              onClick={() => setView("list")}
              color={view === "list" ? "primary" : "default"}
              className="view-toggle-button"
            >
              <ListIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Calendar View">
            <IconButton
              onClick={() => setView("calendar")}
              color={view === "calendar" ? "primary" : "default"}
              className="view-toggle-button calendar"
            >
              <CalendarMonthIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box>
        <Fade in={view === "list"} timeout={500} unmountOnExit>
          <Box>{view === "list" && <TaskList embedded />}</Box>
        </Fade>

        <Fade in={view === "calendar"} timeout={500} unmountOnExit>
          <Box>{view === "calendar" && <CalendarView />}</Box>
        </Fade>
      </Box>
    </Box>
  );
};

export default TaskManager;
