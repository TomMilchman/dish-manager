import "./DashboardPage.css";
import TopBar from "../../components/TopBar/TopBar";

function Dashboard() {
    return (
        <div className="dashboard">
            <TopBar />
            <div className="main-content">
                <div className="dish-panel"></div>
                <div className="summary-panel"></div>
            </div>
        </div>
    );
}

export default Dashboard;
