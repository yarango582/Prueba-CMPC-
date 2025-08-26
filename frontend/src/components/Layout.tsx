import React from "react";
import { Outlet, Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Container, Button, Box } from "@mui/material";
import { useAuth } from "../context/AuthProvider";

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div>
      <AppBar position="static" sx={{ background: 'linear-gradient(90deg,#0b72b9 0%, #0a5ea0 100%)' }}>
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ color: "white", textDecoration: "none", flex: 1, fontWeight: 600 }}
          >
            CMPC Libros
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ mr: 1, color: 'rgba(255,255,255,0.9)' }}>
              {user?.first_name} {user?.last_name}
            </Typography>
            {user?.role === "admin" ? (
              <Button variant="contained" color="secondary" component={Link} to="/admin" size="small">
                Admin
              </Button>
            ) : null}
            <Button variant="outlined" color="inherit" onClick={logout} sx={{ borderColor: 'rgba(255,255,255,0.6)', color: 'rgba(255,255,255,0.9)' }}>
              Cerrar sesión
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Outlet />
      </Container>
    </div>
  );
}
