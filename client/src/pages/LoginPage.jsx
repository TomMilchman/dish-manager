import { useState } from "react";
import axios from "../api/axios";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import { handleSubmit, handleChange } from "../utils/formHandlers";
import useAuthStore from "../store/useAuthStore";

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
            useAuthStore.getState().setUser(data.username);
            useAuthStore.getState().setAccessToken(data.accessToken);
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

    return (
        <div className="login__container">
            <h2>Login</h2>
            <form
                onSubmit={(e) => handleSubmit(e, mutation)}
                className="login__form"
            >
                <input
                    type="text"
                    name="usernameOrEmail"
                    placeholder="Username or email"
                    value={formData.usernameOrEmail}
                    onChange={(e) => handleChange(e, formData, setFormData)}
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => handleChange(e, formData, setFormData)}
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
            <Link to="/forgot-password" className="hover-link">
                Forgot password?
            </Link>
            <p>Or register if you have no account: </p>
            <Link to="/register">
                <button className="other-option__btn">Register</button>
            </Link>
        </div>
    );
}
