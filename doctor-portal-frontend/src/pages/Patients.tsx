import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
  Avatar,
  Box,
  TextField,
  InputAdornment,
  Grid,
  Skeleton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PeopleIcon from "@mui/icons-material/People";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { PatientSummary } from "../types";

type PatientsResponse = {
  patients: PatientSummary[];
};

const Patients = () => {
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<PatientsResponse>("/dashboard/patients");
        setPatients(res.data.patients);
      } catch {
        // Handle error silently
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPatients = patients.filter((p) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(searchLower) ||
      p.mobile_number?.includes(search) ||
      p.email?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <Stack spacing={3}>
        <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Page Header */}
      <Box>
        <Typography variant="h4" fontWeight={700} color="#0f172a" gutterBottom>
          Patients
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View your patients and their medical history
        </Typography>
      </Box>

      {/* Stats Card */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e2e8f0",
          background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
          color: "white",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PeopleIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h3" fontWeight={700}>
                {patients.length}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Total Patients
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search patients by name, phone, or email..."
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

      {/* Patients Grid */}
      {filteredPatients.length === 0 && (
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            border: "1px solid #e2e8f0",
          }}
        >
          <CardContent sx={{ py: 6, textAlign: "center" }}>
            <PeopleIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 2 }} />
            <Typography color="text.secondary">No patients found</Typography>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        {filteredPatients.map((p) => (
          <Grid item xs={12} sm={6} md={4} key={p.id}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                border: "1px solid #e2e8f0",
                height: "100%",
                transition: "all 0.2s ease",
                cursor: "pointer",
                "&:hover": {
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
                  borderColor: "#3b82f6",
                  transform: "translateY(-2px)",
                },
              }}
              onClick={() => navigate(`/patients/${p.id}`)}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                  {/* Avatar */}
                  <Avatar
                    sx={{
                      width: 72,
                      height: 72,
                      bgcolor: "#e2e8f0",
                      color: "#475569",
                      fontWeight: 700,
                      fontSize: "1.5rem",
                      mb: 2,
                    }}
                  >
                    {p.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </Avatar>

                  {/* Name */}
                  <Typography variant="h6" fontWeight={600} color="#0f172a" mb={1}>
                    {p.name}
                  </Typography>

                  {/* Contact Info */}
                  <Stack spacing={0.5} width="100%">
                    {p.mobile_number && (
                      <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                        <PhoneIcon sx={{ fontSize: 16, color: "#64748b" }} />
                        <Typography variant="body2" color="text.secondary">
                          {p.mobile_number}
                        </Typography>
                      </Box>
                    )}
                    {p.email && (
                      <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                        <EmailIcon sx={{ fontSize: 16, color: "#64748b" }} />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            maxWidth: 180,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {p.email}
                        </Typography>
                      </Box>
                    )}
                    {!p.mobile_number && !p.email && (
                      <Typography variant="body2" color="text.secondary">
                        No contact info
                      </Typography>
                    )}
                  </Stack>

                  {/* View Button */}
                  <Button
                    variant="outlined"
                    size="small"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      mt: 2,
                      textTransform: "none",
                      borderColor: "#e2e8f0",
                      color: "#64748b",
                      "&:hover": {
                        borderColor: "#3b82f6",
                        color: "#3b82f6",
                        bgcolor: "#f8fafc",
                      },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/patients/${p.id}`);
                    }}
                  >
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Results Count */}
      {filteredPatients.length > 0 && (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Showing {filteredPatients.length} of {patients.length} patients
        </Typography>
      )}
    </Stack>
  );
};

export default Patients;
