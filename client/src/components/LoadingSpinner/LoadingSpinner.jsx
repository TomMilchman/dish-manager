import "./LoadingSpinner.css";

export default function LoadingSpinner() {
    return (
        <div
            className="spinner-container"
            role="status"
            aria-live="polite"
            aria-label="Loading"
        >
            <div className="spinner"></div>
        </div>
    );
}
