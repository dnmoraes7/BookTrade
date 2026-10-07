import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useBooks } from "../../contexts/BookContext";
import DashboardSidebar from "../../components/DashboardSidebar/DashboardSidebar";
import "../shared/Mensagens.css";

function Admin() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const { books, booksLoading } = useBooks();

  useEffect(() => {
    let active = true;
    api.get("/dashboard/admin")
      .then(({ data }) => { if (active) setStats(data); })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.erro || "Não foi possível carregar os dados administrativos.");
      });
    return () => { active = false; };
  }, []);

  const cards = [
    ["Usuários ativos", stats?.usuarios_ativos ?? 0],
    ["Anúncios ativos", stats?.anuncios_ativos ?? 0],
    ["Trocas neste mês", stats?.trocas_no_mes ?? 0],
    ["Vendas concluídas neste mês", `R$ ${Number(stats?.vendas_concluidas_no_mes || 0).toFixed(2)}`],
  ];

  return (
    <div className="workspace">
      <DashboardSidebar />
      <section className="workspace-main">
        <div className="workspace-heading">
          <div><span className="section-label">ADMINISTRAÇÃO</span><h1>Painel administrativo</h1></div>
        </div>
        {error && <p className="form-feedback" role="alert">{error}</p>}
        <div className="stat-grid">
          {cards.map(([label, value]) => <article key={label}><b>{value}</b><p>{label}</p></article>)}
        </div>
        <section className="panel">
          <div className="panel-heading"><div><h2>Anúncios recentes</h2><p>Dados carregados da API</p></div><Link to="/explorar">Ver anúncios</Link></div>
          {booksLoading ? <p>Carregando...</p> : books.slice(0, 5).map((book) => (
            <div className="simple-book" key={book.id}>
              <img src={book.image || "/book-placeholder.svg"} alt="" />
              <div><b>{book.title}</b><p>{book.author} · {book.owner}</p><span>{book.price == null ? "Sem preço definido" : `R$ ${book.price}`}</span></div>
            </div>
          ))}
          {!booksLoading && books.length === 0 && <p className="empty-state">Nenhum anúncio encontrado.</p>}
        </section>
      </section>
    </div>
  );
}

export default Admin;
