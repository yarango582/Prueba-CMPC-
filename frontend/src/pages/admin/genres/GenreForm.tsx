import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, TextField, Button, Typography } from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { fetchGenre, createGenre, updateGenre } from "../../../api/genres";

type FormValues = {
  name: string;
  description?: string;
};

export default function GenreForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = React.useState<FormValues>({ name: "" });

  useQuery(
    ["genre", id],
    () =>
      id
        ? fetchGenre(id).then((r: unknown) => (r as any).data)
        : Promise.resolve(null),
    {
      enabled: !!id,
      onSuccess: (d: unknown) => {
        const val = d as any;
        if (val)
          setForm({ name: val.name || "", description: val.description || "" });
      },
    }
  );

  const createMut = useMutation((p: FormValues) => createGenre(p), {
    onSuccess: () => qc.invalidateQueries(["genres"]),
  });
  const updateMut = useMutation((p: FormValues) => updateGenre(id!, p), {
    onSuccess: () => qc.invalidateQueries(["genres"]),
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id) await updateMut.mutateAsync(form);
    else await createMut.mutateAsync(form);
    navigate("/admin/genres");
  };

  return (
    <Box sx={{ mt: 2 }} component="form" onSubmit={onSubmit}>
      <Typography variant="h5">
        {id ? "Editar género" : "Nuevo género"}
      </Typography>

      <TextField
        value={form.name}
        onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
        label="Nombre"
        required
        fullWidth
        margin="normal"
      />

      <TextField
        value={form.description || ""}
        onChange={(e) =>
          setForm((s) => ({ ...s, description: e.target.value }))
        }
        label="Descripción"
        multiline
        rows={3}
        fullWidth
        margin="normal"
      />

      <Box mt={2}>
        <Button type="submit" variant="contained">
          Guardar
        </Button>
        <Button sx={{ ml: 1 }} onClick={() => navigate("/admin/genres")}>
          Cancelar
        </Button>
      </Box>
    </Box>
  );
}
