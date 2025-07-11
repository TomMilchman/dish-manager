import { get } from "../utils/apiHelper";

export const getAllTagsFromServer = () => get("/api/tags");
export const getColorMapFromServer = () => get("/api/colors");
