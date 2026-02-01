import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
  Chip,
  Avatar,
  Skeleton,
  IconButton,
  Tooltip,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import LanguageIcon from "@mui/icons-material/Language";
import WorkIcon from "@mui/icons-material/Work";
import PhoneIcon from "@mui/icons-material/Phone";
import VideocamIcon from "@mui/icons-material/Videocam";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AppointmentItem, DoctorProfile } from "../types";

type OverviewResponse = {
  doctor: DoctorProfile;
  upcoming_appointments: AppointmentItem[];
};

const StatCard = ({
  title,
  value,
  icon,
  color,
  bgColor,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}) => (
  <Card
    sx={{
      borderRadius: 3,
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
      border: "1px solid #e2e8f0",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
      },
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box display="flex" alignItems="flex-start" justifyContent="space-between">
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500} mb={1}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700} color="#0f172a">
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: bgColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box sx={{ color }}>{icon}</Box>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<OverviewResponse>("/dashboard/overview");
        setOverview(res.data);
      } catch {
        // Handle error silently
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const upcoming = overview?.upcoming_appointments ?? [];
  const todayAppointments = upcoming.filter(
    (a) => a.date === new Date().toISOString().split("T")[0]
  ).length;

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

  if (loading) {
    return (
      <Stack spacing={3}>
        <Skeleton variant="rectangular" height={40} width={200} sx={{ borderRadius: 2 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
      </Stack>
    );
  }

  return (
    <Stack spacing={4}>
      {/* Page Header */}
      <Box>
        <Typography variant="h4" fontWeight={700} color="#0f172a" gutterBottom>
          Dashboard Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to your practice management dashboard
        </Typography>
      </Box>

      {/* Stats Row */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Appointments"
            value={todayAppointments}
            icon={<CalendarTodayIcon />}
            color="#3b82f6"
            bgColor="#dbeafe"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Upcoming Total"
            value={upcoming.length}
            icon={<AccessTimeIcon />}
            color="#8b5cf6"
            bgColor="#ede9fe"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Experience"
            value={`${overview?.doctor.experience_years || 0} yrs`}
            icon={<TrendingUpIcon />}
            color="#10b981"
            bgColor="#d1fae5"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Languages"
            value={overview?.doctor.languages.length || 0}
            icon={<LanguageIcon />}
            color="#f59e0b"
            bgColor="#fef3c7"
          />
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Doctor Profile Card */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
              border: "1px solid #e2e8f0",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} color="#0f172a" mb={3}>
                Your Profile
              </Typography>

              {overview && (
                <Stack spacing={3}>
                  {/* Avatar and Name */}
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                        fontSize: "1.5rem",
                        fontWeight: 700,
                      }}
                    >
                      {overview.doctor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700} color="#0f172a">
                        {overview.doctor.name}
                      </Typography>
                      <Chip
                        label={overview.doctor.specialization}
                        size="small"
                        sx={{
                          bgcolor: "#dbeafe",
                          color: "#1d4ed8",
                          fontWeight: 500,
                          mt: 0.5,
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Info Items */}
                  <Stack spacing={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 1.5,
                          bgcolor: "#f1f5f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <WorkIcon sx={{ fontSize: 18, color: "#64748b" }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Experience
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {overview.doctor.experience_years} years
                        </Typography>
                      </Box>
                    </Box>

                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 1.5,
                          bgcolor: "#f1f5f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {overview.doctor.consultation_type === "VIDEO" ? (
                          <VideocamIcon sx={{ fontSize: 18, color: "#64748b" }} />
                        ) : (
                          <PhoneIcon sx={{ fontSize: 18, color: "#64748b" }} />
                        )}
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Consultation Type
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {overview.doctor.consultation_type}
                        </Typography>
                      </Box>
                    </Box>

                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 1.5,
                          bgcolor: "#f1f5f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <AccessTimeIcon sx={{ fontSize: 18, color: "#64748b" }} />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Timezone
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {overview.doctor.timezone}
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>

                  {/* Languages */}
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                      Languages
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {overview.doctor.languages.map((lang) => (
                        <Chip
                          key={lang}
                          size="small"
                          label={lang}
                          sx={{
                            bgcolor: "#f1f5f9",
                            color: "#475569",
                            fontWeight: 500,
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Appointments */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
              border: "1px solid #e2e8f0",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarTodayIcon sx={{ color: "#3b82f6" }} />
                  <Typography variant="h6" fontWeight={600} color="#0f172a">
                    Upcoming Appointments
                  </Typography>
                </Box>
                <Tooltip title="View all appointments">
                  <IconButton
                    onClick={() => navigate("/appointments")}
                    sx={{
                      bgcolor: "#f1f5f9",
                      "&:hover": { bgcolor: "#e2e8f0" },
                    }}
                  >
                    <ArrowForwardIcon sx={{ fontSize: 18, color: "#64748b" }} />
                  </IconButton>
                </Tooltip>
              </Box>

              <Stack spacing={2}>
                {upcoming.length === 0 && (
                  <Box
                    py={6}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <PeopleIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 2 }} />
                    <Typography color="text.secondary">No upcoming appointments</Typography>
                  </Box>
                )}

                {upcoming.slice(0, 5).map((appt) => (
                  <Box
                    key={appt.id}
                    p={2.5}
                    borderRadius={2}
                    sx={{
                      bgcolor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: "#f1f5f9",
                        borderColor: "#cbd5e1",
                      },
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box display="flex" gap={2}>
                        <Avatar
                          sx={{
                            width: 44,
                            height: 44,
                            bgcolor: "#e2e8f0",
                            color: "#475569",
                            fontWeight: 600,
                          }}
                        >
                          {appt.patient.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={600} color="#0f172a">
                            {appt.patient.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {appt.date} | {appt.start_time} - {appt.end_time}
                          </Typography>
                          {appt.patient.mobile_number && (
                            <Typography variant="caption" color="text.secondary">
                              {appt.patient.mobile_number}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <Chip
                        label={appt.status}
                        size="small"
                        sx={{
                          ...getStatusColor(appt.status),
                          fontWeight: 600,
                          fontSize: "0.7rem",
                        }}
                      />
                    </Box>
                  </Box>
                ))}

                {upcoming.length > 5 && (
                  <Box textAlign="center" pt={1}>
                    <Typography
                      variant="body2"
                      color="primary"
                      sx={{
                        cursor: "pointer",
                        fontWeight: 500,
                        "&:hover": { textDecoration: "underline" },
                      }}
                      onClick={() => navigate("/appointments")}
                    >
                      View {upcoming.length - 5} more appointments
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default Dashboard;
