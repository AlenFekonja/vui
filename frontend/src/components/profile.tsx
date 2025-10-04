import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  Button,
  Avatar,
  Divider,
  Stack,
  LinearProgress,
  Grid,
  Chip,
} from "@mui/material";
import axios from "axios";
import { Trophy } from "lucide-react";
import { getAndParseJWT } from "./jwt.tsx";
import { BACKEND_URL } from "../App.tsx";

interface UserProfile {
  _id: string;
  email: string;
  admin: boolean;
  points: number;
  level: number;
}

interface Reward {
  _id: string;
  name: string;
  description?: string;
  level_required: number;
  condition_required?: string;
}

interface UserReward {
  _id: string;
  reward_id: Reward;
  earned_at: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const jwtData = getAndParseJWT()?.payload;
  const userId = jwtData?.id;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [achievements, setAchievements] = useState<UserReward[]>([]);
  const [loadingAchv, setLoadingAchv] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoadingProfile(false);
      return;
    }
    axios
      .get<UserProfile>(`${BACKEND_URL}/users/${userId}`, {
        withCredentials: true,
      })
      .then((res) => setProfile(res.data))
      .catch(() => setProfile(null))
      .finally(() => setLoadingProfile(false));
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setLoadingAchv(false);
      return;
    }
    axios
      .get<UserReward[]>(`${BACKEND_URL}/userRewards/${userId}`, {
        withCredentials: true,
      })
      .then((res) => setAchievements(res.data))
      .catch(() => setAchievements([]))
      .finally(() => setLoadingAchv(false));
  }, [userId]);

  if (!jwtData) {
    navigate("/");
    return null;
  }

  if (loadingProfile) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography>Loading profile...</Typography>
      </Box>
    );
  }
  if (!profile) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography>Profile not found.</Typography>
      </Box>
    );
  }

  const LEVEL_THRESHOLD = 100;
  const currentExp = profile.points % LEVEL_THRESHOLD;
  const progressPercent = Math.min((currentExp / LEVEL_THRESHOLD) * 100, 100);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{ p: 4 }}
    >
      <Card
        className="profile"
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", sm: 500, md: 600 },
          py: { xs: 3, sm: 4 },
          px: { xs: 2, sm: 3 },
          boxShadow: 5,
          borderRadius: 4,
          backgroundColor: "#fff",
          mt: { xs: 2, sm: 4 },
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Avatar
            sx={{
              bgcolor: "#1e90ff",
              width: { xs: 64, sm: 80 },
              height: { xs: 64, sm: 80 },
              fontSize: { xs: 28, sm: 32 },
              mb: 1,
            }}
          >
            {profile.email.charAt(0).toUpperCase()}
          </Avatar>

          <Typography
            variant="h5"
            fontWeight="bold"
            textAlign="center"
            sx={{
              fontSize: { xs: "1rem", sm: "1.25rem" },
              wordBreak: "break-all",
            }}
          >
            {profile.email}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ fontSize: { xs: "0.85rem", sm: "1rem" } }}
          >
            {profile.admin ? "Administrator" : "Standard User"}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={1} mb={3}>
          <ProfileItem label="User ID" value={profile._id} />
          <ProfileItem label="Level" value={profile.level} />
          <Box>
            <Typography
              color="text.secondary"
              sx={{ fontSize: { xs: "0.85rem", sm: "1rem" } }}
            >
              EXP
            </Typography>
            <Typography
              fontWeight="medium"
              mb={0.5}
              sx={{
                fontSize: { xs: "0.85rem", sm: "1rem" },
                wordBreak: "break-word",
              }}
            >
              {currentExp} / {LEVEL_THRESHOLD} ({Math.round(progressPercent)}%)
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progressPercent}
              sx={{
                height: { xs: 8, sm: 10 },
                borderRadius: 5,
              }}
            />
          </Box>
        </Stack>

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => navigate("/profile/edit")}
          >
            Edit Profile
          </Button>
        </Stack>
      </Card>

      <Box sx={{ width: "100%", maxWidth: 900, mt: 6 }}>
        <Typography
          variant="h4"
          sx={{
            fontFamily: "inherit",
            fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" }, // prilagaj po želji
          }}
        >
          My Achievements
        </Typography>

        {loadingAchv ? (
          <Typography>Loading achievements...</Typography>
        ) : achievements.length === 0 ? (
          <Typography color="text.secondary">
            You haven't earned any achievements yet.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {achievements.map((ur) => {
              const r = ur.reward_id;
              return (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={ur._id}
                  sx={{ height: "100%" }}
                >
                  <Card
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 2,
                      borderRadius: 2,
                      boxShadow: 2,
                      height: "100%",
                      minHeight: 180,
                      mt: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: 50,
                      }}
                    >
                      <Trophy size={40} color="#f5a623" />
                    </Box>

                    <Box ml={2} flexGrow={1}>
                      <Typography variant="h6" gutterBottom>
                        {r.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Earned on {new Date(ur.earned_at).toLocaleDateString()}
                      </Typography>
                      {r.description && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {r.description}
                        </Typography>
                      )}
                      <Chip
                        label={`Level ${r.level_required}`}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
      <Button
        variant="text"
        sx={{ mt: 4, color: "#555", textTransform: "none" }}
        onClick={() => navigate(-1)}
      >
        ← Go Back
      </Button>
    </Box>
  );
};

const ProfileItem = ({ label, value }: { label: string; value: any }) => (
  <Box display="flex" justifyContent="space-between" flexWrap="wrap">
    <Typography
      color="text.secondary"
      sx={{ fontSize: { xs: "0.98rem", sm: "1rem" } }}
    >
      {label}
    </Typography>
    <Typography
      fontWeight="medium"
      sx={{
        fontSize: { xs: "0.85rem", sm: "1rem" },
        wordBreak: "break-all",
        maxWidth: "100%",
        textAlign: "right",
      }}
    >
      {value}
    </Typography>
  </Box>
);

export default Profile;
