import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitActivity } from "../api/submissionsApi";

export const useSubmitActivity = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: submitActivity,
        onMutate: async (newSubmission) => {
            // Cancel any outgoing refetches so they don't overwrite our optimistic update
            await queryClient.cancelQueries({ queryKey: ["submissions"] });

            // Snapshot the previous value
            const previous = queryClient.getQueryData(["submissions"]);

            // Optimistically update to the new value
            queryClient.setQueryData(["submissions"], (old = []) => [
                {
                    ...newSubmission,
                    id: Date.now(),
                    status: "pending",
                    optimistic: true
                },
                ...old
            ]);

            // Return a context object with the snapshotted value
            return { previous };
        },
        // If the mutation fails, use the context returned from onMutate to roll back
        onError: (err, newSubmission, context) => {
            queryClient.setQueryData(["submissions"], context.previous);
        },
        // Always refetch after error or success to synchronize with server
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["submissions"] });
        }
    });
};
