import { useQuery } from "@tanstack/react-query";
import axios from "../api/axios";

const checkAuth = async () => {
    const res = await axios.post("/auth/authenticate-user");
    return res.data;
};

export const useAuth = () => {
    return useQuery({
        queryKey: ["authUser"],
        queryFn: checkAuth,
        retry: false,
    });
};
