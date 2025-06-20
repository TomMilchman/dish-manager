import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                />
                <Route path="/register" element={<RegisterPage />}></Route>
                <Route path="/dashboard" element={<Dashboard />}></Route>
                <Route
                    path="*"
                    element={(() => (
                        <p>Error 404: Page Not Found</p>
                    ))()}
                />
            </Routes>
            <ToastContainer />
        </BrowserRouter>
    );
}

export default App;
