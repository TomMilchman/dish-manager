import { useState } from "react";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    handleSubmitWithMatchedPasswords,
    handleFormChange,
} from "../utils/formHandlers";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";
import { resetPassword } from "../api/auth";

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [formData, setFormData] = useState({
        email: searchParams.get("email"),
        resetToken: searchParams.get("resetToken"),
        password: "",
    });

    const [confirmPassword, setConfirmPassword] = useState("");

    const resetPasswordMutation = useMutation({
        mutationFn: resetPassword,
        onSuccess: (data) => {
            toast.success(data.message);
            console.log(data.message);
            navigate("/login");
        },
    });

    return (
        <div className="auth-page">
            <div className="auth-form__container">
                <h2>Reset Password</h2>
                <p>
                    Please insert your new password. If the link you are using
                    is valid, your password will be reset and you will be
                    redirected to the login page.
                </p>
                <form
                    onSubmit={(e) =>
                        handleSubmitWithMatchedPasswords(
                            e,
                            formData,
                            confirmPassword,
                            resetPasswordMutation
                        )
                    }
                >
                    <input
                        type="password"
                        name="password"
                        placeholder="New Password"
                        value={formData.password}
                        onChange={(e) =>
                            handleFormChange(e, formData, setFormData)
                        }
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

                    <button
                        type="submit"
                        disabled={resetPasswordMutation.isPending}
                    >
                        {resetPasswordMutation.isPending
                            ? "Submitting..."
                            : "Submit"}
                    </button>
                    {resetPasswordMutation.isPending && <LoadingSpinner />}
                </form>
            </div>
        </div>
    );
}
