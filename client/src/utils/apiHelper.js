import api from "../api/axios";

export const get = (url) => api.get(url).then((res) => res.data);
export const post = (url, body) => api.post(url, body).then((res) => res.data);
export const patch = (url, body) =>
    api.patch(url, body).then((res) => res.data);
export const del = (url) => api.delete(url).then((res) => res.data);
