import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

export default function ManageUsers() {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5">Usuarios</Typography>
      <Box mt={2}>
        <Button component={Link} to="/admin/users/new" variant="contained">
          Nuevo usuario
        </Button>
      </Box>
      <Box mt={2}>
        <Typography>Listado de usuarios (pendiente: tabla y CRUD)</Typography>
      </Box>
    </Box>
  );
}
