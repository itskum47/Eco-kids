import React from "react";
import { useSubmitActivity } from "../../hooks/useSubmissions";

export default function SubmitActivity() {
    const mutation = useSubmitActivity();

    const handleSubmit = () => {
        mutation.mutate({
            activityType: "tree",
            description: "Planted a tree"
        });
    };

    return (
        <button onClick={handleSubmit}>
            Submit Activity
        </button>
    );
}
