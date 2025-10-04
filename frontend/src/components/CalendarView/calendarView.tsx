import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import axios from "axios";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { enUS } from "date-fns/locale";
import { Task } from "../TaskList/taskList";
import { Typography, Box, Dialog, Button } from "@mui/material";
import "./calendarView.css";
import { useNavigate } from "react-router-dom";
import {getAndParseJWT} from "../jwt.tsx";
import { BACKEND_URL } from "../../App.tsx";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource: Task;
}

const CalendarView = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<
    "month" | "week" | "day" | "agenda"
  >("month");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await axios.get<Task[]>(`${BACKEND_URL}/tasks/user/${getAndParseJWT()?.payload.id}`, {
          withCredentials: true,
        });

      const calendarEvents: CalendarEvent[] = response.data.map((task) => {
        const eventDate = new Date(task.event_date); // ISO datum

        const [startHour, startMinute] = task.start_time.split(":").map(Number);
        const [endHour, endMinute] = task.end_time.split(":").map(Number);

        const start = new Date(eventDate);
        start.setHours(startHour, startMinute, 0, 0);

        const end = new Date(eventDate);
        end.setHours(endHour, endMinute, 0, 0);

        let statusIcon = "";
        switch (task.status) {
          case "completed":
            statusIcon = "✅";
            break;
          case "started":
            statusIcon = "▶️";
            break;
          default:
            statusIcon = "❔";
        }

        return {
          title: `${statusIcon} ${task.title}`,
          start,
          end,
          allDay: false,
          resource: task,
        };
      });

      setEvents(calendarEvents);
    } catch (error) {
      console.error("Error fetching tasks for calendar:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const eventStyleGetter = (event: CalendarEvent) => {
    const statusColor =
      event.resource.status === "completed"
        ? "#90caf9"
        : event.resource.status === "started"
          ? "#a5d6a7"
          : "#ffe082";

    return {
      style: {
        backgroundColor: statusColor,
        color: "#000",
        borderRadius: "6px",
        border: "none",
        padding: "2px 5px",
        width: "80%",

        display: "flex",
        alignItems: "center", // navpično centriranje
        justifyContent: "center", // vodoravno centriranje
        textAlign: "center", // centriraj besedilo
        margin: "3px auto",
      },
    };
  };
  const CustomDateCellWrapper = ({ value, children }: any) => {
    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      const newDate = new Date(value);
      newDate.setDate(newDate.getDate() + 1);
      const isoDate = newDate.toISOString().split("T")[0];
      navigate(`/tasks/add?date=${isoDate}`);
    };

    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
        }}
      >
        <button
          className="plus"
          onClick={handleClick}
          style={{
            position: "absolute",
            top: "1px",
            right: "1px",
            height: "20px",
            fontSize: "14px",
            lineHeight: "18px",
            textAlign: "center",
            zIndex: 1000,
            border: "1px",
            cursor: "pointer",
          }}
        >
          +
        </button>
        <div style={{ height: "100%" }}>{children}</div>
      </div>
    );
  };

  return (
    <Box sx={{ width: "100%" }}>
      <div className="view">
        <div className="calendar-wrapper">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            date={currentDate}
            onNavigate={(date) => setCurrentDate(date)}
            view={currentView}
            onView={(view) => setCurrentView(view)}
            defaultView="month"
            views={["month", "week", "day", "agenda"]}
            popup
            eventPropGetter={eventStyleGetter}
            onSelectEvent={(event: CalendarEvent) => {
              setSelectedEvent(event);
              setIsModalOpen(true);
            }}
            components={{
              ...(currentView === "month" && {
                dateCellWrapper: CustomDateCellWrapper,
              }),
            }}
          />
        </div>
      </div>
      {selectedEvent && (
        <Dialog
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          fullWidth
          maxWidth="sm" // ali "xs", "md" - po potrebi
        >
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              width: "100%",
              boxSizing: "border-box",
              borderRadius: 2,
              backgroundColor: "background.paper",
              color: "text.primary",
              fontFamily: "Roboto, sans-serif",
              wordBreak: "break-word",
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
            >
              {selectedEvent.resource.title}
            </Typography>

            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>ID:</strong> {selectedEvent.resource._id}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Event date:</strong>{" "}
              {new Date(selectedEvent.resource.event_date).toLocaleDateString()}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Start time:</strong> {selectedEvent.resource.start_time}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>End time:</strong> {selectedEvent.resource.end_time}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Description:</strong> {selectedEvent.resource.description}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Reminder:</strong>{" "}
              {new Date(selectedEvent.resource.reminder).toLocaleString()}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Notes:</strong> {selectedEvent.resource.notes}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Status:</strong> {selectedEvent.resource.status}
            </Typography>

            <Box
              mt={2}
              display="flex"
              justifyContent="flex-end"
              flexWrap="wrap"
            >
              <Button
                variant="contained"
                onClick={() => setIsModalOpen(false)}
                sx={{ minWidth: 100 }}
              >
                Close
              </Button>
            </Box>
          </Box>
        </Dialog>
      )}
    </Box>
  );
};

export default CalendarView;
