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
import { fetchGenresAdmin, deleteGenre } from "../../../api/genres";
import { normalizeListResponse } from "../../../utils/response";

export default function ListGenres() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery(["genres"], () =>
    fetchGenresAdmin().then((r: unknown) => (r as any).data)
  );

  const deleteMut = useMutation((id: string) => deleteGenre(id), {
    onSuccess: () => qc.invalidateQueries(["genres"]),
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
    name: string;
    description?: string;
  }>(data);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5">Géneros</Typography>
      <Box mt={2} mb={2}>
        <Button variant="contained" component={Link} to="/admin/genres/new">
          Nuevo género
        </Button>
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3}>Cargando...</TableCell>
              </TableRow>
            ) : (
              items.map((g) => (
                <TableRow key={g.id}>
                  <TableCell>{g.name}</TableCell>
                  <TableCell>{g.description}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/admin/genres/${g.id}/edit`)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => onDelete(g.id)}>
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
        <DialogContent>¿Eliminar este género?</DialogContent>
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
