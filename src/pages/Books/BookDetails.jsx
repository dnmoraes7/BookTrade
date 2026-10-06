import {
  ArrowLeft,
  Heart,
  MapPin,
  MessageCircle,
  ShoppingCart,
  ShieldCheck,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useBooks } from "../../contexts/BookContext";
import "./BookDetails.css";
function BookDetails() {
  const { id } = useParams();
  const { books, addToCart, favorites, toggleFavorite } = useBooks();
  const book = books.find((item) => item.id === id);
  if (!book) return <p className="empty-state">Livro não encontrado.</p>;
  const favorite = favorites.includes(book.id);
  const price = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(book.price || 0);
  return (
    <section className="details-page">
      <Link to="/explorar" className="back-link">
        <ArrowLeft size={16} />
        Voltar aos livros
      </Link>
      <div className="details-layout">
        <div className="details-image">
          <img src={book.image} alt={`Capa de ${book.title}`} />
          <button onClick={() => toggleFavorite(book.id)}>
            <Heart size={18} fill={favorite ? "currentColor" : "none"} />
            {favorite ? "Favoritado" : "Favoritar"}
          </button>
        </div>
        <article>
          <span
            className={`tag tag--${book.type.toLowerCase().replace("ç", "c")}`}
          >
            Disponível para {book.type}
          </span>
          <h1>{book.title}</h1>
          <h2>{book.author}</h2>
          <p className="description">{book.description}</p>
          {book.type === "Venda" && (
            <strong className="detail-price">{price}</strong>
          )}
          <div className="book-details">
            <span>
              <b>Condição</b>
              {book.condition}
            </span>
            <span>
              <b>Gênero</b>
              {book.genre}
            </span>
            <span>
              <b>Localização</b>
              {book.city}
            </span>
          </div>
          <div className="owner-box">
            <span>{book.owner[0]}</span>
            <div>
              <b>{book.owner}</b>
              <p>
                <MapPin size={13} />
                {book.city} · Membro verificado
              </p>
            </div>
            <Link to="/perfil">Ver perfil</Link>
          </div>
          <div className="detail-actions">
            {book.type === "Venda" ? (
              <button
                className="button button--primary"
                onClick={() => addToCart(book)}
              >
                <ShoppingCart size={17} />
                Adicionar ao carrinho
              </button>
            ) : (
              <Link className="button button--primary" to="/trocas">
                Propor {book.type.toLowerCase()}
              </Link>
            )}
            <Link className="button button--outline" to="/mensagens">
              <MessageCircle size={17} />
              Conversar
            </Link>
          </div>
          <p className="safe-note">
            <ShieldCheck size={16} />
            Negocie com segurança pela BookSwap
          </p>
        </article>
      </div>
    </section>
  );
}
export default BookDetails;
