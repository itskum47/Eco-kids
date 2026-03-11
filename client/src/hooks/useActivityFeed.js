import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";

export const useActivityFeed = () => {
    return useQuery({
        queryKey: ["activityFeed"],
        queryFn: async () => {
            const res = await api.get("/feed");
            return res.data;
        },
        // Auto refresh every 30 seconds for live social proof
        refetchInterval: 30000
    });
};
