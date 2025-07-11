import { get, post, patch } from "../utils/apiHelper";
const INGREDIENTS_ENDPOINT = "/api/ingredients";

export const getAllIngredientsFromServer = () => get(INGREDIENTS_ENDPOINT);
export const addIngredientToServer = (ingData) =>
    post(INGREDIENTS_ENDPOINT, ingData);
export const updateIngredientInServer = ({ id, updates }) =>
    patch(`${INGREDIENTS_ENDPOINT}/${id}`, updates);
