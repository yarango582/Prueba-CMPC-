import axios from "./axios";

export interface PublisherPayload {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

export const fetchPublishersAdmin = (params?: Record<string, unknown>) =>
  axios.get("/publishers", { params });
export const fetchPublisher = (id: string) => axios.get(`/publishers/${id}`);
export const createPublisher = (payload: PublisherPayload) =>
  axios.post("/publishers", payload);
export const updatePublisher = (
  id: string,
  payload: Partial<PublisherPayload>
) => axios.patch(`/publishers/${id}`, payload);
export const deletePublisher = (id: string) =>
  axios.delete(`/publishers/${id}`);
