import axios from "./axios";

export interface AuthorPayload {
  first_name: string;
  last_name?: string;
  biography?: string;
}

export const fetchAuthorsAdmin = (params?: Record<string, unknown>) =>
  axios.get("/authors", { params });
export const fetchAuthor = (id: string) => axios.get(`/authors/${id}`);
export const createAuthor = (payload: AuthorPayload) =>
  axios.post("/authors", payload);
export const updateAuthor = (id: string, payload: Partial<AuthorPayload>) =>
  axios.patch(`/authors/${id}`, payload);
export const deleteAuthor = (id: string) => axios.delete(`/authors/${id}`);
