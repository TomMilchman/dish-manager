import api from "./axios";

// Fetches all ingredients existing in the DB
export const getAllIngredientsFromServer = async () => {
    const res = await api.get("/api/ingredients");
    return res.data;
};

export const getAllTagsFromServer = async () => {
    const res = await api.get("/api/tags");
    return res.data;
};
