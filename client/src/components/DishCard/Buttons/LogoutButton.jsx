import { useMutation } from "@tanstack/react-query";
import { logout } from "../../../api/auth";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/useAuthStore";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner";
import { FaPowerOff } from "react-icons/fa6";

export default function LogoutButton() {
    const navigate = useNavigate();
    const mutation = useMutation({
        mutationFn: logout,
        onSuccess: (data) => {
            toast.success(data.message);
            console.log(data.message);
            navigate("/login");
            useAuthStore.getState().logout();
        },
    });

    return (
        <>
            <button
                className="logout-btn"
                title="Log Out"
                onClick={mutation.mutate}
            >
                <FaPowerOff />
            </button>
            {mutation.isPending && <LoadingSpinner />}
        </>
    );
}
