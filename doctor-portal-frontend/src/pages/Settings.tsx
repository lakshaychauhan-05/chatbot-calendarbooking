import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment,
  IconButton,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SaveIcon from "@mui/icons-material/Save";
import api from "../services/api";
import { DoctorProfile } from "../types";

interface ProfileForm {
  name: string;
  specialization: string;
  experience_years: string;
  languages: string;
  consultation_type: string;
  timezone: string;
}

interface PasswordForm {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const SettingsPage = () => {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile form state
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: "",
    specialization: "",
    experience_years: "",
    languages: "",
    consultation_type: "",
    timezone: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileAlert, setProfileAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Password form state
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordAlert, setPasswordAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await api.get<DoctorProfile>("/dashboard/me");
      setProfile(res.data);
      setProfileForm({
        name: res.data.name || "",
        specialization: res.data.specialization || "",
        experience_years: res.data.experience_years?.toString() || "",
        languages: res.data.languages?.join(", ") || "",
        consultation_type: res.data.consultation_type || "",
        timezone: res.data.timezone || "",
      });
    } catch {
      setProfileAlert({ type: "error", message: "Failed to load profile" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileSubmit = async () => {
    setProfileSaving(true);
    setProfileAlert(null);
    try {
      const payload = {
        name: profileForm.name || null,
        specialization: profileForm.specialization || null,
        experience_years: profileForm.experience_years ? parseInt(profileForm.experience_years) : null,
        languages: profileForm.languages
          ? profileForm.languages.split(",").map((s) => s.trim()).filter(Boolean)
          : null,
        consultation_type: profileForm.consultation_type || null,
        timezone: profileForm.timezone || null,
      };
      await api.put<DoctorProfile>("/dashboard/me", payload);
      setProfileAlert({ type: "success", message: "Profile updated successfully" });
      fetchProfile();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setProfileAlert({
        type: "error",
        message: error.response?.data?.detail || "Failed to update profile",
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async () => {
    setPasswordAlert(null);

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordAlert({ type: "error", message: "New passwords do not match" });
      return;
    }

    if (passwordForm.new_password.length < 6) {
      setPasswordAlert({ type: "error", message: "Password must be at least 6 characters" });
      return;
    }

    setPasswordSaving(true);
    try {
      await api.put("/auth/change-password", {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPasswordAlert({ type: "success", message: "Password changed successfully" });
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setPasswordAlert({
        type: "error",
        message: error.response?.data?.detail || "Failed to change password",
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: "#f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SettingsIcon sx={{ fontSize: 24, color: "#64748b" }} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={700} color="#0f172a">
            Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your profile and account settings
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Settings Card */}
        <Grid item xs={12} lg={6}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
              border: "1px solid #e2e8f0",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <PersonIcon sx={{ color: "#3b82f6" }} />
                <Typography variant="h6" fontWeight={600} color="#0f172a">
                  Profile Information
                </Typography>
              </Box>

              {profileAlert && (
                <Alert
                  severity={profileAlert.type}
                  onClose={() => setProfileAlert(null)}
                  sx={{ mb: 3, borderRadius: 2 }}
                >
                  {profileAlert.message}
                </Alert>
              )}

              <Stack spacing={2.5}>
                <TextField
                  label="Full Name"
                  fullWidth
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                />
                <TextField
                  label="Specialization"
                  fullWidth
                  value={profileForm.specialization}
                  onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })}
                />
                <TextField
                  label="Years of Experience"
                  type="number"
                  fullWidth
                  value={profileForm.experience_years}
                  onChange={(e) => setProfileForm({ ...profileForm, experience_years: e.target.value })}
                />
                <TextField
                  label="Languages"
                  fullWidth
                  value={profileForm.languages}
                  onChange={(e) => setProfileForm({ ...profileForm, languages: e.target.value })}
                  helperText="Separate languages with commas (e.g., English, Spanish)"
                />
                <TextField
                  label="Consultation Type"
                  fullWidth
                  value={profileForm.consultation_type}
                  onChange={(e) => setProfileForm({ ...profileForm, consultation_type: e.target.value })}
                />
                <TextField
                  label="Timezone"
                  fullWidth
                  value={profileForm.timezone}
                  onChange={(e) => setProfileForm({ ...profileForm, timezone: e.target.value })}
                />

                <Divider sx={{ my: 1 }} />

                <Box display="flex" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    startIcon={profileSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    onClick={handleProfileSubmit}
                    disabled={profileSaving}
                    sx={{
                      bgcolor: "#3b82f6",
                      "&:hover": { bgcolor: "#2563eb" },
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      px: 3,
                    }}
                  >
                    {profileSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Password Settings Card */}
        <Grid item xs={12} lg={6}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
              border: "1px solid #e2e8f0",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <LockIcon sx={{ color: "#f59e0b" }} />
                <Typography variant="h6" fontWeight={600} color="#0f172a">
                  Change Password
                </Typography>
              </Box>

              {passwordAlert && (
                <Alert
                  severity={passwordAlert.type}
                  onClose={() => setPasswordAlert(null)}
                  sx={{ mb: 3, borderRadius: 2 }}
                >
                  {passwordAlert.message}
                </Alert>
              )}

              <Stack spacing={2.5}>
                <TextField
                  label="Current Password"
                  type={showCurrentPassword ? "text" : "password"}
                  fullWidth
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          edge="end"
                        >
                          {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="New Password"
                  type={showNewPassword ? "text" : "password"}
                  fullWidth
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  helperText="Minimum 6 characters"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                        >
                          {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Confirm New Password"
                  type={showConfirmPassword ? "text" : "password"}
                  fullWidth
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  error={
                    passwordForm.confirm_password !== "" &&
                    passwordForm.new_password !== passwordForm.confirm_password
                  }
                  helperText={
                    passwordForm.confirm_password !== "" &&
                    passwordForm.new_password !== passwordForm.confirm_password
                      ? "Passwords do not match"
                      : ""
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Divider sx={{ my: 1 }} />

                <Box display="flex" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    startIcon={passwordSaving ? <CircularProgress size={20} color="inherit" /> : <LockIcon />}
                    onClick={handlePasswordSubmit}
                    disabled={
                      passwordSaving ||
                      !passwordForm.current_password ||
                      !passwordForm.new_password ||
                      !passwordForm.confirm_password
                    }
                    sx={{
                      bgcolor: "#f59e0b",
                      "&:hover": { bgcolor: "#d97706" },
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      px: 3,
                    }}
                  >
                    {passwordSaving ? "Changing..." : "Change Password"}
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Account Info Card */}
          {profile && (
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                border: "1px solid #e2e8f0",
                mt: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" fontWeight={600} color="text.secondary" mb={2}>
                  Account Information
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {profile.email}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Timezone
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {profile.timezone}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Stack>
  );
};

export default SettingsPage;
