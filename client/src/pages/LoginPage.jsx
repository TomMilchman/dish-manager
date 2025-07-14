import "./AuthPages.css";

import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { loginUser } from "../api/auth";
import useAuthStore from "../store/useAuthStore";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";
import { handleSubmit, handleFormChange } from "../utils/formHandlers";

export default function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        usernameOrEmail: "",
        password: "",
        rememberMe: false,
    });

    const loginUserMutation = useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            useAuthStore.getState().setAccessToken(data.accessToken);
            toast.success("Login successful!");
            console.log("User login successful!");
            navigate("/");
        },
    });

    return (
        <div className="auth-page">
            <div className="auth-form__container">
                <h2>Login</h2>
                <form
                    onSubmit={(e) =>
                        handleSubmit(e, loginUserMutation, formData)
                    }
                >
                    <input
                        type="text"
                        name="usernameOrEmail"
                        id="username-email-container"
                        placeholder="Username or email"
                        value={formData.usernameOrEmail}
                        onChange={(e) =>
                            handleFormChange(e, formData, setFormData)
                        }
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        id="password-container"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) =>
                            handleFormChange(e, formData, setFormData)
                        }
                        required
                    />
                    <div>
                        <input
                            type="checkbox"
                            name="rememberMe"
                            id="rememberMe"
                            onChange={(e) =>
                                handleFormChange(e, formData, setFormData)
                            }
                            value={formData.rememberMe}
                        />
                        <label htmlFor="rememberMe">Remember Me</label>
                    </div>

                    <button
                        type="submit"
                        disabled={loginUserMutation.isPending}
                    >
                        {loginUserMutation.isPending
                            ? "Logging in..."
                            : "Login"}
                    </button>
                    {loginUserMutation.isPending && <LoadingSpinner />}
                </form>
                <Link to="/forgot-password" className="hover-link">
                    Forgot password?
                </Link>
                <p>Or register if you have no account: </p>
                <Link to="/register">
                    <button className="other-option__btn">Register</button>
                </Link>
            </div>
        </div>
    );
}
