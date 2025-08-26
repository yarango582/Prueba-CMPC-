import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, TextField, Button, Typography } from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { fetchAuthor, createAuthor, updateAuthor } from "../../../api/authors";

type FormValues = {
  first_name: string;
  last_name: string;
  biography?: string;
  birth_date?: string;
  nationality?: string;
};

export default function AuthorForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = React.useState<FormValues>({
    first_name: "",
    last_name: "",
  });

  useQuery(
    ["author", id],
    // response envelope may vary coming from backend
    () =>
      id
        ? fetchAuthor(id).then(
            (r: unknown) => (r as unknown as { data?: unknown }).data
          )
        : Promise.resolve(null),
    {
      enabled: !!id,
      onSuccess: (d: unknown) => {
        const val = d as unknown as {
          first_name?: string;
          last_name?: string;
          biography?: string;
          birth_date?: string;
          nationality?: string;
        };
        if (val)
          setForm({
            first_name: val.first_name || "",
            last_name: val.last_name || "",
            biography: val.biography || "",
            birth_date: val.birth_date || "",
            nationality: val.nationality || "",
          });
      },
    }
  );

  const createMut = useMutation(
    (payload: FormValues) => createAuthor(payload),
    { onSuccess: () => qc.invalidateQueries(["authors"]) }
  );
  const updateMut = useMutation(
    (payload: FormValues) => updateAuthor(id!, payload),
    { onSuccess: () => qc.invalidateQueries(["authors"]) }
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      await updateMut.mutateAsync(form);
    } else {
      await createMut.mutateAsync(form);
    }
    navigate("/admin/authors");
  };

  return (
    <Box sx={{ mt: 2 }} component="form" onSubmit={onSubmit}>
      <Typography variant="h5">
        {id ? "Editar autor" : "Nuevo autor"}
      </Typography>

      <TextField
        value={form.first_name}
        onChange={(e) => setForm((s) => ({ ...s, first_name: e.target.value }))}
        label="Nombre"
        required
        fullWidth
        margin="normal"
      />

      <TextField
        value={form.last_name}
        onChange={(e) => setForm((s) => ({ ...s, last_name: e.target.value }))}
        label="Apellido"
        required
        fullWidth
        margin="normal"
      />

      <TextField
        value={form.nationality || ""}
        onChange={(e) =>
          setForm((s) => ({ ...s, nationality: e.target.value }))
        }
        label="Nacionalidad"
        fullWidth
        margin="normal"
      />

      <TextField
        value={form.birth_date || ""}
        onChange={(e) => setForm((s) => ({ ...s, birth_date: e.target.value }))}
        label="Fecha de nacimiento"
        type="date"
        InputLabelProps={{ shrink: true }}
        fullWidth
        margin="normal"
      />

      <TextField
        value={form.biography || ""}
        onChange={(e) => setForm((s) => ({ ...s, biography: e.target.value }))}
        label="Biografía"
        multiline
        rows={4}
        fullWidth
        margin="normal"
      />

      <Box mt={2}>
        <Button type="submit" variant="contained">
          Guardar
        </Button>
        <Button sx={{ ml: 1 }} onClick={() => navigate("/admin/authors")}>
          Cancelar
        </Button>
      </Box>
    </Box>
  );
}
