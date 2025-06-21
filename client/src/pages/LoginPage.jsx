import { useState } from "react";
import axios from "../api/axios";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        usernameOrEmail: "",
        password: "",
        rememberMe: false,
    });

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await axios.post("/auth/login", formData);
            return res.data;
        },
        onSuccess: (data) => {
            localStorage.setItem("accessToken", data.accessToken);
            toast.success("Login successful!");
            console.log("User login successful!");
            navigate("/");
        },
        onError: (error) => {
            toast.error(
                "Login failed: " + error.response?.data?.message ||
                    error.message
            );
        },
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate();
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit} className="login-form">
                <input
                    type="text"
                    name="usernameOrEmail"
                    placeholder="Username or email"
                    value={formData.usernameOrEmail}
                    onChange={handleChange}
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <input
                    type="checkbox"
                    name="rememberMe"
                    id="rememberMe"
                    value={formData.rememberMe}
                />
                <label htmlFor="rememberMe">Remember Me</label>

                <button type="submit" disabled={mutation.isLoading}>
                    {mutation.isLoading ? "Logging in..." : "Login"}
                </button>
            </form>
            <p>Or register if you have no account: </p>
            <Link to="/register">
                <button className="other-option-btn">Register</button>
            </Link>
        </div>
    );
}
