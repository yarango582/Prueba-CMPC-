// Utilities to normalize varying API response envelopes into arrays
export function normalizeListResponse<T>(data: unknown): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as T[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = data as any;

  // Common envelope keys and nested arrays (e.g. { data: { publishers: [...] } })
  const keys = ["authors", "publishers", "genres", "users", "items", "results", "rows", "data", "payload"];
  for (const k of keys) {
    const v = d?.[k];
    if (Array.isArray(v)) return v as T[];
    if (v && typeof v === "object") {
      // return any array found inside the nested object (covers data.publishers etc.)
      for (const val of Object.values(v)) {
        if (Array.isArray(val)) return val as T[];
      }
    }
  }

  // If object with numeric keys, convert to array
  if (typeof d === "object" && d !== null) {
    const numericKeys = Object.keys(d).filter((k) => /^\d+$/.test(k));
    if (numericKeys.length) {
      return numericKeys.map((k) => d[k]) as T[];
    }
  }

  return [];
}
