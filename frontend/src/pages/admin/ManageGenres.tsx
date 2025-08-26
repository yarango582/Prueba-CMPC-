import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

export default function ManageGenres() {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5">Géneros</Typography>
      <Box mt={2}>
        <Button component={Link} to="/admin/genres/new" variant="contained">Nuevo género</Button>
      </Box>
      <Box mt={2}>
        <Typography>Listado de géneros (pendiente: tabla y CRUD)</Typography>
      </Box>
    </Box>
  );
}
