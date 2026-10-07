import { Heart, MapPin, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useBooks } from "../../contexts/BookContext";
import "./BookCard.css";

function BookCard({ book, compact = false }) {
  const { favorites, toggleFavorite, addToCart } = useBooks();
  const isFavorite = favorites.includes(book.id);
  const hasPrice = book.price !== null && book.price !== undefined;
  const price = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(book.price || 0);
  const owner = book.owner || "Usuário";

  return (
    <article className={`book-card ${compact ? "book-card--compact" : ""}`}>
      <Link to={`/livro/${book.id}`} className="book-image">
        <img src={book.image || "/book-placeholder.svg"} alt={`Capa de ${book.title}`} />
        <span className={`tag tag--${hasPrice ? "venda" : "troca"}`}>
          {hasPrice ? "Venda" : "Troca ou doação"}
        </span>
      </Link>
      <button
        className={`favorite-button ${isFavorite ? "is-favorite" : ""}`}
        onClick={() => toggleFavorite(book.id)}
        aria-label="Favoritar"
      >
        <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
      </button>
      <div className="book-card__content">
        <Link to={`/livro/${book.id}`}>
          <h3>{book.title}</h3>
          <p>{book.author}</p>
        </Link>
        {hasPrice ? (
          <div className="book-price">
            <strong>{price}</strong>
            <button onClick={() => addToCart(book)} aria-label="Adicionar ao carrinho">
              <ShoppingCart size={16} />
            </button>
          </div>
        ) : (
          <span className="book-exchange">Consulte a modalidade com o anunciante</span>
        )}
        <div className="book-owner">
          <span>{owner[0]}</span>
          <small>{owner}</small>
          <small>
            <MapPin size={12} />
            {book.city || "Localização não informada"}
          </small>
        </div>
      </div>
    </article>
  );
}

export default BookCard;
