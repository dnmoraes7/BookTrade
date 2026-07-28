import { BookOpen, Coins, Heart, MessageCircle, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardSidebar from "../../components/DashboardSidebar/DashboardSidebar";
import BookCard from "../../components/BookCard/BookCard";
import { useAuth } from "../../contexts/AuthContext";
import { useBooks } from "../../contexts/BookContext";
import "../shared/Mensagens.css";

function Dashboard() {
  const { user } = useAuth(); const { books, favorites } = useBooks();
  const stats = [[BookOpen, books.length, "Meus livros"], [Coins, 4, "Trocas em andamento"], [Heart, favorites.length, "Favoritos"], [MessageCircle, 3, "Novas mensagens"]];
  return <div className="workspace"><DashboardSidebar /><section className="workspace-main"><div className="workspace-heading"><div><span className="section-label">SUA ÁREA</span><h1>Olá, {user?.name?.split(" ")[0]}! </h1></div><Link className="button button--primary" to="/livros/novo"><Plus size={17} />Adicionar livro</Link></div><div className="stat-grid">{stats.map(([Icon, value, label]) => <article key={label}><span><Icon size={18} /></span><b>{value}</b><p>{label}</p></article>)}</div><section className="dashboard-panels"><article className="panel"><div className="panel-heading"><div><h2>Seus livros</h2><p>Gerencie sua estante</p></div><Link to="/meus-livros">Ver todos</Link></div>{books.slice(0, 2).map((book) => <div className="simple-book" key={book.id}><img src={book.image} alt="" /><div><b>{book.title}</b><p>{book.author}</p><span>Disponível para {book.type.toLowerCase()}</span></div></div>)}</article><article className="panel"><div className="panel-heading"><div><h2>Atividade recente</h2><p>Fique por dentro das novidades</p></div></div>{["Lucas favoritou Torto Arado", "Você recebeu uma nova mensagem", "Proposta de troca enviada"].map((item, index) => <div className="activity" key={item}><MessageCircle size={16} /><div><b>{item}</b><p>Há {index + 1} hora(s)</p></div></div>)}</article></section><section className="recommendations"><div className="panel-heading"><div><h2>Você pode gostar</h2><p>Livros selecionados para você</p></div><Link to="/explorar">Ver mais</Link></div><div className="book-grid">{books.slice(2, 5).map((book) => <BookCard compact key={book.id} book={book} />)}</div></section></section></div>;
}
export default Dashboard;
