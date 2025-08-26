import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, TextField, Button, Typography, MenuItem } from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { fetchUser, createUser, updateUser } from "../../../api/users";

type FormValues = {
  email: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  role?: "admin" | "manager" | "user";
};

export default function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = React.useState<FormValues>({ email: "" });

  useQuery(
    ["user", id],
    () =>
      id
        ? fetchUser(id).then((r: unknown) => (r as any).data)
        : Promise.resolve(null),
    {
      enabled: !!id,
      onSuccess: (d: unknown) => {
        const val = d as any;
        if (val)
          setForm({
            email: val.email || "",
            first_name: val.first_name || "",
            last_name: val.last_name || "",
            role: val.role || "user",
          });
      },
    }
  );

  const createMut = useMutation((p: FormValues) => createUser(p), {
    onSuccess: () => qc.invalidateQueries(["users"]),
  });
  const updateMut = useMutation((p: FormValues) => updateUser(id!, p), {
    onSuccess: () => qc.invalidateQueries(["users"]),
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id) await updateMut.mutateAsync(form);
    else await createMut.mutateAsync(form);
    navigate("/admin/users");
  };

  return (
    <Box sx={{ mt: 2 }} component="form" onSubmit={onSubmit}>
      <Typography variant="h5">
        {id ? "Editar usuario" : "Nuevo usuario"}
      </Typography>

      <TextField
        value={form.email}
        onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
        label="Email"
        required
        fullWidth
        margin="normal"
      />

      {!id && (
        <TextField
          value={form.password || ""}
          onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
          label="Password"
          type="password"
          required
          fullWidth
          margin="normal"
        />
      )}

      <TextField
        value={form.first_name || ""}
        onChange={(e) => setForm((s) => ({ ...s, first_name: e.target.value }))}
        label="Nombre"
        fullWidth
        margin="normal"
      />

      <TextField
        value={form.last_name || ""}
        onChange={(e) => setForm((s) => ({ ...s, last_name: e.target.value }))}
        label="Apellido"
        fullWidth
        margin="normal"
      />

      <TextField
        select
        label="Rol"
        value={form.role || "user"}
        onChange={(e) =>
          setForm((s) => ({ ...s, role: e.target.value as any }))
        }
        fullWidth
        margin="normal"
      >
        <MenuItem value="admin">Admin</MenuItem>
        <MenuItem value="manager">Manager</MenuItem>
        <MenuItem value="user">User</MenuItem>
      </TextField>

      <Box mt={2}>
        <Button type="submit" variant="contained">
          Guardar
        </Button>
        <Button sx={{ ml: 1 }} onClick={() => navigate("/admin/users")}>
          Cancelar
        </Button>
      </Box>
    </Box>
  );
}
