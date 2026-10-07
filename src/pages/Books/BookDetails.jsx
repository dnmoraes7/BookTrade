import {
  ArrowLeft,
  Heart,
  MapPin,
  MessageCircle,
  ShoppingCart,
  ShieldCheck,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useBooks } from "../../contexts/BookContext";
import api from "../../services/api";
import "./BookDetails.css";

function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { books, addToCart, favorites, toggleFavorite, booksLoading, booksError } = useBooks();
  const book = books.find((item) => item.id === id);
  const myBooks = books.filter((item) => item.ownerId === user?.id_usuario);
  const [offeredBookId, setOfferedBookId] = useState("");
  const [tradeError, setTradeError] = useState("");
  const [proposingTrade, setProposingTrade] = useState(false);

  if (booksLoading) return <p className="empty-state">Carregando divulgação...</p>;
  if (booksError) return <p className="empty-state">{booksError}</p>;
  if (!book) return <p className="empty-state">Divulgação não encontrada.</p>;

  const favorite = favorites.includes(book.id);
  const hasPrice = book.price !== null && book.price !== undefined;
  const price = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(book.price || 0);
  const owner = book.owner || "Usuário";
  const isOwnAnnouncement = book.ownerId === user?.id_usuario;

  async function proposeTrade() {
    setTradeError("");
    if (!offeredBookId) {
      setTradeError("Selecione um livro seu para oferecer.");
      return;
    }
    setProposingTrade(true);
    try {
      const { data: trade } = await api.post("/trocas", {
        id_divulgacao: book.divulgacaoId,
        id_livro_oferecido: Number(offeredBookId),
      });
      await api.post("/mensagens", {
        conteudo: `Olá! Tenho interesse em trocar por ${book.title}.`,
        id_destinatario: book.ownerId,
        id_troca: trade.id_troca,
      });
      navigate("/trocas");
    } catch (requestError) {
      setTradeError(requestError.response?.data?.erro || "Não foi possível enviar a proposta.");
    } finally {
      setProposingTrade(false);
    }
  }

  return (
    <section className="details-page">
      <Link to="/explorar" className="back-link">
        <ArrowLeft size={16} /> Voltar às divulgações
      </Link>
      <div className="details-layout">
        <div className="details-image">
          <img src={book.image || "/book-placeholder.svg"} alt={`Capa de ${book.title}`} />
          <button onClick={() => toggleFavorite(book.id)}>
            <Heart size={18} fill={favorite ? "currentColor" : "none"} />
            {favorite ? "Favoritado" : "Favoritar"}
          </button>
        </div>
        <article>
          <span className={`tag tag--${hasPrice ? "venda" : "disponivel"}`}>
            {hasPrice ? "À venda" : "Modalidade não informada"}
          </span>
          <h1>{book.title}</h1>
          <h2>{book.author}</h2>
          <p className="description">{book.description}</p>
          {hasPrice && <strong className="detail-price">{price}</strong>}
          <div className="book-details">
            <span><b>Condição</b>{book.condition || "Não informada"}</span>
            <span><b>Gênero</b>{book.genre || "Não informado"}</span>
            <span><b>Localização</b>{book.city || "Não informada"}</span>
          </div>
          <div className="owner-box">
            <span>{owner[0]}</span>
            <div>
              <b>{owner}</b>
              <p><MapPin size={13} /> {book.city || "Localização não informada"}</p>
            </div>
            <Link to="/perfil">Ver perfil</Link>
          </div>
          <div className="detail-actions">
            {hasPrice ? (
              <button className="button button--primary" onClick={() => addToCart(book)}>
                <ShoppingCart size={17} /> Adicionar ao carrinho
              </button>
            ) : !user ? (
              <Link className="button button--primary" to="/login">Entre para propor uma troca</Link>
            ) : isOwnAnnouncement ? (
              <span className="empty-state">Este anúncio é seu.</span>
            ) : myBooks.length ? (
              <div className="trade-proposal">
                <select value={offeredBookId} onChange={(event) => setOfferedBookId(event.target.value)}>
                  <option value="">Escolha um livro seu</option>
                  {myBooks.map((item) => <option key={item.bookId} value={item.bookId}>{item.title}</option>)}
                </select>
                <button className="button button--primary" onClick={proposeTrade} disabled={proposingTrade}>
                  {proposingTrade ? "Enviando..." : "Propor troca"}
                </button>
              </div>
            ) : (
              <Link className="button button--primary" to="/livros/novo">Cadastre um livro para oferecer</Link>
            )}
            {tradeError && <p className="form-feedback" role="alert">{tradeError}</p>}
            {hasPrice && <Link className="button button--outline" to="/mensagens"><MessageCircle size={17} /> Conversar</Link>}
          </div>
          <p className="safe-note">
            <ShieldCheck size={16} /> Negocie com segurança pela BookTrade
          </p>
        </article>
      </div>
    </section>
  );
}

export default BookDetails;
