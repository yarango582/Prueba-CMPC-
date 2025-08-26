import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, TextField, Button, Typography } from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  fetchPublisher,
  createPublisher,
  updatePublisher,
} from "../../../api/publishers";

type FormValues = {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
};

export default function PublisherForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = React.useState<FormValues>({ name: "" });

  useQuery(
    ["publisher", id],
    () =>
      id
        ? fetchPublisher(id).then((r: unknown) => (r as any).data)
        : Promise.resolve(null),
    {
      enabled: !!id,
      onSuccess: (d: unknown) => {
        const val = d as any;
        if (val)
          setForm({
            name: val.name || "",
            address: val.address || "",
            phone: val.phone || "",
            email: val.email || "",
          });
      },
    }
  );

  const createMut = useMutation((p: FormValues) => createPublisher(p), {
    onSuccess: () => qc.invalidateQueries(["publishers"]),
  });
  const updateMut = useMutation((p: FormValues) => updatePublisher(id!, p), {
    onSuccess: () => qc.invalidateQueries(["publishers"]),
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id) await updateMut.mutateAsync(form);
    else await createMut.mutateAsync(form);
    navigate("/admin/publishers");
  };

  return (
    <Box sx={{ mt: 2 }} component="form" onSubmit={onSubmit}>
      <Typography variant="h5">
        {id ? "Editar editorial" : "Nueva editorial"}
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
        value={form.email || ""}
        onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
        label="Email"
        fullWidth
        margin="normal"
      />

      <TextField
        value={form.phone || ""}
        onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
        label="Teléfono"
        fullWidth
        margin="normal"
      />

      <TextField
        value={form.address || ""}
        onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))}
        label="Dirección"
        fullWidth
        margin="normal"
      />

      <Box mt={2}>
        <Button type="submit" variant="contained">
          Guardar
        </Button>
        <Button sx={{ ml: 1 }} onClick={() => navigate("/admin/publishers")}>
          Cancelar
        </Button>
      </Box>
    </Box>
  );
}
