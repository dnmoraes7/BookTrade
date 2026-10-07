import { Bell, BookOpen, Menu, Search, ShoppingCart, X } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useBooks } from "../../contexts/BookContext";
import api from "../../services/api";
import "./layout.css";

function Header() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id_usuario;
  const { cart } = useBooks();
  const [unread, setUnread] = useState({ userId: null, count: 0 });
  const notifications = unread.userId === userId ? unread.count : 0;

  useEffect(() => {
    if (!userId) return;
    let active = true;
    api.get("/dashboard/me")
      .then(({ data }) => { if (active) setUnread({ userId, count: data.mensagens_nao_lidas || 0 }); })
      .catch(() => { if (active) setUnread({ userId, count: 0 }); });
    return () => { active = false; };
  }, [userId]);

  function submitSearch(event) {
    event.preventDefault();
    navigate(`/explorar?q=${encodeURIComponent(query)}`);
    setOpen(false);
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" to="/">
          <span>
            <BookOpen size={20} />
          </span>
          book<span>trade</span>
        </Link>
        <nav className={open ? "main-nav open" : "main-nav"}>
          <NavLink to="/" onClick={() => setOpen(false)}>Início</NavLink>
          <NavLink to="/explorar" onClick={() => setOpen(false)}>Explorar</NavLink>
          <NavLink to="/trocas" onClick={() => setOpen(false)}>Trocas</NavLink>
        </nav>
        <div className="header-actions">
          <form className="header-search" onSubmit={submitSearch}>
            <Search size={17} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Busque por título ou autor"
            />
          </form>
          <Link className="header-icon" to="/carrinho" aria-label="Carrinho">
            <ShoppingCart size={19} />
            {cart.length > 0 && <i>{cart.length}</i>}
          </Link>
          {user ? (
            <>
              <Link
                className="header-icon"
                to="/mensagens"
                aria-label="Notificações"
              >
                <Bell size={19} />
                {notifications > 0 && <i>{notifications}</i>}
              </Link>
              <Link className="avatar" to="/dashboard">
                {user.name.slice(0, 2).toUpperCase()}
              </Link>
            </>
          ) : (
            <Link className="login-link" to="/login">
              Entrar
            </Link>
          )}
          <button
            className="menu-button"
            onClick={() => setOpen(!open)}
            aria-label="Abrir menu"
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
