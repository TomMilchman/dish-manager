import api from "./axios";

// Fetch all dishes
export const getAllDishesFromServer = async () => {
    const res = await api.get("/api/dishes");
    return res.data;
};

// Add a new dish
export const addDishToServer = async (dishData) => {
    const res = await api.post("/api/dishes", dishData);
    return res.data;
};

// Update a dish
export const updateDishInServer = async ({ id, updates }) => {
    const res = await api.put(`/api/dishes/${id}`, updates);
    return res.data;
};

// Delete a dish
export const deleteDishFromServer = async (id) => {
    const res = await api.delete(`/api/dishes/${id}`);
    return res.data;
};
