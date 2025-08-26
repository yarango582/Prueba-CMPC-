import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
} from "@mui/material";
import {
  createBook,
  fetchBook,
  updateBook,
  uploadBookImage,
} from "../api/books";
import { fetchAuthors, fetchPublishers, fetchGenres } from "../api/lookups";
import { normalizeListResponse } from "../utils/response";
import { BookPayload } from "../api/books";
import { useQuery } from "react-query";
import { useAuth } from "../context/AuthProvider";

export default function BookForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [isbn, setIsbn] = useState<string>("");
  const [pages, setPages] = useState<number | "">("");
  const [publicationDate, setPublicationDate] = useState<string>("");
  const [language, setLanguage] = useState<string>("Español");
  const [description, setDescription] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [stockQuantity, setStockQuantity] = useState<number | "">(0);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [authorId, setAuthorId] = useState<string | "">("");
  const [publisherId, setPublisherId] = useState<string | "">("");
  const [genreId, setGenreId] = useState<string | "">("");
  const [genreIds, setGenreIds] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      fetchBook(id).then((r) => {
        const b = r.data?.data || r.data || r;
        setTitle(b.title || "");
        setPrice(b.price || "");
        setAuthorId(b.author_id || b.author?.id || "");
        setPublisherId(b.publisher_id || b.publisher?.id || "");
        setGenreId(b.genre_id || b.genre?.id || "");
        setIsbn(b.isbn || "");
        setPages(b.pages || "");
        setPublicationDate(b.publication_date || "");
        setLanguage(b.language || "Español");
        setDescription(b.description || "");
        setSummary(b.summary || "");
        setStockQuantity(b.stock_quantity ?? 0);
        setIsAvailable(b.is_available ?? true);
        // handle genre arrays
        if (Array.isArray(b.genre_ids) && b.genre_ids.length) {
          setGenreIds(b.genre_ids);
          setGenreId(b.genre_ids[0]);
        } else if (b.genre_id) {
          setGenreId(b.genre_id);
          setGenreIds(b.genre_id ? [b.genre_id] : []);
        }
      });
    }
  }, [id]);

  const { data: authorsResp } = useQuery("authors", fetchAuthors);
  const { data: publishersResp } = useQuery("publishers", fetchPublishers);
  const { data: genresResp } = useQuery("genres", fetchGenres);

  // Use centralized normalizer that understands different API envelopes

  type GenericItem = {
    id: string;
    first_name?: string;
    name?: string;
    email?: string;
  };
  // authorsResp / publishersResp / genresResp are axios responses; pass them to the
  // normalizer which will extract arrays from common envelopes.
  const authorsList: GenericItem[] = normalizeListResponse<GenericItem>(
    // prefer the axios response data if present
    (authorsResp as any)?.data ?? authorsResp
  );
  const publishersList: GenericItem[] = normalizeListResponse<GenericItem>(
    (publishersResp as any)?.data ?? publishersResp
  );
  const genresList: GenericItem[] = normalizeListResponse<GenericItem>(
    (genresResp as any)?.data ?? genresResp
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // resolve ids (accept either string ids or objects with `id`)
    const resolveId = (v: any) => (typeof v === "string" && v ? v : v && v.id ? v.id : undefined);
    const resolvedAuthor = resolveId(authorId);
    const resolvedPublisher = resolveId(publisherId);
    // genres can be multiple; normalize to array of ids
    const resolvedGenreIds = (genreIds && genreIds.length
      ? genreIds.map((g: any) => resolveId(g) || g).filter(Boolean)
      : genreId
      ? [resolveId(genreId) || genreId]
      : []
    ).filter(Boolean);

    const hasGenre = resolvedGenreIds.length > 0;
    if (!resolvedAuthor || !resolvedPublisher || !hasGenre) {
      // debug info to help trace why validation failed in runtime
      // eslint-disable-next-line no-console
      console.debug("Validation failed for book relations", {
        authorId,
        publisherId,
        genreId,
        genreIds,
        resolvedAuthor,
        resolvedPublisher,
        resolvedGenreIds,
      });
      alert("Author, publisher y género son obligatorios");
      return;
    }

    const payload: BookPayload = {
      title,
      price: Number(price),
      author_id: resolvedAuthor,
      publisher_id: resolvedPublisher,
      // prefer sending multiple genre ids if selected
      ...( (genreIds && genreIds.length)
        ? { genre_ids: resolvedGenreIds }
        : genreId
        ? { genre_id: resolvedGenreIds[0] }
        : {} ),
      isbn: isbn || undefined,
      pages: pages ? Number(pages) : undefined,
      language,
      description: description || undefined,
      summary: summary || undefined,
      stock_quantity: stockQuantity ? Number(stockQuantity) : 0,
      is_available: isAvailable,
      publication_date: publicationDate || undefined,
    };
    try {
      if (id) {
        await updateBook(id, payload);
        if (imageFile) await uploadBookImage(id, imageFile);
      } else {
        const resp = await createBook(payload);
        const newId = resp.data?.id || resp.data?.data?.id;
        if (imageFile) await uploadBookImage(newId, imageFile);
      }
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  // restrict UI if not admin
  if (user?.role !== "admin") {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5" mb={2}>
          {id ? "Editar libro" : "Nuevo libro"}
        </Typography>
        <Typography color="error">
          Acceso denegado: sólo administradores pueden crear o editar libros.
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" mb={2}>
        {id ? "Editar libro" : "Nuevo libro"}
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="Precio"
          value={price}
          onChange={(e) =>
            setPrice(e.target.value === "" ? "" : Number(e.target.value))
          }
          type="number"
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="ISBN"
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Box display="flex" gap={2}>
          <TextField
            label="Páginas"
            value={pages}
            onChange={(e) =>
              setPages(e.target.value === "" ? "" : Number(e.target.value))
            }
            type="number"
            margin="normal"
            sx={{ flex: 1 }}
          />
          <TextField
            label="Fecha publicación"
            type="date"
            value={publicationDate}
            onChange={(e) => setPublicationDate(e.target.value)}
            margin="normal"
            sx={{ flex: 1 }}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
        <FormControl fullWidth margin="normal" required>
          <InputLabel id="author-label">Autor</InputLabel>
          <Select
            labelId="author-label"
            value={authorId}
            label="Autor"
            onChange={(e) => setAuthorId(e.target.value as string)}
          >
            <MenuItem value="">Seleccione</MenuItem>
            {authorsList.map((a) => (
              <MenuItem key={a.id} value={a.id}>
                {a.first_name || a.name || a.email}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal" required>
          <InputLabel id="publisher-label">Editorial</InputLabel>
          <Select
            labelId="publisher-label"
            value={publisherId}
            label="Editorial"
            onChange={(e) => setPublisherId(e.target.value as string)}
          >
            <MenuItem value="">Seleccione</MenuItem>
            {publishersList.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal" required>
          <InputLabel id="genre-label">Género</InputLabel>
          <Select
            labelId="genre-label"
            value={genreIds.length ? genreIds : genreId ? [genreId] : []}
            multiple
            label="Género"
            onChange={(e) => setGenreIds(e.target.value as string[])}
            renderValue={(selected) =>
              (selected as string[])
                .map((s) => genresList.find((g) => g.id === s)?.name)
                .filter(Boolean)
                .join(", ")
            }
          >
            {genresList.map((g) => (
              <MenuItem key={g.id} value={g.id}>
                {g.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Idioma"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          fullWidth
          margin="normal"
        />

        <TextField
          label="Resumen breve"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          rows={2}
        />

        <TextField
          label="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          rows={4}
        />

        <Box mt={1} display="flex" alignItems="center" gap={2}>
          <Button variant="outlined" component="label">
            Subir imagen
            <input
              hidden
              accept="image/*"
              type="file"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </Button>
          {imageFile && (
            <Avatar
              variant="rounded"
              src={URL.createObjectURL(imageFile)}
              alt={title || "Imagen seleccionada"}
              sx={{ width: 80, height: 80 }}
            />
          )}
        </Box>
        <Box mt={2} display="flex" gap={2} alignItems="center">
          <TextField
            label="Stock"
            type="number"
            value={stockQuantity}
            onChange={(e) =>
              setStockQuantity(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            sx={{ width: 140 }}
          />
          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel id="available-label">Disponible</InputLabel>
            <Select
              labelId="available-label"
              value={isAvailable ? "1" : "0"}
              label="Disponible"
              onChange={(e) => setIsAvailable(e.target.value === "1")}
            >
              <MenuItem value={"1"}>Sí</MenuItem>
              <MenuItem value={"0"}>No</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box mt={2}>
          <Button type="submit" variant="contained">
            Guardar
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
