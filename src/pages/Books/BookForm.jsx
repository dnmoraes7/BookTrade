import { Save } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardSidebar from "../../components/DashboardSidebar/DashboardSidebar";
import { useBooks } from "../../contexts/BookContext";
import "../shared/Mensagens.css";
const blank = {
  title: "",
  author: "",
  type: "Troca",
  genre: "Literatura brasileira",
  condition: "Bom",
  price: "",
  image:
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=80",
  description: "",
};
function BookForm() {
  const { id } = useParams();
  const { books, addBook, updateBook } = useBooks();
  const navigate = useNavigate();
  const existingBook = books.find((book) => book.id === id);
  const [form, setForm] = useState(existingBook || blank);
  function submit(event) {
    event.preventDefault();
    if (id) updateBook(id, { ...form, price: Number(form.price) });
    else addBook({ ...form, price: Number(form.price) });
    navigate("/meus-livros");
  }
  return (
    <div className="workspace">
      <DashboardSidebar />
      <section className="workspace-main">
        <div className="workspace-heading">
          <div>
            <span className="section-label">SUA ESTANTE</span>
            <h1>{id ? "Editar livro" : "Cadastrar livro"}</h1>
            <p>
              Informe os detalhes para outros leitores encontrarem seu livro.
            </p>
          </div>
        </div>
        <form className="book-form panel" onSubmit={submit}>
          <div className="form-grid">
            {[
              ["title", "Título"],
              ["author", "Autor"],
              ["image", "URL da imagem"],
            ].map(([field, label]) => (
              <label key={field}>
                {label}
                <input
                  required
                  value={form[field]}
                  onChange={(event) =>
                    setForm({ ...form, [field]: event.target.value })
                  }
                />
              </label>
            ))}
            <label>
              Tipo
              <select
                value={form.type}
                onChange={(event) =>
                  setForm({ ...form, type: event.target.value })
                }
              >
                <option>Troca</option>
                <option>Doação</option>
                <option>Venda</option>
              </select>
            </label>
            <label>
              Gênero
              <input
                value={form.genre}
                onChange={(event) =>
                  setForm({ ...form, genre: event.target.value })
                }
              />
            </label>
            <label>
              Condição
              <select
                value={form.condition}
                onChange={(event) =>
                  setForm({ ...form, condition: event.target.value })
                }
              >
                <option>Novo</option>
                <option>Muito bom</option>
                <option>Bom</option>
              </select>
            </label>
            {form.type === "Venda" && (
              <label>
                Preço (R$)
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(event) =>
                    setForm({ ...form, price: event.target.value })
                  }
                />
              </label>
            )}
            <label className="full-field">
              Descrição
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
              />
            </label>
          </div>
          <button className="button button--primary">
            <Save size={17} />
            Salvar livro
          </button>
        </form>
      </section>
    </div>
  );
}
export default BookForm;
