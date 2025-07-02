import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import useAuthStore from "../store/useAuthStore";
import { getUserCredentialsFromAccessToken } from "../utils/tokenDecoder";
import LoadingSpinner from "./LoadingSpinner/LoadingSpinner";

export default function ProtectedRoute() {
    const { isLoading, isError } = useAuth();

    useEffect(() => {
        try {
            const { username, role } = getUserCredentialsFromAccessToken();
            useAuthStore.getState().setUsername(username);
            useAuthStore.getState().setRole(role);
        } catch (error) {
            useAuthStore.getState().logout();
        }
    }, []);

    if (isError) {
        return <Navigate to={"/login"} replace />;
    }

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return <Outlet />;
}
