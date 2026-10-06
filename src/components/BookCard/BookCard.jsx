import { Heart, MapPin, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useBooks } from "../../contexts/BookContext";
import "./BookCard.css";

function BookCard({ book, compact = false }) {
  const { favorites, toggleFavorite, addToCart } = useBooks();
  const isFavorite = favorites.includes(book.id);
  const price = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(book.price || 0);

  return (
    <article className={`book-card ${compact ? "book-card--compact" : ""}`}>
      <Link to={`/livro/${book.id}`} className="book-image">
        <img src={book.image} alt={`Capa de ${book.title}`} />
        <span
          className={`tag tag--${book.type.toLowerCase().replace("ç", "c")}`}
        >
          {book.type}
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
        {book.type === "Venda" ? (
          <div className="book-price">
            <strong>{price}</strong>
            <button
              onClick={() => addToCart(book)}
              aria-label="Adicionar ao carrinho"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        ) : (
          <span className="book-exchange">
            Disponível para {book.type.toLowerCase()}
          </span>
        )}
        <div className="book-owner">
          <span>{book.owner[0]}</span>
          <small>{book.owner}</small>
          <small>
            <MapPin size={12} />
            {book.city}
          </small>
        </div>
      </div>
    </article>
  );
}

export default BookCard;
