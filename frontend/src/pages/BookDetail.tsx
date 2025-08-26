import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { useQuery } from 'react-query';
import { fetchBook } from '../api/books';
import { Container, Typography, Box, Button, CardMedia } from '@mui/material';

export default function BookDetail() {
  const { id } = useParams();
  const { data, isLoading } = useQuery(['book', id], () => fetchBook(id!).then((r) => r.data), { enabled: !!id });
  const { user } = useAuth();
  const raw = data ?? {};
  const book = raw.data ?? raw;

  if (isLoading) return <Container>Loading...</Container>;
  if (!book) return <Container>No encontrado</Container>;

  return (
    <Container sx={{ mt: 4 }}>
      <Box display="flex" gap={3}>
        {(book.image_url) ? (
          <CardMedia component="img" sx={{ width: 240, borderRadius: 2 }} image={book.image_url} alt={book.title || 'Portada'} />
        ) : (
          <Box sx={{ width: 240 }}>
            <Box sx={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0f0f0' }}>No image</Box>
          </Box>
        )}
        <Box>
          <Typography variant="h4">{book.title}</Typography>
          <Typography variant="subtitle1">{book.author?.first_name} {book.author?.last_name}</Typography>
          <Typography sx={{ mt: 2 }}>{book.description}</Typography>
          <Typography sx={{ mt: 1 }}><strong>ISBN:</strong> {book.isbn}</Typography>
          <Typography><strong>Precio:</strong> {book.price}</Typography>
          <Typography><strong>Editorial:</strong> {book.publisher?.name}</Typography>
          <Typography><strong>Páginas:</strong> {book.pages ?? 'N/A'}</Typography>
          <Typography><strong>Idioma:</strong> {book.language ?? 'N/A'}</Typography>
          <Typography><strong>Stock:</strong> {book.stock_quantity ?? 0}</Typography>
          <Typography><strong>Disponibilidad:</strong> {book.is_available ? 'Sí' : 'No'}</Typography>
          <Box mt={2}>
            {user?.role === 'admin' ? (
              <Button component={Link} to={`/books/${book.id}/edit`} variant="contained">Editar</Button>
            ) : null}
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
