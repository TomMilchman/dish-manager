import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "./LoadingSpinner/LoadingSpinner";

export default function ProtectedRoute() {
    const { isLoading, isError } = useAuth();

    if (isError) {
        return <Navigate to={"/login"} replace />;
    }

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return <Outlet />;
}
