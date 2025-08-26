import axios from "./axios";

function getAuthHeader() {
	try {
		const raw = localStorage.getItem("cmpc_auth");
		if (!raw) return undefined;
		const parsed = JSON.parse(raw);
		const payload = parsed && parsed.access_token ? parsed : parsed.data || parsed;
		const token = payload.access_token || payload.accessToken || payload.token;
		return token ? { Authorization: `Bearer ${token}` } : undefined;
	} catch (e) {
		return undefined;
	}
}

export const fetchGenres = () =>
	axios
		.get("/genres", { headers: getAuthHeader() })
		.then((r) => r.data?.data?.genres ?? r.data?.genres ?? r.data ?? []);
export const fetchAuthors = () =>
	axios
		.get("/authors", { headers: getAuthHeader() })
		.then((r) => r.data?.data?.authors ?? r.data?.authors ?? r.data ?? []);
export const fetchPublishers = () =>
	axios
		.get("/publishers", { headers: getAuthHeader() })
		.then((r) => r.data?.data?.publishers ?? r.data?.publishers ?? r.data ?? []);
