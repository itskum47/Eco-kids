import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";

export const useUser = () => {
    return useQuery({
        queryKey: ["me"],
        queryFn: async () => {
            const res = await api.get("/auth/me");
            return res.data;
        },
        // Auto refresh every 1 minute to keep streaks and points live
        refetchInterval: 60000
    });
};
