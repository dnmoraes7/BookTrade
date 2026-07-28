import { ArrowRight, Package, Send } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import DashboardSidebar from "../../components/DashboardSidebar/DashboardSidebar";
import BookCard from "../../components/BookCard/BookCard";

import { useBooks } from "../../contexts/BookContext";

import "../shared/Mensagens.css";

function Mensagens({ type }) {

    // Dados do contexto
    const { books, favorites, orders } = useBooks();

    // Estado das mensagens do chat
    const [messages, setMessages] = useState([
        "Oi, Marina! Vi que você tem Torto Arado disponível.",
        "Oi, Lucas! Está sim 😊 Qual livro você tem em mente?"
    ]);

    // Mensagem digitada
    const [text, setText] = useState("");

    // Títulos de cada página
    const titles = {
        swaps: [
            "Trocas",
            "Acompanhe suas propostas e negociações."
        ],

        favorites: [
            "Favoritos",
            "Livros que você salvou para conhecer melhor."
        ],

        chat: [
            "Mensagens",
            "Converse diretamente com outros leitores."
        ],

        orders: [
            "Histórico de pedidos",
            "Suas compras no marketplace."
        ]
    };

    const [title, description] = titles[type];

    // Enviar mensagem
    function send(event) {

        event.preventDefault();

        if (text.trim()) {

            setMessages([
                ...messages,
                text
            ]);

            setText("");

        }

    }

    return (

        <div className="workspace">

            {/* Sidebar */}
            <DashboardSidebar />

            <section className="workspace-main">

                {/* Cabeçalho */}
                <div className="workspace-heading">

                    <div>

                        <span className="section-label">
                            MINHA ÁREA
                        </span>

                        <h1>{title}</h1>

                        <p>{description}</p>

                    </div>

                </div>

                {/* ================= FAVORITOS ================= */}

                {type === "favorites" && (

                    <div className="book-grid">

                        {books
                            .filter((book) => favorites.includes(book.id))
                            .map((book) => (

                                <BookCard
                                    key={book.id}
                                    book={book}
                                />

                            ))}

                        {!favorites.length && (

                            <p className="empty-state">
                                Você ainda não favoritou nenhum livro.
                            </p>

                        )}

                    </div>

                )}

                {/* ================= TROCAS ================= */}

                {type === "swaps" && (

                    <div className="swap-list">

                        {books.slice(0, 2).map((book, index) => (

                            <article
                                key={book.id}
                                className="swap-item panel"
                            >

                                {/* Usuário */}
                                <div>

                                    <span className="swap-avatar">
                                        L
                                    </span>

                                    <b>
                                        {index
                                            ? "Beatriz Lopes"
                                            : "Lucas Martins"}
                                    </b>

                                    <p>
                                        {index
                                            ? "Enviou uma proposta para você"
                                            : "Quer trocar com você"}
                                    </p>

                                </div>

                                {/* Livro oferecido */}
                                <img
                                    src={book.image}
                                    alt=""
                                />

                                <ArrowRight />

                                {/* Livro desejado */}
                                <img
                                    src={books[(index + 1) % books.length].image}
                                    alt=""
                                />

                                <Link
                                    to="/mensagens"
                                    className="button button--primary"
                                >
                                    Conversar
                                </Link>

                            </article>

                        ))}

                    </div>

                )}

                {/* ================= PEDIDOS ================= */}

                {type === "orders" && (

                    <div className="panel order-list">

                        {orders.length ? (

                            orders.map((book) => (

                                <article key={book.id}>

                                    <Package />

                                    <div>

                                        <b>{book.title}</b>

                                        <p>
                                            Pedido confirmado · Em preparação
                                        </p>

                                    </div>

                                </article>

                            ))

                        ) : (

                            <p className="empty-state">
                                Você ainda não realizou pedidos no marketplace.
                            </p>

                        )}

                    </div>

                )}

                {/* ================= CHAT ================= */}

                {type === "chat" && (

                    <section className="chat-panel panel">

                        {/* Lista de conversas */}
                        <aside>

                            <b>Lucas Martins</b>

                            <p>Beatriz Lopes</p>

                            <p>Carlos Mendes</p>

                        </aside>

                        {/* Conversa */}
                        <div>

                            <header>

                                <b>Lucas Martins</b>

                                <small>
                                    Online agora
                                </small>

                            </header>

                            {/* Mensagens */}
                            <div className="message-list">

                                {messages.map((message, index) => (

                                    <p
                                        key={`${message}-${index}`}
                                        className={index % 2 ? "own" : ""}
                                    >
                                        {message}
                                    </p>

                                ))}

                            </div>

                            {/* Campo de envio */}
                            <form onSubmit={send}>

                                <input
                                    value={text}
                                    placeholder="Escreva uma mensagem..."
                                    onChange={(event) =>
                                        setText(event.target.value)
                                    }
                                />

                                <button aria-label="Enviar">

                                    <Send size={17} />

                                </button>

                            </form>

                        </div>

                    </section>

                )}

            </section>

        </div>

    );

}

export default Mensagens;