import { ShoppingCart, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useBooks } from "../contexts/BookContext";
import "./Carrinho.css";
function Cart() {
  const { cart, removeFromCart, checkout } = useBooks();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [finishing, setFinishing] = useState(false);
  const total = cart.reduce((sum, book) => sum + book.price, 0);
  async function finish() {
    setError("");
    setFinishing(true);
    try {
      await checkout();
      navigate("/pedidos");
    } catch (requestError) {
      setError(requestError.response?.data?.erro || "Não foi possível registrar a venda.");
    } finally {
      setFinishing(false);
    }
  }
  return (
    <section className="cart-page">
      <div className="page-title">
          <span className="section-label">CARRINHO</span>
        <h1>Seu carrinho</h1>
      </div>
      {!cart.length ? (
        <div className="empty-state">
          <ShoppingCart size={38} />
          <p>Seu carrinho está vazio.</p>
          <Link className="button button--primary" to="/explorar">
            Explorar livros
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cart.map((book) => (
              <article key={book.id}>
                <img src={book.image || "/book-placeholder.svg"} alt="" />
                <div>
                  <b>{book.title}</b>
                  <p>{book.author}</p>
                  <strong>R$ {book.price.toFixed(2).replace(".", ",")}</strong>
                </div>
                <button onClick={() => removeFromCart(book.id)}>
                  <Trash2 size={18} />
                </button>
              </article>
            ))}
          </div>
          <aside className="cart-summary">
            <h2>Resumo do pedido</h2>
            <p>
              Produtos <b>R$ {total.toFixed(2).replace(".", ",")}</b>
            </p>
            <p>
              Frete <b>Grátis</b>
            </p>
            <hr />
            <strong>
              Total <span>R$ {total.toFixed(2).replace(".", ",")}</span>
            </strong>
            <button className="button button--primary" onClick={finish} disabled={finishing}>
              {finishing ? "Finalizando..." : "Finalizar pedido"}
            </button>
            {error && <p className="form-feedback" role="alert">{error}</p>}
          </aside>
        </div>
      )}
    </section>
  );
}
export default Cart;
