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
import { fetchPublishersAdmin, deletePublisher } from "../../../api/publishers";
import { normalizeListResponse } from "../../../utils/response";

export default function ListPublishers() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery(["publishers"], () =>
    fetchPublishersAdmin().then((r: unknown) => (r as any).data)
  );

  const deleteMut = useMutation((id: string) => deletePublisher(id), {
    onSuccess: () => qc.invalidateQueries(["publishers"]),
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
    email?: string;
  }>(data);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5">Editoriales</Typography>
      <Box mt={2} mb={2}>
        <Button variant="contained" component={Link} to="/admin/publishers/new">
          Nueva editorial
        </Button>
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Contacto</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3}>Cargando...</TableCell>
              </TableRow>
            ) : (
              items.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/admin/publishers/${p.id}/edit`)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => onDelete(p.id)}>
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
        <DialogContent>¿Eliminar esta editorial?</DialogContent>
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
