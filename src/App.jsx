import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { BookProvider } from "./contexts/BookContext";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home/Home";
import AuthPage from "./pages/Auth/AuthPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import Perfil from "./pages/Perfil/Perfil";
import BookDetails from "./pages/Books/BookDetails";
import BookForm from "./pages/Books/BookForm";
import UserBooks from "./pages/Books/UserBooks";
import Mensagens from "./pages/Mensagens/Mensagens";
import Marketplace from "./pages/Marketplace/Marketplace";
import Admin from "./pages/Admin/Admin";
import NotFound from "./pages/NotFound/NotFound";
import Explorar from "./pages/Explorar/Explorar";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BookProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/explorar" element={<Explorar />} />
              <Route path="/marketplace" element={<Explorar mode="Venda" />} />
              <Route path="/doacoes" element={<Explorar mode="Doação" />} />
              <Route path="/livro/:id" element={<BookDetails />} />
              <Route path="/carrinho" element={<Marketplace />} />
              <Route path="/login" element={<AuthPage mode="login" />} />
              <Route path="/cadastro" element={<AuthPage mode="signup" />} />
              <Route path="/recuperar-senha" element={<AuthPage mode="recover" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/meus-livros" element={<UserBooks />} />
              <Route path="/livros/novo" element={<BookForm />} />
              <Route path="/livros/:id/editar" element={<BookForm />} />
              <Route path="/trocas" element={<Mensagens type="swaps" />} />
              <Route path="/favoritos" element={<Mensagens type="favorites" />} />
              <Route path="/mensagens" element={<Mensagens type="chat" />} />
              <Route path="/pedidos" element={<Mensagens type="orders" />} />
              <Route path="/admin" element={<Admin />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BookProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
