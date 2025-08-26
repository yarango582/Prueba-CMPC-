import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

export default function ManagePublishers() {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5">Editoriales</Typography>
      <Box mt={2}>
        <Button component={Link} to="/admin/publishers/new" variant="contained">Nueva editorial</Button>
      </Box>
      <Box mt={2}>
        <Typography>Listado de editoriales (pendiente: tabla y CRUD)</Typography>
      </Box>
    </Box>
  );
}
