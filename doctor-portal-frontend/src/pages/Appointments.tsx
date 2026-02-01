import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  Avatar,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Skeleton,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import EventNoteIcon from "@mui/icons-material/EventNote";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ScheduleIcon from "@mui/icons-material/Schedule";
import api from "../services/api";
import { AppointmentItem } from "../types";

type AppointmentsResponse = {
  appointments: AppointmentItem[];
};

const Appointments = () => {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tabValue, setTabValue] = useState(0);

  // Dialog states
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: "complete" | "cancel" | "reschedule" | null;
    appointment: AppointmentItem | null;
  }>({ open: false, type: null, appointment: null });
  const [actionNotes, setActionNotes] = useState("");
  const [rescheduleData, setRescheduleData] = useState({
    new_date: "",
    new_start_time: "",
    new_end_time: "",
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await api.get<AppointmentsResponse>("/dashboard/appointments");
      setAppointments(res.data.appointments);
    } catch {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "BOOKED":
        return { bgcolor: "#dcfce7", color: "#16a34a" };
      case "RESCHEDULED":
        return { bgcolor: "#fef3c7", color: "#d97706" };
      case "CANCELLED":
        return { bgcolor: "#fee2e2", color: "#dc2626" };
      case "COMPLETED":
        return { bgcolor: "#dbeafe", color: "#2563eb" };
      default:
        return { bgcolor: "#f1f5f9", color: "#64748b" };
    }
  };

  // Helper to convert "HH:MM:SS" to "HH:MM" for time inputs
  const formatTimeForInput = (time: string) => {
    return time ? time.substring(0, 5) : "";
  };

  // Helper to convert "HH:MM" to "HH:MM:SS" for API
  const formatTimeForApi = (time: string) => {
    return time && time.length === 5 ? `${time}:00` : time;
  };

  const handleOpenAction = (type: "complete" | "cancel" | "reschedule", appointment: AppointmentItem) => {
    setActionDialog({ open: true, type, appointment });
    setActionNotes("");
    setActionError(null);
    setRescheduleData({
      new_date: appointment.date,
      new_start_time: formatTimeForInput(appointment.start_time),
      new_end_time: formatTimeForInput(appointment.end_time),
    });
  };

  const handleCloseAction = () => {
    setActionDialog({ open: false, type: null, appointment: null });
    setActionNotes("");
    setActionError(null);
  };

  const handleAction = async () => {
    if (!actionDialog.appointment || !actionDialog.type) return;

    setActionLoading(true);
    setActionError(null);

    try {
      const apptId = actionDialog.appointment.id;
      let endpoint = "";
      let payload: Record<string, unknown> = {};

      switch (actionDialog.type) {
        case "complete":
          endpoint = `/dashboard/appointments/${apptId}/complete`;
          payload = { notes: actionNotes };
          break;
        case "cancel":
          endpoint = `/dashboard/appointments/${apptId}/cancel`;
          payload = { reason: actionNotes };
          break;
        case "reschedule":
          endpoint = `/dashboard/appointments/${apptId}/reschedule`;
          payload = {
            new_date: rescheduleData.new_date,
            new_start_time: formatTimeForApi(rescheduleData.new_start_time),
            new_end_time: formatTimeForApi(rescheduleData.new_end_time),
            reason: actionNotes,
          };
          break;
      }

      const method = actionDialog.type === "reschedule" ? "put" : "post";
      await api[method](endpoint, payload);

      setActionSuccess(`Appointment ${actionDialog.type}d successfully`);
      handleCloseAction();
      fetchData(); // Refresh appointments

      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setActionError(detail ?? `Failed to ${actionDialog.type} appointment`);
    } finally {
      setActionLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const filteredAppointments = appointments
    .filter((appt) => {
      if (tabValue === 1 && appt.date !== today) return false;
      if (tabValue === 2 && appt.date <= today) return false;
      if (tabValue === 3 && appt.date >= today) return false;

      if (
        search &&
        !appt.patient.name.toLowerCase().includes(search.toLowerCase()) &&
        !appt.patient.mobile_number?.includes(search) &&
        !appt.patient.email?.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }

      if (statusFilter !== "all" && appt.status !== statusFilter) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.start_time.localeCompare(b.start_time);
    });

  const statCounts = {
    total: appointments.length,
    today: appointments.filter((a) => a.date === today).length,
    upcoming: appointments.filter((a) => a.date > today).length,
    past: appointments.filter((a) => a.date < today).length,
  };

  const canModify = (status: string) => status === "BOOKED" || status === "RESCHEDULED";

  if (loading) {
    return (
      <Stack spacing={3}>
        <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
        ))}
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Success Alert */}
      {actionSuccess && (
        <Alert severity="success" onClose={() => setActionSuccess(null)}>
          {actionSuccess}
        </Alert>
      )}

      {/* Page Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="h4" fontWeight={700} color="#0f172a" gutterBottom>
            Appointments
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage all your scheduled appointments
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Card sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)", border: "1px solid #e2e8f0" }}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          sx={{
            px: 2,
            "& .MuiTab-root": { textTransform: "none", fontWeight: 500, minWidth: "auto", px: 3 },
            "& .Mui-selected": { color: "#3b82f6 !important", fontWeight: 600 },
            "& .MuiTabs-indicator": { backgroundColor: "#3b82f6" },
          }}
        >
          <Tab label={`All (${statCounts.total})`} />
          <Tab label={`Today (${statCounts.today})`} />
          <Tab label={`Upcoming (${statCounts.upcoming})`} />
          <Tab label={`Past (${statCounts.past})`} />
        </Tabs>
      </Card>

      {/* Filters */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            placeholder="Search by patient name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#94a3b8" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "white",
                "&:hover fieldset": { borderColor: "#3b82f6" },
                "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
              },
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ borderRadius: 2, bgcolor: "white" }}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="BOOKED">Booked</MenuItem>
              <MenuItem value="RESCHEDULED">Rescheduled</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Appointments List */}
      <Stack spacing={2}>
        {filteredAppointments.length === 0 && (
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)", border: "1px solid #e2e8f0" }}>
            <CardContent sx={{ py: 6, textAlign: "center" }}>
              <EventNoteIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 2 }} />
              <Typography color="text.secondary">No appointments found</Typography>
            </CardContent>
          </Card>
        )}

        {filteredAppointments.map((appt) => (
          <Card
            key={appt.id}
            sx={{
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
              border: "1px solid #e2e8f0",
              transition: "all 0.2s ease",
              "&:hover": { boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)", borderColor: "#cbd5e1" },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box display="flex" gap={3}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: "#e2e8f0",
                      color: "#475569",
                      fontWeight: 600,
                      fontSize: "1.1rem",
                    }}
                  >
                    {appt.patient.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </Avatar>

                  <Box>
                    <Typography variant="h6" fontWeight={600} color="#0f172a" mb={0.5}>
                      {appt.patient.name}
                    </Typography>

                    <Stack direction="row" spacing={3} alignItems="center" mb={1}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <CalendarTodayIcon sx={{ fontSize: 16, color: "#64748b" }} />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(appt.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <AccessTimeIcon sx={{ fontSize: 16, color: "#64748b" }} />
                        <Typography variant="body2" color="text.secondary">
                          {appt.start_time} - {appt.end_time}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={2} alignItems="center">
                      {appt.patient.mobile_number && (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <PhoneIcon sx={{ fontSize: 14, color: "#94a3b8" }} />
                          <Typography variant="caption" color="text.secondary">
                            {appt.patient.mobile_number}
                          </Typography>
                        </Box>
                      )}
                      {appt.patient.email && (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <EmailIcon sx={{ fontSize: 14, color: "#94a3b8" }} />
                          <Typography variant="caption" color="text.secondary">
                            {appt.patient.email}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                </Box>

                {/* Actions */}
                <Box display="flex" alignItems="center" gap={1}>
                  {canModify(appt.status) && (
                    <>
                      <Tooltip title="Mark as Completed">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenAction("complete", appt)}
                          sx={{
                            bgcolor: "#dcfce7",
                            color: "#16a34a",
                            "&:hover": { bgcolor: "#bbf7d0" },
                          }}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reschedule">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenAction("reschedule", appt)}
                          sx={{
                            bgcolor: "#fef3c7",
                            color: "#d97706",
                            "&:hover": { bgcolor: "#fde68a" },
                          }}
                        >
                          <ScheduleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Cancel">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenAction("cancel", appt)}
                          sx={{
                            bgcolor: "#fee2e2",
                            color: "#dc2626",
                            "&:hover": { bgcolor: "#fecaca" },
                          }}
                        >
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  <Chip
                    label={appt.status}
                    size="small"
                    sx={{ ...getStatusColor(appt.status), fontWeight: 600, fontSize: "0.75rem", px: 1, ml: 1 }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {filteredAppointments.length > 0 && (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Showing {filteredAppointments.length} of {appointments.length} appointments
        </Typography>
      )}

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onClose={handleCloseAction} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {actionDialog.type === "complete" && "Complete Appointment"}
          {actionDialog.type === "cancel" && "Cancel Appointment"}
          {actionDialog.type === "reschedule" && "Reschedule Appointment"}
        </DialogTitle>
        <DialogContent>
          {actionError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {actionError}
            </Alert>
          )}

          {actionDialog.appointment && (
            <Box mb={3} p={2} bgcolor="#f8fafc" borderRadius={2}>
              <Typography fontWeight={600}>{actionDialog.appointment.patient.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {actionDialog.appointment.date} | {actionDialog.appointment.start_time} - {actionDialog.appointment.end_time}
              </Typography>
            </Box>
          )}

          {actionDialog.type === "reschedule" && (
            <Stack spacing={2} mb={2}>
              <TextField
                label="New Date"
                type="date"
                value={rescheduleData.new_date}
                onChange={(e) => setRescheduleData({ ...rescheduleData, new_date: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Start Time"
                    type="time"
                    value={rescheduleData.new_start_time}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, new_start_time: e.target.value })}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="End Time"
                    type="time"
                    value={rescheduleData.new_end_time}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, new_end_time: e.target.value })}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Stack>
          )}

          <TextField
            label={actionDialog.type === "complete" ? "Notes (optional)" : "Reason (optional)"}
            multiline
            rows={3}
            value={actionNotes}
            onChange={(e) => setActionNotes(e.target.value)}
            fullWidth
            placeholder={
              actionDialog.type === "complete"
                ? "Add any notes about the consultation..."
                : actionDialog.type === "cancel"
                ? "Reason for cancellation..."
                : "Reason for rescheduling..."
            }
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseAction} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAction}
            disabled={actionLoading}
            sx={{
              bgcolor:
                actionDialog.type === "complete"
                  ? "#16a34a"
                  : actionDialog.type === "cancel"
                  ? "#dc2626"
                  : "#d97706",
              "&:hover": {
                bgcolor:
                  actionDialog.type === "complete"
                    ? "#15803d"
                    : actionDialog.type === "cancel"
                    ? "#b91c1c"
                    : "#b45309",
              },
            }}
          >
            {actionLoading ? "Processing..." : actionDialog.type === "complete" ? "Complete" : actionDialog.type === "cancel" ? "Cancel Appointment" : "Reschedule"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default Appointments;
