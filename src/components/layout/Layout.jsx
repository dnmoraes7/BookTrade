import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const privateRoutes = ["/dashboard", "/perfil", "/meus-livros", "/trocas", "/favoritos", "/mensagens", "/pedidos", "/admin", "/livros/"];

function Layout() {
  const { pathname } = useLocation();
  const isAuth = ["/login", "/cadastro", "/recuperar-senha"].includes(pathname);
  const isPrivate = privateRoutes.some((route) => pathname.startsWith(route));

  if (isAuth) return <Outlet />;
  return <><Header /><main className={isPrivate ? "app-content" : ""}><Outlet /></main>{!isPrivate && <Footer />}</>;
}

export default Layout;
