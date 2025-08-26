import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

export default function ManageAuthors() {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5">Autores</Typography>
      <Box mt={2}>
        <Button component={Link} to="/admin/authors/new" variant="contained">Nuevo autor</Button>
      </Box>
      <Box mt={2}>
        <Typography>Listado de autores (pendiente: tabla y CRUD)</Typography>
      </Box>
    </Box>
  );
}
