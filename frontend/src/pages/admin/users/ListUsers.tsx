import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { fetchUsers, deleteUser } from "../../../api/users";
import { normalizeListResponse } from "../../../utils/response";

export default function ListUsers() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery(["users"], () =>
    fetchUsers().then((r: unknown) => (r as any).data)
  );

  const deleteMut = useMutation((id: string) => deleteUser(id), {
    onSuccess: () => qc.invalidateQueries(["users"]),
  });

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const onDelete = (id: string) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedId) return;
    await deleteMut.mutateAsync(selectedId);
    setConfirmOpen(false);
    setSelectedId(null);
  };

  const items = normalizeListResponse<{
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    role?: string;
  }>(data);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5">Usuarios</Typography>
      <Box mt={2} mb={2}>
        <Button variant="contained" component={Link} to="/admin/users/new">
          Nuevo usuario
        </Button>
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4}>Cargando...</TableCell>
              </TableRow>
            ) : (
              items.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{`${u.first_name || ""} ${
                    u.last_name || ""
                  }`}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/admin/users/${u.id}/edit`)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => onDelete(u.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>¿Eliminar este usuario?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
