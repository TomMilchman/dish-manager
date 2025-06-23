import { useState } from "react";
import axios from "../api/axios";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import { handleSubmitWithMatchedPasswords } from "../utils/formHandlers";
import { handleChange } from "../utils/formHandlers";
import useAuthStore from "../store/useAuthStore";

export default function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        rememberMe: false,
    });

    const [confirmPassword, setConfirmPassword] = useState("");

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await axios.post("/auth/register", formData);
            return res.data;
        },
        onSuccess: (data) => {
            useAuthStore.getState().setUser(data.username);
            useAuthStore.getState().setAccessToken(data.accessToken);
            toast.success("Registration successful!");
            console.log("User registration successful!");
            navigate("/");
        },
        onError: (error) => {
            toast.error(
                "Registration failed: " + error.response?.data?.message ||
                    error.message
            );
        },
    });

    return (
        <div className="register__container">
            <h2>Register</h2>
            <form
                onSubmit={(e) =>
                    handleSubmitWithMatchedPasswords(
                        e,
                        formData,
                        confirmPassword,
                        mutation
                    )
                }
                className="register__form"
            >
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={(e) => handleChange(e, formData, setFormData)}
                    required
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
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
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    {mutation.isLoading ? "Registering..." : "Register"}
                </button>
            </form>
            <p>Or log in instead: </p>
            <Link to="/login">
                <button className="other-option__btn">Login</button>
            </Link>
        </div>
    );
}
