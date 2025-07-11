import { get, post, patch, del } from "../utils/apiHelper";
const DISHES_ENDPOINT = "/api/dishes";

export const getAllDishesFromServer = () => get(DISHES_ENDPOINT);
export const addDishToServer = (dishData) => post(DISHES_ENDPOINT, dishData);
export const updateDishInServer = ({ id, updates }) =>
    patch(`${DISHES_ENDPOINT}/${id}`, updates);
export const toggleIsFavoriteInServer = (id) =>
    patch(`${DISHES_ENDPOINT}/${id}/toggle-favorite`);
export const deleteDishFromServer = (id) => del(`${DISHES_ENDPOINT}/${id}`);
