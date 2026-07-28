import { Bell, BookOpen, Menu, Search, ShoppingCart, X } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useBooks } from "../../contexts/BookContext";
import "./layout.css";

function Header() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { user, notifications } = useAuth();
  const { cart } = useBooks();

  function submitSearch(event) {
    event.preventDefault();
    navigate(`/explorar?q=${encodeURIComponent(query)}`);
    setOpen(false);
  }

  return <header className="site-header"><div className="header-inner">
    <Link className="brand" to="/"><span><BookOpen size={20} /></span>book<span>trade</span></Link>
    <nav className={open ? "main-nav open" : "main-nav"}>
      <NavLink to="/">Início</NavLink><NavLink to="/explorar">Explorar</NavLink><NavLink to="/trocas">Trocas</NavLink><NavLink to="/marketplace">Marketplace</NavLink><NavLink to="/doacoes">Doações</NavLink>
    </nav>
    <div className="header-actions">
      <form className="header-search" onSubmit={submitSearch}><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busque por título ou autor" /></form>
      <Link className="header-icon" to="/carrinho" aria-label="Carrinho"><ShoppingCart size={19} />{cart.length > 0 && <i>{cart.length}</i>}</Link>
      {user ? <><Link className="header-icon" to="/mensagens" aria-label="Notificações"><Bell size={19} />{notifications > 0 && <i>{notifications}</i>}</Link><Link className="avatar" to="/dashboard">{user.name.slice(0, 2).toUpperCase()}</Link></> : <Link className="login-link" to="/login">Entrar</Link>}
      <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Abrir menu">{open ? <X /> : <Menu />}</button>
    </div>
  </div></header>;
}

export default Header;
