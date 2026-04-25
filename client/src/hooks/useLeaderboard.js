import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";

export const useLeaderboard = ({ scope = "global" } = {}) => {
    return useQuery({
        queryKey: ["leaderboard", scope],
        queryFn: async () => {
            const endpoint = scope === "global"
                ? "/api/v1/leaderboards/global"
                : `/api/v1/leaderboards/${scope}`;

            const res = await api.get(endpoint);
            const payload = res.data || {};

            return {
                ...payload,
                leaderboard: payload.leaderboard || payload.data || [],
            };
        }
    });
};
