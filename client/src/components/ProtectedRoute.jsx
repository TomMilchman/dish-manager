import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
    const { isLoading, isError } = useAuth();

    if (isError) {
        return <Navigate to={"/login"} replace />;
    }

    if (isLoading) {
        return <p>Loading...</p>;
    }

    return children;
}
