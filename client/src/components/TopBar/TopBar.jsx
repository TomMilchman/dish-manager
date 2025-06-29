// Styling
import "./TopBar.css";

// External Dependencies
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FaPowerOff } from "react-icons/fa6";

// State Management
import useAuthStore from "../../store/useAuthStore";

// Components
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

// API
import { logout } from "../../api/auth";

export default function TopBar() {
    const navigate = useNavigate();

    const logoutMutation = useMutation({
        mutationFn: logout,
        onSuccess: (data) => {
            toast.success(data.message);
            console.log(data.message);
            navigate("/login");
            useAuthStore.getState().logout();
        },
    });

    return (
        <div className="top-bar__container">
            <div className="top-bar__logo-container">
                <img
                    className="top-bar__logo-image"
                    src="/DishManager.png"
                    alt="Logo"
                />
                <h1 className="top-bar__title">DISH MANAGER</h1>
            </div>
            <div className="top-bar__buttons-container">
                <button
                    onClick={logoutMutation.mutate}
                    className="dashboard-btn logout-btn"
                    title="Log Out"
                >
                    <FaPowerOff />
                </button>
            </div>
            {logoutMutation.isPending && <LoadingSpinner />}
        </div>
    );
}
