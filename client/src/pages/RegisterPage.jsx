import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { registerUser } from "../api/auth";
import useAuthStore from "../store/useAuthStore";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";
import {
    handleFormChange,
    handleSubmitWithMatchedPasswords,
} from "../utils/formHandlers";

export default function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        rememberMe: false,
    });

    const [confirmPassword, setConfirmPassword] = useState("");

    const registerUserMutation = useMutation({
        mutationFn: registerUser,
        onSuccess: (data) => {
            useAuthStore.getState().setAccessToken(data.accessToken);
            toast.success("Registration successful!");
            console.log("User registration successful!");
            navigate("/");
        },
    });

    return (
        <div className="auth-page">
            <div className="auth-form__container">
                <h2>Register</h2>
                <form
                    onSubmit={(e) =>
                        handleSubmitWithMatchedPasswords(
                            e,
                            formData,
                            confirmPassword,
                            registerUserMutation
                        )
                    }
                >
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={(e) =>
                            handleFormChange(e, formData, setFormData)
                        }
                        required
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) =>
                            handleFormChange(e, formData, setFormData)
                        }
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) =>
                            handleFormChange(e, formData, setFormData)
                        }
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
                        disabled={registerUserMutation.isPending}
                    >
                        {registerUserMutation.isPending
                            ? "Registering..."
                            : "Register"}
                    </button>
                    {registerUserMutation.isPending && <LoadingSpinner />}
                </form>
                <p>Or log in instead: </p>
                <Link to="/login">
                    <button className="other-option__btn">Login</button>
                </Link>
            </div>
        </div>
    );
}
