import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import Login from "./pages/Login";
import BooksList from "./pages/BooksList";
import BookDetail from "./pages/BookDetail";
import BookForm from "./pages/BookForm";
import Layout from "./components/Layout";
import AdminMenu from "./components/AdminMenu";
// ManageAuthors placeholder removed in favor of redirect to authors list
import ListPublishers from "./pages/admin/publishers/ListPublishers";
import PublisherForm from "./pages/admin/publishers/PublisherForm";
import ListGenres from "./pages/admin/genres/ListGenres";
import GenreForm from "./pages/admin/genres/GenreForm";
import ListUsers from "./pages/admin/users/ListUsers";
import UserForm from "./pages/admin/users/UserForm";
import ListAuthors from "./pages/admin/authors/ListAuthors";
import AuthorForm from "./pages/admin/authors/AuthorForm";
import { useAuth } from "./context/AuthProvider";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: '#0b72b9', // richer blue
      contrastText: '#fff',
    },
    secondary: {
      main: '#f57c00', // warm accent
      contrastText: '#fff',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          boxShadow: '0 4px 12px rgba(11,114,185,0.18)'
        }
      }
    }
  }
});

export default function App() {
  const { isAuthenticated, user } = useAuth();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            isAuthenticated ? <Layout /> : <Navigate to="/login" replace />
          }
        >
          <Route index element={<BooksList />} />
          <Route path="books/new" element={<BookForm />} />
          <Route path="books/:id" element={<BookDetail />} />
          <Route path="books/:id/edit" element={<BookForm />} />
          <Route
            path="admin"
            element={
              user?.role === "admin" ? (
                <AdminMenu />
              ) : (
                <Navigate to="/" replace />
              )
            }
          >
            <Route index element={<Navigate to="authors" replace />} />
            <Route path="authors" element={<ListAuthors />} />
            <Route path="authors/new" element={<AuthorForm />} />
            <Route path="authors/:id/edit" element={<AuthorForm />} />
            <Route path="publishers" element={<ListPublishers />} />
            <Route path="publishers/new" element={<PublisherForm />} />
            <Route path="publishers/:id/edit" element={<PublisherForm />} />
            <Route path="genres" element={<ListGenres />} />
            <Route path="genres/new" element={<GenreForm />} />
            <Route path="genres/:id/edit" element={<GenreForm />} />
            <Route path="users" element={<ListUsers />} />
            <Route path="users/new" element={<UserForm />} />
            <Route path="users/:id/edit" element={<UserForm />} />
          </Route>
        </Route>
      </Routes>
    </ThemeProvider>
  );
}
