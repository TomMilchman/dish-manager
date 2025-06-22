import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute() {
    const { isLoading, isError } = useAuth();

    if (isError) {
        return <Navigate to={"/login"} replace />;
    }

    if (isLoading) {
        return <p>Loading...</p>;
    }

    return <Outlet />;
}
