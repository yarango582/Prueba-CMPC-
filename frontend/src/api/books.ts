import axios from "./axios";

export interface BookFilters {
  search?: string;
  genres?: string[];
  authors?: string[];
  publishers?: string[];
  is_available?: boolean;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
}

export const fetchBooks = (filters: BookFilters) => {
  // Build query string using URLSearchParams to ensure arrays are serialized as repeated keys
  const usp = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (Array.isArray(v)) {
        v.forEach((item) => usp.append(k, String(item)));
      } else {
        usp.set(k, String(v));
      }
    });
  }
  const url = usp.toString() ? `/books?${usp.toString()}` : "/books";
  return axios.get(url);
};

export const fetchBook = (id: string) => axios.get(`/books/${id}`);
export interface BookPayload {
  title: string;
  price: number;
  author_id: string;
  publisher_id: string;
  genre_id?: string;
  // additional fields supported by backend
  genre_ids?: string[];
  isbn?: string;
  pages?: number;
  language?: string;
  description?: string;
  summary?: string;
  image_url?: string;
  stock_quantity?: number;
  is_available?: boolean;
  publication_date?: string; // ISO date
}

export const createBook = (payload: BookPayload) => axios.post("/books", payload);
export const updateBook = (id: string, payload: Partial<BookPayload>) =>
  axios.patch(`/books/${id}`, payload);
export const deleteBook = (id: string) => axios.delete(`/books/${id}`);
export const uploadBookImage = (id: string, file: File) => {
  const form = new FormData();
  form.append("image", file);
  return axios.post(`/books/${id}/upload-image`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
