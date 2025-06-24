import { useMutation } from "@tanstack/react-query";
import { logout } from "../../api/auth";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import { FaPowerOff } from "react-icons/fa";

export default function LogoutButton() {
    const navigate = useNavigate();
    const mutation = useMutation({
        mutationFn: logout,
        onSuccess: (data) => {
            useAuthStore.getState().setAccessToken(null);
            toast.success(data.message);
            console.log(data.message);
            navigate("/login");
        },
    });

    return (
        <>
            <button
                className="icon-button"
                title="Logout"
                onClick={mutation.mutate}
            >
                <FaPowerOff />
            </button>
            {mutation.isPending && <LoadingSpinner />}
        </>
    );
}
