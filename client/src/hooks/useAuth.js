import { useQuery } from "@tanstack/react-query";
import axios from "../api/axios";
import useAuthStore from "../store/useAuthStore";

const checkAuth = async () => {
    try {
        const res = await axios.post("/auth/authenticate-user");
        return res.data;
    } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
            // Try refreshing token
            try {
                const refreshRes = await axios.post("/auth/refresh");

                useAuthStore
                    .getState()
                    .setAccessToken(refreshRes.data.accessToken);
                return { message: "User authentication successful." }; // success — exit without throwing
            } catch (refreshErr) {
                // Refresh failed -> throw to trigger isError
                throw refreshErr;
            }
        }
        // Other errors — throw to trigger isError
        throw err;
    }
};

export const useAuth = () => {
    return useQuery({
        queryKey: ["authUser"],
        queryFn: checkAuth,
        retry: false,
    });
};
