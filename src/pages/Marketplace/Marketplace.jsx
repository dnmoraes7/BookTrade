import { ShoppingCart, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useBooks } from "../../contexts/BookContext";
import "./Marketplace.css";
function Cart() {
  const { cart, removeFromCart, checkout } = useBooks();
  const navigate = useNavigate();
  const total = cart.reduce((sum, book) => sum + book.price, 0);
  function finish() {
    checkout();
    navigate("/pedidos");
  }
  return (
    <section className="cart-page">
      <div className="page-title">
        <span className="section-label">MARKETPLACE</span>
        <h1>Seu carrinho</h1>
      </div>
      {!cart.length ? (
        <div className="empty-state">
          <ShoppingCart size={38} />
          <p>Seu carrinho está vazio.</p>
          <Link className="button button--primary" to="/marketplace">
            Explorar marketplace
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cart.map((book) => (
              <article key={book.id}>
                <img src={book.image} alt="" />
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
            <button className="button button--primary" onClick={finish}>
              Finalizar pedido
            </button>
          </aside>
        </div>
      )}
    </section>
  );
}
export default Cart;
