import axios from "axios";
import useAuthStore from "../store/useAuthStore";

const api = axios.create({
    baseURL: "http://localhost:5000",
    withCredentials: true,
});

// Set token on every request if it exists
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;
