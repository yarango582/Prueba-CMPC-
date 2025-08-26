import axios from "./axios";

export interface GenrePayload {
  name: string;
  description?: string;
}

export const fetchGenresAdmin = (params?: Record<string, unknown>) =>
  axios.get("/genres", { params });
export const fetchGenre = (id: string) => axios.get(`/genres/${id}`);
export const createGenre = (payload: GenrePayload) =>
  axios.post("/genres", payload);
export const updateGenre = (id: string, payload: Partial<GenrePayload>) =>
  axios.patch(`/genres/${id}`, payload);
export const deleteGenre = (id: string) => axios.delete(`/genres/${id}`);
