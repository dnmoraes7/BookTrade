import { Pencil, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import DashboardSidebar from "../../components/DashboardSidebar/DashboardSidebar";
import { useAuth } from "../../contexts/AuthContext";
import { useBooks } from "../../contexts/BookContext";
import "../shared/Mensagens.css";

function UserBooks() {
  const { user } = useAuth();
  const { books, deleteBook, booksLoading, booksError } = useBooks();
  const [error, setError] = useState("");
  const myBooks = books.filter((book) => book.ownerId === user?.id_usuario);

  async function removeBook(book) {
    if (!confirm(`Remover o anúncio de ${book.title}?`)) return;
    setError("");
    try {
      await deleteBook(book.divulgacaoId);
    } catch (requestError) {
      setError(requestError.response?.data?.erro || "Não foi possível remover o anúncio.");
    }
  }

  return (
    <div className="workspace">
      <DashboardSidebar />
      <section className="workspace-main">
        <div className="workspace-heading">
          <div>
            <span className="section-label">SUA ESTANTE</span>
            <h1>Meus anúncios</h1>
            <p>Somente divulgações cadastradas pela sua conta.</p>
          </div>
          <Link className="button button--primary" to="/livros/novo">
            <Plus size={17} /> Novo anúncio
          </Link>
        </div>
        {(error || booksError) && <p className="form-feedback" role="alert">{error || booksError}</p>}
        {booksLoading ? <p className="empty-state">Carregando anúncios...</p> : (
          <div className="manage-list panel">
            {myBooks.map((book) => (
              <article key={book.id}>
                <img src={book.image || "/book-placeholder.svg"} alt="" />
                <div>
                  <b>{book.title}</b>
                  <p>{book.author} · {book.price == null ? "Sem preço" : `R$ ${book.price}`}</p>
                </div>
                <Link to={`/livros/${book.id}/editar`} aria-label="Editar anúncio">
                  <Pencil size={17} />
                </Link>
                <button onClick={() => removeBook(book)} aria-label="Remover anúncio">
                  <Trash2 size={17} />
                </button>
              </article>
            ))}
            {!myBooks.length && <p className="empty-state">Você ainda não tem anúncios. Total: 0.</p>}
          </div>
        )}
      </section>
    </div>
  );
}

export default UserBooks;
