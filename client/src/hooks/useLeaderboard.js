import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";

export const useLeaderboard = () => {
    return useQuery({
        queryKey: ["leaderboard"],
        queryFn: async () => {
            const res = await api.get("/leaderboard");
            return res.data;
        }
    });
};
