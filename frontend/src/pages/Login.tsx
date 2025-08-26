import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Avatar,
  Link,
} from "@mui/material";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from "../context/AuthProvider";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e = err as any;
      setError(e?.response?.data?.message || "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" className="login-root">
      <Paper elevation={8} sx={{ p: 4, borderRadius: 2 }} className="paper-login">
        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5" align="center">
            Iniciar sesión
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Accede a tu cuenta para gestionar el catálogo
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            fullWidth
            required
            autoComplete="email"
          />
          <TextField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            fullWidth
            required
            autoComplete="current-password"
          />

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2, py: 1.25 }}
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>

          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
            <Link href="#" variant="body2" underline="hover">¿Olvidaste tu contraseña?</Link>
            <Typography variant="caption" color="text.secondary">¿No tienes cuenta? <Link href="#" underline="hover">Contactar admin</Link></Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
