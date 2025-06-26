import api from "./axios";

// Fetch all dishes
export const getAllDishes = async () => {
    const res = await api.get("/api/dishes");
    return res.data;
};

// Add a new dish
export const addDish = async (dishData) => {
    const res = await api.post("/api/dishes", dishData);
    return res.data;
};

// Update a dish
export const updateDish = async ({ id, updates }) => {
    const res = await api.put(`/api/dishes/${id}`, updates);
    return res.data;
};

// Delete a dish
export const deleteDish = async (id) => {
    const res = await api.delete(`/api/dishes/${id}`);
    return res.data;
};
