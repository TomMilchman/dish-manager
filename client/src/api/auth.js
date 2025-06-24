import axios from "./axios";

export const loginUser = async (formData) => {
    const res = await axios.post("/auth/login", formData);
    return res.data;
};

export const registerUser = async (formData) => {
    const res = await axios.post("/auth/register", formData);
    return res.data;
};

export const forgotUserPassword = async (formData) => {
    const res = await axios.post("/auth/forgot-password", formData);
    return res.data;
};

export const resetPassword = async (formData) => {
    const res = await axios.post("/auth/reset-password", formData);
    return res.data;
};
