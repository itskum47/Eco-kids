import { useEffect, useState, useRef } from "react";
import socket from "../services/socket";
import { useQueryClient } from "@tanstack/react-query";

export default function useRealtimePoints() {
    const queryClient = useQueryClient();
    const [toastData, setToastData] = useState(null);
    const [rollbackToast, setRollbackToast] = useState(false);

    // Track points for reconciliation rollback detection
    const { data: userData } = useQueryClient().getQueryData(["me"]) || {};
    const user = userData?.user || userData?.data || userData;
    const currentPoints = user?.gamification?.ecoPoints ?? 0;

    // Need a ref to store prev to compare
    const prevPointsRef = useRef(currentPoints);

    useEffect(() => {
        // Detect silent point reduction (rollback)
        if (prevPointsRef.current !== 0 && currentPoints < prevPointsRef.current) {
            setRollbackToast(true);
            setTimeout(() => setRollbackToast(false), 4000); // Auto-dismiss
        }
        prevPointsRef.current = currentPoints;
    }, [currentPoints]);

    useEffect(() => {
        const seenEvents = new Set(); // Prevent duplicate events

        const handlePointsEarned = (data) => {
            // Assuming data contains a unique notificationId, or we use a timestamp if not
            const eventId = data.notificationId || Date.now() + Math.random();

            if (seenEvents.has(eventId)) return;
            seenEvents.add(eventId);



            // Optimistically update the UI cache instantly (0ms latency perception)
            const ecoPointsToAdd = data.points || 50;
            if (data.points) {
                queryClient.setQueryData(["me"], (old) => {
                    if (!old) return old;
                    let updatedUser = old.user || old.data || old;
                    return {
                        ...old,
                        user: {
                            ...updatedUser,
                            gamification: {
                                ...updatedUser.gamification,
                                ecoPoints: (updatedUser.gamification?.ecoPoints || 0) + ecoPointsToAdd
                            }
                        }
                    };
                });
            }

            // Immediately ask the server for identical truth to reconcile cache
            queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
            queryClient.invalidateQueries({ queryKey: ["me"] });
            queryClient.invalidateQueries({ queryKey: ["activityFeed"] });

            // Trigger toast animation
            setToastData(data);

            // Auto-hide toast after 4 seconds
            setTimeout(() => {
                setToastData(null);
            }, 4000);
        };

        socket.on("points-earned", handlePointsEarned);

        return () => {
            socket.off("points-earned", handlePointsEarned);
        };
    }, [queryClient]);

    return { toastData, rollbackToast };
}
