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
import { fetchAuthorsAdmin, deleteAuthor } from "../../../api/authors";
import { normalizeListResponse } from "../../../utils/response";

export default function ListAuthors() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery(["authors"], () =>
    fetchAuthorsAdmin().then((r: unknown) => (r as { data?: unknown }).data)
  );

  const deleteMut = useMutation((id: string) => deleteAuthor(id), {
    onSuccess: () => qc.invalidateQueries(["authors"]),
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

  // normalize response into a guaranteed array to avoid runtime errors
  const items = normalizeListResponse<{
    id: string;
    first_name: string;
    last_name?: string;
    nationality?: string;
  }>(data);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5">Autores</Typography>
      <Box mt={2} mb={2}>
        <Button variant="contained" component={Link} to="/admin/authors/new">
          Nuevo autor
        </Button>
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Apellido</TableCell>
              <TableCell> Nacionalidad </TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4}>Cargando...</TableCell>
              </TableRow>
            ) : (
              items.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.first_name}</TableCell>
                  <TableCell>{a.last_name}</TableCell>
                  <TableCell>{a.nationality}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/admin/authors/${a.id}/edit`)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => onDelete(a.id)}>
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
        <DialogContent>
          ¿Eliminar este autor? Esta acción es irreversible.
        </DialogContent>
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
