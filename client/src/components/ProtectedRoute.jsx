import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import useAuthStore from "../store/useAuthStore";
import LoadingSpinner from "./LoadingSpinner/LoadingSpinner";

export default function ProtectedRoute() {
    const setAuth = useAuthStore((state) => state.setAuth);
    const { isLoading, isError } = useAuth();

    useEffect(() => {
        setAuth();
    }, [setAuth]);

    if (isLoading) return <LoadingSpinner />;
    if (isError) return <Navigate to="/login" replace />;

    return <Outlet />;
}
