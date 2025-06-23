import { useState } from "react";
import axios from "../api/axios";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    handleSubmitWithMatchedPasswords,
    handleChange,
} from "../utils/formHandlers";

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [formData, setFormData] = useState({
        email: searchParams.get("email"),
        resetToken: searchParams.get("resetToken"),
        password: "",
    });

    const [confirmPassword, setConfirmPassword] = useState("");

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await axios.post("/auth/reset-password", formData);
            return res.data;
        },
        onSuccess: (data) => {
            toast.success(data.message);
            console.log(data.message);
            navigate("/login");
        },
        onError: (error) => {
            toast.error(
                "Error resetting password: " + error.response?.data?.message ||
                    error.message
            );
        },
    });

    return (
        <div className="reset-password-container">
            <h2>Reset Password</h2>
            <p>
                Please insert your new password. If the link you are using is
                valid, your password will be reset and you will be redirected to
                the login page.
            </p>
            <form
                onSubmit={(e) =>
                    handleSubmitWithMatchedPasswords(
                        e,
                        formData,
                        confirmPassword,
                        mutation
                    )
                }
                className="reset-password-form"
            >
                <input
                    type="password"
                    name="password"
                    placeholder="New Password"
                    value={formData.password}
                    onChange={(e) => handleChange(e, formData, setFormData)}
                    required
                />
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />

                <button type="submit" disabled={mutation.isLoading}>
                    {mutation.isLoading ? "Submitting..." : "Submit"}
                </button>
            </form>
        </div>
    );
}
