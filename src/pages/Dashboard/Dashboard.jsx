import { useEffect, useState } from "react";
import { BookOpen, Coins, Heart, MessageCircle, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardSidebar from "../../components/DashboardSidebar/DashboardSidebar";
import BookCard from "../../components/BookCard/BookCard";
import { useAuth } from "../../contexts/AuthContext";
import { useBooks } from "../../contexts/BookContext";
import api from "../../services/api";
import "../shared/Mensagens.css";

function Dashboard() {
  const { user } = useAuth();
  const { books, favorites, booksLoading, booksError } = useBooks();
  const [stats, setStats] = useState({ anuncios: 0, trocas_em_andamento: 0, mensagens_nao_lidas: 0 });
  const [statsError, setStatsError] = useState("");
  const myBooks = books.filter((book) => book.ownerId === user?.id_usuario);

  useEffect(() => {
    let current = true;
    api.get("/dashboard/me")
      .then(({ data }) => { if (current) setStats(data); })
      .catch((error) => {
        if (current) setStatsError(error.response?.data?.erro || "Não foi possível carregar os indicadores.");
      });
    return () => { current = false; };
  }, [user?.id_usuario]);

  const cards = [
    [BookOpen, stats.anuncios || 0, "Meus anúncios"],
    [Coins, stats.trocas_em_andamento || 0, "Trocas em andamento"],
    [Heart, favorites.length, "Favoritos salvos nesta conta"],
    [MessageCircle, stats.mensagens_nao_lidas || 0, "Novas mensagens"],
  ];

  return (
    <div className="workspace">
      <DashboardSidebar />
      <section className="workspace-main">
        <div className="workspace-heading">
          <div>
            <span className="section-label">SUA ÁREA</span>
            <h1>Olá, {user?.name?.split(" ")[0]}!</h1>
          </div>
          <Link className="button button--primary" to="/livros/novo">
            <Plus size={17} /> Adicionar livro
          </Link>
        </div>
        {statsError && <p className="form-feedback" role="alert">{statsError}</p>}
        <div className="stat-grid">
          {cards.map(([Icon, value, label]) => (
            <article key={label}>
              <span><Icon size={18} /></span>
              <b>{value}</b>
              <p>{label}</p>
            </article>
          ))}
        </div>
        <section className="dashboard-panels">
          <article className="panel">
            <div className="panel-heading">
              <div><h2>Seus anúncios</h2><p>Divulgações vinculadas a esta conta</p></div>
              <Link to="/meus-livros">Ver todos</Link>
            </div>
            {booksLoading ? <p>Carregando...</p> : myBooks.slice(0, 2).map((book) => (
              <div className="simple-book" key={book.id}>
                <img src={book.image || "/book-placeholder.svg"} alt="" />
                <div><b>{book.title}</b><p>{book.author}</p><span>{book.price == null ? "Sem preço definido" : `R$ ${book.price}`}</span></div>
              </div>
            ))}
            {!booksLoading && !myBooks.length && <p className="empty-state">Nenhum anúncio cadastrado: 0.</p>}
            {booksError && <p className="form-feedback">{booksError}</p>}
          </article>
          <article className="panel">
            <div className="panel-heading">
              <div><h2>Atividade</h2><p>Resumo dos seus dados reais</p></div>
            </div>
            <p>Trocas em andamento: {stats.trocas_em_andamento || 0}</p>
            <p>Mensagens não lidas: {stats.mensagens_nao_lidas || 0}</p>
          </article>
        </section>
        <section className="recommendations">
          <div className="panel-heading">
            <div><h2>Você pode gostar</h2><p>Outras divulgações disponíveis</p></div>
            <Link to="/explorar">Ver mais</Link>
          </div>
          <div className="book-grid">
            {books.filter((book) => book.ownerId !== user?.id_usuario).slice(0, 3)
              .map((book) => <BookCard compact key={book.id} book={book} />)}
          </div>
        </section>
      </section>
    </div>
  );
}

export default Dashboard;
