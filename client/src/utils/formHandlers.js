import { toast } from "react-toastify";

export const handleChange = (e, formData, setFormData) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
};

export const handleSubmitWithMatchedPasswords = (e, formData, mutation) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords don't match.");
    } else {
        mutation.mutate();
    }
};

export const handleSubmit = (e, mutation) => {
    e.preventDefault();
    mutation.mutate();
};
