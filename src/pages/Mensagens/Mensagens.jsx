import { ArrowRight, Package, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardSidebar from "../../components/DashboardSidebar/DashboardSidebar";
import BookCard from "../../components/BookCard/BookCard";
import { useAuth } from "../../contexts/AuthContext";
import { useBooks } from "../../contexts/BookContext";
import api from "../../services/api";
import "../shared/Mensagens.css";

function Mensagens({ type }) {
  const { user } = useAuth();
  const { books, favorites, orders } = useBooks();
  const [messages, setMessages] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(type === "chat" || type === "swaps");

  useEffect(() => {
    let active = true;
    if (type === "chat") {
      api.get("/mensagens")
        .then(({ data }) => { if (active) { setError(""); setMessages(data); } })
        .catch((requestError) => { if (active) setError(requestError.response?.data?.erro || "Não foi possível carregar as mensagens."); })
        .finally(() => { if (active) setLoading(false); });
    } else if (type === "swaps") {
      api.get("/trocas")
        .then(({ data }) => { if (active) { setError(""); setSwaps(data); } })
        .catch((requestError) => { if (active) setError(requestError.response?.data?.erro || "Não foi possível carregar as trocas."); })
        .finally(() => { if (active) setLoading(false); });
    }
    return () => { active = false; };
  }, [type, user?.id_usuario]);

  const titles = {
    swaps: ["Trocas", "Propostas registradas para sua conta."],
    favorites: ["Favoritos", "Anúncios salvos nesta conta neste navegador."],
    chat: ["Mensagens", "Mensagens vinculadas às suas vendas e trocas."],
    orders: ["Histórico de pedidos", "Compras registradas nesta sessão."],
  };
  const [title, description] = titles[type];
  const favoriteBooks = books.filter((book) => favorites.includes(book.id));
  const lastMessage = messages[messages.length - 1];
  const recipientId = lastMessage
    ? lastMessage.id_remetente === user?.id_usuario
      ? lastMessage.id_destinatario
      : lastMessage.id_remetente
    : null;

  async function send(event) {
    event.preventDefault();
    if (!text.trim() || !lastMessage || !recipientId) return;
    setError("");
    try {
      const payload = {
        conteudo: text.trim(),
        id_destinatario: recipientId,
        id_venda: lastMessage.id_venda || null,
        id_troca: lastMessage.id_troca || null,
      };
      await api.post("/mensagens", payload);
      const { data } = await api.get("/mensagens");
      setMessages(data);
      setText("");
    } catch (requestError) {
      setError(requestError.response?.data?.erro || "Não foi possível enviar a mensagem.");
    }
  }

  const sortedSwaps = useMemo(() => swaps, [swaps]);

  return (
    <div className="workspace">
      <DashboardSidebar />
      <section className="workspace-main">
        <div className="workspace-heading">
          <div><span className="section-label">MINHA ÁREA</span><h1>{title}</h1><p>{description}</p></div>
        </div>
        {error && <p className="form-feedback" role="alert">{error}</p>}
        {loading && <p className="empty-state">Carregando...</p>}

        {type === "favorites" && (
          <div className="book-grid">
            {favoriteBooks.map((book) => <BookCard key={book.id} book={book} />)}
            {!favoriteBooks.length && <p className="empty-state">Você não salvou anúncios nesta conta.</p>}
          </div>
        )}

        {type === "swaps" && !loading && (
          <div className="swap-list">
            {sortedSwaps.map((swap) => {
              const book = books.find((item) => item.divulgacaoId === swap.id_divulgacao);
              return (
                <article key={swap.id_troca} className="swap-item panel">
                  <div>
                    <b>Troca #{swap.id_troca}</b>
                    <p>Status: {swap.status}</p>
                    <p>{swap.id_proponente === user?.id_usuario ? "Você propôs" : "Proposta recebida"}</p>
                  </div>
                  <span>{book?.title || `Divulgação ${swap.id_divulgacao}`}</span>
                  <ArrowRight />
                  <span>Livro oferecido #{swap.id_livro_oferecido}</span>
                  <Link to="/mensagens" className="button button--primary">Conversar</Link>
                </article>
              );
            })}
            {!sortedSwaps.length && <p className="empty-state">Você ainda não tem trocas: 0.</p>}
          </div>
        )}

        {type === "orders" && (
          <div className="panel order-list">
            {orders.map((order) => (
              <article key={order.id_venda}><Package /><div><b>{order.titulo}</b><p>Venda #{order.id_venda} · {order.status} · R$ {Number(order.valor_total || 0).toFixed(2)}</p></div></article>
            ))}
            {!orders.length && <p className="empty-state">Nenhum pedido salvo.</p>}
          </div>
        )}

        {type === "chat" && !loading && (
          <section className="chat-panel panel">
            <aside><b>Negociações</b><p>Vendas e trocas</p></aside>
            <div>
              <header><b>Mensagens da conta</b><small>{messages.length} mensagem(ns)</small></header>
              <div className="message-list">
                {messages.map((message) => {
                  const own = message.id_remetente === user?.id_usuario;
                  return <p key={message.id_mensagem} className={own ? "own" : ""}>
                    <b>{own ? "Você" : message.remetente_nome}: </b>{message.conteudo}
                  </p>;
                })}
                {!messages.length && <p>Não há mensagens vinculadas a uma negociação.</p>}
              </div>
              <form onSubmit={send}>
                <input value={text} maxLength={500} disabled={!lastMessage} placeholder={lastMessage ? "Escreva uma mensagem..." : "É necessário ter uma venda ou troca para conversar."} onChange={(event) => setText(event.target.value)} />
                <button aria-label="Enviar" disabled={!lastMessage || !text.trim()}><Send size={17} /></button>
              </form>
            </div>
          </section>
        )}
      </section>
    </div>
  );
}

export default Mensagens;
