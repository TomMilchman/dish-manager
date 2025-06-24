import api from "./axios";

// Fetch all dishes
export const getAllDishes = async () => {
    const res = await api.get("/dishes");
    return res.data;
};

// Add a new dish
export const addDish = async (dishData) => {
    const res = await api.post("/dishes", dishData);
    return res.data;
};

// Update a dish
export const updateDish = async ({ id, updates }) => {
    const res = await api.put(`/dishes/${id}`, updates);
    return res.data;
};

// Delete a dish
export const deleteDish = async (id) => {
    const res = await api.delete(`/dishes/${id}`);
    return res.data;
};
