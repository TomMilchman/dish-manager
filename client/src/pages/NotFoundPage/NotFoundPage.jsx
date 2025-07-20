import "./NotFoundPage.css";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="not-found__container">
            <h1 className="not-found__title">404</h1>
            <p className="not-found__subtitle">Oops! Page Not Found</p>
            <button className="not-found__button" onClick={() => navigate("/")}>
                Go Back Home
            </button>
        </div>
    );
}
