import { useState } from "react";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    handleSubmitWithMatchedPasswords,
    handleChange,
} from "../../utils/formHandlers";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { resetPassword } from "../../api/auth";

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
        mutationFn: resetPassword,
        onSuccess: (data) => {
            toast.success(data.message);
            console.log(data.message);
            navigate("/login");
        },
    });

    return (
        <div className="reset-password__container">
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
                className="reset-password__form"
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

                <button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? "Submitting..." : "Submit"}
                </button>
                {mutation.isPending && <LoadingSpinner />}
            </form>
        </div>
    );
}
