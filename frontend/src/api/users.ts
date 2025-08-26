import axios from "./axios";

export interface UserPayload {
  email: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  role?: "admin" | "manager" | "user";
}

export const fetchUsers = (params?: Record<string, unknown>) =>
  axios.get("/users", { params });
export const fetchUser = (id: string) => axios.get(`/users/${id}`);
export const createUser = (payload: UserPayload) =>
  axios.post("/users", payload);
export const updateUser = (id: string, payload: Partial<UserPayload>) =>
  axios.patch(`/users/${id}`, payload);
export const deleteUser = (id: string) => axios.delete(`/users/${id}`);
