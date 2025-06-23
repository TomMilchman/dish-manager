import { useMutation } from "@tanstack/react-query";
import axios from "../api/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import LoadingSpinner from "./LoadingSpinner";

export default function LogoutButton() {
    const navigate = useNavigate();
    const mutation = useMutation({
        mutationFn: async () => {
            const res = await axios.post("/auth/logout");
            return res.data;
        },
        onSuccess: (data) => {
            useAuthStore.getState().setAccessToken(null);
            toast.success(data.message);
            console.log(data.message);
            navigate("/login");
        },
        onError: (error) => {
            toast.error(
                "Logout failed: " + error.response?.data?.message ||
                    error.message
            );
        },
    });

    return (
        <>
            <button onClick={mutation.mutate}>Logout</button>
            {mutation.isPending && <LoadingSpinner />}
        </>
    );
}
