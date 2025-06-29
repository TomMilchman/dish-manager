import { useState } from "react";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import { handleSubmit, handleChange } from "../../utils/formHandlers";
import useAuthStore from "../../store/useAuthStore";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { loginUser } from "../../api/auth";

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
            useAuthStore.getState().setUser(data.username);
            useAuthStore.getState().setAccessToken(data.accessToken);
            toast.success("Login successful!");
            console.log("User login successful!");
            navigate("/");
        },
    });

    return (
        <div className="login__container">
            <h2>Login</h2>
            <form
                onSubmit={(e) => handleSubmit(e, loginUserMutation, formData)}
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

                <button type="submit" disabled={loginUserMutation.isPending}>
                    {loginUserMutation.isPending ? "Logging in..." : "Login"}
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
    );
}
