import api from "./axios";
import { v4 as uuidv4 } from "uuid";

export const submitActivity = async (data) => {
    const response = await api.post("/activity/submit", data, {
        headers: {
            "Idempotency-Key": uuidv4()
        }
    });
    return response.data;
};

export const getMySubmissions = async () => {
    const response = await api.get("/activities/my");
    return response.data;
};
