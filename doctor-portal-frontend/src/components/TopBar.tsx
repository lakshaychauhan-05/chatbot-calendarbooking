import {
  AppBar,
  Avatar,
  Box,
  Button,
  Toolbar,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { useAuth } from "../hooks/useAuth";

const TopBar = () => {
  const { profile, logout } = useAuth();

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(8px)",
        color: "#0f172a",
        borderBottom: "1px solid #e2e8f0",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="#0f172a">
            {profile ? `Welcome back, Dr. ${profile.name.split(" ")[0]}` : "Doctor Portal"}
          </Typography>
          <Typography variant="body2" color="#64748b">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          {profile && (
            <>
              {/* Notification Icon */}
              <Tooltip title="Notifications">
                <IconButton
                  sx={{
                    bgcolor: "#f1f5f9",
                    "&:hover": { bgcolor: "#e2e8f0" },
                  }}
                >
                  <NotificationsNoneIcon sx={{ color: "#64748b" }} />
                </IconButton>
              </Tooltip>

              {/* Profile Section */}
              <Box
                display="flex"
                alignItems="center"
                gap={2}
                px={2}
                py={1}
                borderRadius={2}
                sx={{
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <Avatar
                  sx={{
                    width: 44,
                    height: 44,
                    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                    fontWeight: 700,
                    fontSize: "1rem",
                    boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)",
                  }}
                >
                  {getInitials(profile.name)}
                </Avatar>
                <Box textAlign="left">
                  <Typography variant="body1" fontWeight={600} color="#0f172a" lineHeight={1.3}>
                    {profile.name}
                  </Typography>
                  <Chip
                    label={profile.specialization}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.7rem",
                      bgcolor: "#dbeafe",
                      color: "#1d4ed8",
                      fontWeight: 500,
                    }}
                  />
                </Box>
              </Box>

              {/* Sign Out Button */}
              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={logout}
                sx={{
                  borderColor: "#e2e8f0",
                  color: "#64748b",
                  textTransform: "none",
                  fontWeight: 500,
                  px: 2,
                  "&:hover": {
                    borderColor: "#ef4444",
                    color: "#ef4444",
                    bgcolor: "#fef2f2",
                  },
                }}
              >
                Sign out
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
