import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";
import { getAndParseJWT } from "./jwt.tsx";
import { BACKEND_URL, showNotification } from "../App.tsx";

interface Reward {
  _id: string;
  level_required: number;
  name: string;
  description: string;
  condition_required: string;
  __v: number;
}

interface UserReward {
  _id: string;
  user_id: string;
  reward_id: Reward;
  earned_at: string;
}

const UserRewardList = () => {
  const [userRewards, setUserRewards] = useState<UserReward[]>([]);

  const fetchUserRewards = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/userRewards/${getAndParseJWT()?.payload.id}`, {
          withCredentials: true,
        });
      setUserRewards(response.data);
    } catch (error) {
      showNotification("My Rewards Error","Error fetching user rewards");
    }
  };

  useEffect(() => {
    fetchUserRewards();
  }, []);

  return (
    <div
      className="user-reward"
      style={{ display: "flex", justifyContent: "center", padding: "20px" }}
    >
      <div style={{ maxWidth: "800px", width: "100%" }}>
        <Typography variant="h3" mb={4}>
          List of my rewards
        </Typography>

        <div style={{ marginTop: "24px" }}>
          {userRewards.map((badge) => (
            <Card key={badge._id} style={{ marginBottom: "16px" }}>
              <CardContent>
                <Typography>
                  Level Required: {badge.reward_id.level_required}
                </Typography>
                <Typography>Name: {badge.reward_id.name}</Typography>
                <Typography>
                  Description: {badge.reward_id.description}
                </Typography>
                <Typography>
                  Condition Required:
                  {badge.reward_id.condition_required || "None"}
                </Typography>
                <Typography>Earned at: {badge.earned_at}</Typography>
              </CardContent>

              <Box display="flex" p={2}></Box>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserRewardList;