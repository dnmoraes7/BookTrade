import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
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
import Carrinho from "./pages/Carrinho";
import Admin from "./pages/Admin/Admin";
import NotFound from "./pages/NotFound/NotFound";
import Explorar from "./pages/Explorar/Explorar";
import { useAuth } from "./contexts/AuthContext";

function PrivateRoute({ children, admin = false }) {
  const { user, authLoading } = useAuth();
  if (authLoading) return <p className="empty-state">Verificando sessão...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

const privatePage = (page) => <PrivateRoute>{page}</PrivateRoute>;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BookProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/explorar" element={<Explorar />} />
              <Route path="/livro/:id" element={<BookDetails />} />
              <Route path="/carrinho" element={<Carrinho />} />
              <Route path="/login" element={<AuthPage mode="login" />} />
              <Route path="/cadastro" element={<AuthPage mode="signup" />} />
              <Route
                path="/recuperar-senha"
                element={<AuthPage mode="recover" />}
              />
              <Route path="/dashboard" element={privatePage(<Dashboard />)} />
              <Route path="/perfil" element={privatePage(<Perfil />)} />
              <Route path="/meus-livros" element={privatePage(<UserBooks />)} />
              <Route path="/livros/novo" element={privatePage(<BookForm />)} />
              <Route path="/livros/:id/editar" element={privatePage(<BookForm />)} />
              <Route path="/trocas" element={privatePage(<Mensagens type="swaps" />)} />
              <Route
                path="/favoritos"
                element={privatePage(<Mensagens type="favorites" />)}
              />
              <Route path="/mensagens" element={privatePage(<Mensagens type="chat" />)} />
              <Route path="/pedidos" element={privatePage(<Mensagens type="orders" />)} />
              <Route path="/admin" element={<PrivateRoute admin><Admin /></PrivateRoute>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BookProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
