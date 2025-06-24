import api from "./axios";

// Fetches all ingredients existing in the DB
export const getAllIngredients = async () => {
    const res = await api.get("/ingredients");
    return res.data;
};
