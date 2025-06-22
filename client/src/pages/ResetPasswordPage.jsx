import { useState } from "react";
import axios from "../api/axios";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { handleSubmitWithMatchedPasswords } from "../utils/formHandlers";
import { handleChange } from "../utils/formHandlers";

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [formData, setFormData] = useState({
        email: searchParams.get("email"),
        resetToken: searchParams.get("resetToken"),
        newPassword: "",
        confirmPassword: "",
    });

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
        <div className="reset-password__container">
            <h2>Reset Password</h2>
            <p>
                Please insert your new password. If the link you are using is
                valid, your password will be reset and you will be redirected to
                the login page.
            </p>
            <form
                onSubmit={(e) =>
                    handleSubmitWithMatchedPasswords(e, formData, mutation)
                }
                className="reset-password__form"
            >
                <input
                    type="password"
                    name="newPassword"
                    placeholder="New Password"
                    value={formData.newPassword}
                    onChange={(e) => handleChange(e, formData, setFormData)}
                    required
                />
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange(e, formData, setFormData)}
                    required
                />

                <button type="submit" disabled={mutation.isLoading}>
                    {mutation.isLoading ? "Submitting..." : "Submit"}
                </button>
            </form>
        </div>
    );
}
