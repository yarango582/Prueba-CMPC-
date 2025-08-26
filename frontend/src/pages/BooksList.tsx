import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { fetchBooks } from "../api/books";
import { fetchGenres, fetchAuthors, fetchPublishers } from "../api/lookups";
import { normalizeListResponse } from "../utils/response";
import { useSearchParams, type URLSearchParamsInit } from "react-router-dom";
import type { BookFilters } from "../api/books";
import {
  Container,
  Typography,
  Box,
  TextField,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
// small internal debounce to avoid adding a new dependency
function useDebounce(cb: (v: string) => void, delay = 300) {
  const timer = React.useRef<number | null>(null);
  return React.useCallback(
    (val: string) => {
      if (timer.current) window.clearTimeout(timer.current);
      // window.setTimeout returns number in browser
      timer.current = window.setTimeout(
        () => cb(val),
        delay
      ) as unknown as number;
    },
    [cb, delay]
  );
}

export default function BooksList() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [authorId, setAuthorId] = useState<string | "">("");
  const [publisherId, setPublisherId] = useState<string | "">("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  // Debounce search input (internal implementation)
  const debounced = useDebounce((val: string) => setDebouncedSearch(val), 300);
  useEffect(() => {
    debounced(search);
  }, [search, debounced]);

  type IdName = {
    id: string;
    name?: string;
    first_name?: string;
    last_name?: string;
  };

  const params = {
    search: debouncedSearch || undefined,
    page,
    limit,
    genres:
      selectedGenres && selectedGenres.length ? selectedGenres : undefined,
    authors: authorId ? [authorId] : undefined,
    publishers: publisherId ? [publisherId] : undefined,
    is_available: onlyAvailable ? true : undefined,
  } as BookFilters;

  // top-level queries (fetch* already returns normalized arrays)
  const { data: genresResp } = useQuery("genres", fetchGenres);

  const { data: authorsResp } = useQuery("authors", fetchAuthors);
  const { data: publishersResp } = useQuery("publishers", fetchPublishers);

  const { data, isLoading, refetch } = useQuery(
    ["books", params],
    () => fetchBooks(params).then((r) => r.data),
    {
      keepPreviousData: true,
    }
  );

  // When component mounts, fetch first page
  useEffect(() => {
    // initialize filters from URL
    const q = searchParams.get("q") || "";
    // handle both `genres` and `genres[]` query key styles
    const genres =
      [...searchParams.getAll("genres"), ...searchParams.getAll("genres[]")] ||
      [];
    const author =
      searchParams.get("author") || searchParams.get("authors") || "";
    const publisher =
      searchParams.get("publisher") || searchParams.get("publishers") || "";
    const available = searchParams.get("available");
    const p = parseInt(searchParams.get("page") || "1", 10) || 1;
    setSearch(q);
    setSelectedGenres(genres as string[]);
    setAuthorId(author);
    setPublisherId(publisher);
    setOnlyAvailable(available === "1" || available === "true");
    setPage(p);
  }, []);

  // Auto-apply: sync filters to URL and refetch whenever any filter changes,
  // but skip the first render because we initialize state from URL.
  const mountedRef = React.useRef(true);
  useEffect(() => {
    if (mountedRef.current) {
      mountedRef.current = false;
      return;
    }

    // build URLSearchParams manually to ensure array keys are repeated as `genres=` (no brackets)
    const sp = new URLSearchParams();
    if (debouncedSearch) sp.set("q", String(debouncedSearch));
    if (selectedGenres && selectedGenres.length) {
      selectedGenres.forEach((g) => sp.append("genres", g));
    }
    if (authorId) sp.set("author", String(authorId));
    if (publisherId) sp.set("publisher", String(publisherId));
    if (onlyAvailable) sp.set("available", "1");
    sp.set("page", String(page || 1));

    setSearchParams(sp);
    refetch();
  }, [
    debouncedSearch,
    page,
    selectedGenres,
    authorId,
    publisherId,
    onlyAvailable,
  ]);

  // normalize books payload (handle envelope or direct)
  const raw = data ?? {};
  const payload = raw.data ?? raw;
  let books: Array<Record<string, unknown>> = [];
  if (Array.isArray(payload)) books = payload;
  else if (Array.isArray(payload?.books)) books = payload.books;
  else if (Array.isArray(payload?.items)) books = payload.items;
  else if (Array.isArray(payload?.results)) books = payload.results;
  else books = [];

  const pagination = payload?.pagination ??
    payload?.meta ?? { total: 0, page: 1, pages: 1 };

  // normalize lookup lists using the shared util
  const genresList: IdName[] = normalizeListResponse<IdName>(genresResp);
  const authorsList: IdName[] = normalizeListResponse<IdName>(authorsResp);
  const publishersList: IdName[] =
    normalizeListResponse<IdName>(publishersResp);

  const PlaceholderImage = () => (
    <Box
      sx={{
        height: 180,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f0f0f0",
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        overflow: "hidden",
      }}
    >
      <svg
        width="90"
        height="90"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <rect width="24" height="24" rx="2" fill="#e0e0e0" />
        <path
          d="M4 15l4-5 3 4 5-7 4 7"
          stroke="#bdbdbd"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  );

  const booksAny = books as any[];

  return (
    <Container sx={{ mt: 8 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Box sx={{ position: "sticky", top: 80 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6">Filtros</Typography>
              {/* Nuevo libro only for admin users */}
              {user?.role === "admin" ? (
                <Button
                  component={Link}
                  to="/books/new"
                  variant="contained"
                  size="small"
                  className="new-book-btn"
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: 2,
                    px: 2,
                    py: 0.6,
                    display: { xs: "block", md: "inline-flex" },
                    width: { xs: "100%", md: "auto" },
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ marginRight: 8, fontSize: 16 }}>+</span> Nuevo
                  libro
                </Button>
              ) : null}
            </Box>

            <Box mb={2}>
              <TextField
                fullWidth
                placeholder="Buscar título, autor o ISBN"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Box>

            <FormControl fullWidth margin="normal" size="small">
              <InputLabel id="genres-multi-label">Géneros</InputLabel>
              <Select
                labelId="genres-multi-label"
                multiple
                value={selectedGenres}
                onChange={(e) =>
                  setSelectedGenres(
                    typeof e.target.value === "string"
                      ? e.target.value.split(",")
                      : (e.target.value as string[])
                  )
                }
                renderValue={(selected) =>
                  (selected as string[])
                    .map((s) => genresList.find((g) => g.id === s)?.name)
                    .filter(Boolean)
                    .join(", ")
                }
              >
                {genresList.map((g) => (
                  <MenuItem key={g.id} value={g.id}>
                    <Checkbox checked={selectedGenres.indexOf(g.id) > -1} />
                    {g.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" size="small">
              <InputLabel id="author-label">Autor</InputLabel>
              <Select
                labelId="author-label"
                value={authorId}
                label="Autor"
                onChange={(e) => setAuthorId(e.target.value as string)}
              >
                <MenuItem value="">Todos</MenuItem>
                {authorsList.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.first_name || a.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" size="small">
              <InputLabel id="publisher-label">Editorial</InputLabel>
              <Select
                labelId="publisher-label"
                value={publisherId}
                label="Editorial"
                onChange={(e) => setPublisherId(e.target.value as string)}
              >
                <MenuItem value="">Todas</MenuItem>
                {publishersList.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                />
              }
              label="Disponible"
            />

            <Box mt={2} display="flex" gap={1}>
              <Button
                variant="outlined"
                onClick={() => {
                  setSelectedGenres([]);
                  setAuthorId("");
                  setPublisherId("");
                  setOnlyAvailable(false);
                  setSearch("");
                  setPage(1);
                  setSearchParams(new URLSearchParams());
                  refetch();
                }}
              >
                Limpiar
              </Button>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={9}>
          <Grid container spacing={4}>
            {isLoading ? (
              <Typography>Loading...</Typography>
            ) : (
              booksAny.map((b: any) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={b.id}>
                  <Card
                    className="book-card"
                    sx={{
                      cursor: "pointer",
                      borderRadius: 2,
                      boxShadow: 2,
                      overflow: "hidden",
                    }}
                    component={Link}
                    to={`/books/${b.id}`}
                  >
                    {b.image_url ? (
                      <CardMedia
                        component="img"
                        height="180"
                        image={b.image_url}
                        alt={b.title || "Portada"}
                        sx={{ objectFit: "cover", borderRadius: "6px" }}
                      />
                    ) : (
                      <PlaceholderImage />
                    )}
                    <CardContent>
                      <Typography
                        variant="subtitle1"
                        noWrap
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
                        {b.title}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.3,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          {b.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Autor:{" "}
                          <strong style={{ color: "rgba(0,0,0,0.8)" }}>
                            {b.author
                              ? `${b.author.first_name || ""} ${
                                  b.author.last_name || ""
                                }`
                              : "Desconocido"}
                          </strong>
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Editorial:{" "}
                          <strong style={{ color: "rgba(0,0,0,0.8)" }}>
                            {b.publisher?.name || "Desconocida"}
                          </strong>
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>

          <Box mt={4} display="flex" justifyContent="center">
            <Pagination
              count={pagination.pages}
              page={pagination.page}
              onChange={(_, p) => setPage(p)}
            />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
