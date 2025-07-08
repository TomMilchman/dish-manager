import api from "./axios";

export const getAllTagsFromServer = async () => {
    const res = await api.get("/api/tags");
    return res.data;
};

export const getColorMapFromServer = async () => {
    const res = await api.get("/api/colors");
    return res.data;
};
