import React from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Paper,
} from "@mui/material";
import { Link, Outlet, useLocation } from "react-router-dom";

export default function AdminMenu() {
  const location = useLocation();
  const isActive = (path: string) =>
    location.pathname === `/admin/${path}` || location.pathname.startsWith(`/admin/${path}/`);

  return (
    <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
      <Paper sx={{ width: 240, p: 2 }} elevation={1}>
        <Typography variant="h6" gutterBottom>
          Administración
        </Typography>
        <List>
          <ListItemButton component={Link} to="authors" selected={isActive("authors")}>
            <ListItemText primary="Autores" />
          </ListItemButton>
          <ListItemButton component={Link} to="publishers" selected={isActive("publishers")}>
            <ListItemText primary="Editoriales" />
          </ListItemButton>
          <ListItemButton component={Link} to="genres" selected={isActive("genres")}>
            <ListItemText primary="Géneros" />
          </ListItemButton>
          <ListItemButton component={Link} to="users" selected={isActive("users")}>
            <ListItemText primary="Usuarios" />
          </ListItemButton>
        </List>
      </Paper>

      <Box sx={{ flex: 1 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
