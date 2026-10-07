import { Save } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardSidebar from "../../components/DashboardSidebar/DashboardSidebar";
import { useAuth } from "../../contexts/AuthContext";
import { useBooks } from "../../contexts/BookContext";
import { DEAL_TYPES, GENRES } from "../../data/catalogOptions";
import "../shared/Mensagens.css";

const blank = { title: "", author: "", type: "Troca", genre: "", price: "", description: "" };

function BookForm() {
  const { id } = useParams();
  const { user } = useAuth();
  const { books, addBook, updateBook, booksLoading, booksError } = useBooks();
  const existingBook = books.find((book) => book.id === id && book.ownerId === user?.id_usuario);

  if (id && booksLoading) return <p className="empty-state">Carregando anúncio...</p>;
  if (id && booksError) return <p className="empty-state">{booksError}</p>;
  if (id && !existingBook) return <p className="empty-state">Este anúncio não pertence a esta conta ou não existe.</p>;

  return <BookFormFields key={id || "novo"} existingBook={existingBook} addBook={addBook} updateBook={updateBook} id={id} />;
}

function BookFormFields({ existingBook, addBook, updateBook, id }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(existingBook
    ? { ...existingBook, type: existingBook.price == null ? "Troca" : "Venda", price: existingBook.price ?? "" }
    : blank);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (id) await updateBook(id, form);
      else await addBook(form);
      navigate("/meus-livros");
    } catch (requestError) {
      setError(requestError.response?.data?.erro || requestError.message || "Não foi possível salvar o anúncio.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="workspace">
      <DashboardSidebar />
      <section className="workspace-main">
        <div className="workspace-heading">
          <div><span className="section-label">SUA ESTANTE</span><h1>{id ? "Editar anúncio" : "Cadastrar livro"}</h1><p>Informe os dados do livro e da divulgação.</p></div>
        </div>
        <form className="book-form panel" onSubmit={submit}>
          <div className="form-grid">
            <label>Título<input required maxLength={150} value={form.title || ""} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
            <label>Autor<input required maxLength={100} value={form.author || ""} onChange={(event) => setForm({ ...form, author: event.target.value })} /></label>
            <label>Modalidade
              <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
                {DEAL_TYPES.map((type) => <option value={type} key={type}>{type}</option>)}
              </select>
            </label>
            <label>Categoria/Gênero
              <select required value={form.genre || ""} onChange={(event) => setForm({ ...form, genre: event.target.value })}>
                <option value="" disabled>Selecione uma categoria</option>
                {GENRES.map((genre) => <option value={genre} key={genre}>{genre}</option>)}
              </select>
            </label>
            {form.type === "Venda" && <label>Preço (R$)<input type="number" min="0.01" step="0.01" required value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></label>}
            <label className="full-field">Descrição<textarea maxLength={1000} value={form.description || ""} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
          </div>
          <p className="form-feedback">O banco diferencia Venda pelo preço, mas não salva a diferença entre Troca e Doação. Anúncios sem preço aparecerão como “Troca ou doação” e nos dois filtros.</p>
          {error && <p className="form-feedback" role="alert">{error}</p>}
          <button className="button button--primary" disabled={saving}><Save size={17} /> {saving ? "Salvando..." : "Salvar anúncio"}</button>
        </form>
      </section>
    </div>
  );
}

export default BookForm;
