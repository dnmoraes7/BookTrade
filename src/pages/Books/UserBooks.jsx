import { Pencil, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardSidebar from "../../components/DashboardSidebar/DashboardSidebar";
import { useBooks } from "../../contexts/BookContext";
import "../shared/Mensagens.css";

function UserBooks() {
  const { books, deleteBook } = useBooks();
  return (
    <div className="workspace">
      <DashboardSidebar />
      <section className="workspace-main">
        <div className="workspace-heading">
          <div>
            <span className="section-label">SUA ESTANTE</span>
            <h1>Meus livros</h1>
            <p>Cadastre e mantenha sua estante organizada.</p>
          </div>
          <Link className="button button--primary" to="/livros/novo">
            <Plus size={17} />
            Novo livro
          </Link>
        </div>
        <div className="manage-list panel">
          {books.map((book) => (
            <article key={book.id}>
              <img src={book.image} alt="" />
              <div>
                <b>{book.title}</b>
                <p>
                  {book.author} · {book.type}
                </p>
              </div>
              <Link to={`/livros/${book.id}/editar`} aria-label="Editar">
                <Pencil size={17} />
              </Link>
              <button
                onClick={() => {
                  if (confirm(`Excluir ${book.title}?`)) deleteBook(book.id);
                }}
                aria-label="Excluir"
              >
                <Trash2 size={17} />
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
export default UserBooks;
