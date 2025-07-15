import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPassword from "./pages/ForgotPasswordPage";
import ResetPassword from "./pages/ResetPasswordPage";
import Dashboard from "./pages/Dashboard/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />}></Route>
                <Route path="/register" element={<RegisterPage />}></Route>
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Dashboard />} />
                </Route>
                <Route
                    path="/forgot-password"
                    element={<ForgotPassword />}
                ></Route>
                <Route
                    path="/reset-password"
                    element={<ResetPassword />}
                ></Route>
                <Route
                    path="*"
                    element={(() => (
                        <p>Error 404: Page Not Found</p>
                    ))()}
                />
            </Routes>
            <ToastContainer toastClassName={"custom-toast"} />
        </BrowserRouter>
    );
}

export default App;
