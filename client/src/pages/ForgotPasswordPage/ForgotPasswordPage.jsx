import { useState } from "react";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { handleSubmit } from "../../utils/formHandlers";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { forgotUserPassword } from "../../api/auth";

export default function ForgotPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");

    const forgotUserPasswordMutation = useMutation({
        mutationFn: forgotUserPassword,
        onSuccess: (data) => {
            toast.success(data.message);
            console.log(data.message);
            navigate("/login");
        },
    });

    return (
        <div className="forgot-password__container">
            <h2>Forgot Password</h2>
            <p>
                Insert your email so that we can send you a password reset link
            </p>
            <form
                onSubmit={(e) =>
                    handleSubmit(e, forgotUserPasswordMutation, { email })
                }
                className="forgot-password__form"
            >
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                    }}
                    required
                />
                <button
                    type="submit"
                    disabled={forgotUserPasswordMutation.isPending}
                >
                    {forgotUserPasswordMutation.isPending
                        ? "Submitting..."
                        : "Submit"}
                </button>
                {forgotUserPasswordMutation.isPending && <LoadingSpinner />}
            </form>
            <Link to="/login" className="hover-link">
                Return to login page
            </Link>
        </div>
    );
}
