import { toast } from "react-toastify";

export const handleChange = (e, formData, setFormData) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
};

export const handleSubmitWithMatchedPasswords = (
    e,
    formData,
    confirmPassword,
    mutation
) => {
    e.preventDefault();

    if (formData.password !== confirmPassword) {
        toast.error("Passwords don't match.");
    } else {
        mutation.mutate();
    }
};

export const handleSubmit = (e, mutation) => {
    e.preventDefault();
    mutation.mutate();
};
