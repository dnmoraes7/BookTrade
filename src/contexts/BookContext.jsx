/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import api, { getDivulgacoes } from "../services/api";

const BookContext = createContext();
const readList = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); }
  catch { return []; }
};

export function BookProvider({ children }) {
  const { user } = useAuth();
  const scope = user?.id_usuario ? `user_${user.id_usuario}` : "guest";
  const loadScope = (id) => ({
    favorites: readList(`booktrade_favorites_${id}`),
    cart: readList(`booktrade_cart_${id}`),
  });
  const [scopedData, setScopedData] = useState(() => ({ [scope]: loadScope(scope) }));
  const scopedFallback = useMemo(() => ({
    favorites: readList(`booktrade_favorites_${scope}`),
    cart: readList(`booktrade_cart_${scope}`),
  }), [scope]);
  const currentData = scopedData[scope] || scopedFallback;
  const { favorites, cart } = currentData;
  const [ordersByScope, setOrdersByScope] = useState({});
  const orders = ordersByScope[scope] || [];
  const [books, setBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [booksError, setBooksError] = useState("");

  async function refreshBooks() {
    setBooksLoading(true);
    setBooksError("");
    try { setBooks(await getDivulgacoes()); }
    catch (error) {
      console.error("Falha ao carregar divulgações:", error);
      setBooksError("Não foi possível carregar os anúncios. Verifique o backend.");
    } finally { setBooksLoading(false); }
  }

  useEffect(() => {
    localStorage.removeItem("bookswap_favorites");
    localStorage.removeItem("bookswap_cart");
    localStorage.removeItem("bookswap_orders");
    localStorage.removeItem("bookswap_books");
    Promise.resolve().then(refreshBooks);
  }, []);

  useEffect(() => {
    if (!user?.id_usuario) return;
    api.get("/vendas")
      .then(({ data }) => setOrdersByScope((all) => ({ ...all, [scope]: data })))
      .catch((error) => console.error("Falha ao carregar compras:", error));
  }, [scope, user?.id_usuario]);

  useEffect(() => {
    localStorage.setItem(`booktrade_favorites_${scope}`, JSON.stringify(favorites));
    localStorage.setItem(`booktrade_cart_${scope}`, JSON.stringify(cart));
  }, [scope, favorites, cart]);

  function changeData(change) {
    setScopedData((allData) => ({
      ...allData,
      [scope]: change(allData[scope] || scopedFallback),
    }));
  }

  const actions = {
    refreshBooks,
    addBook: async (book) => {
      await api.post("/divulgacoes/com-livro", {
        livro: {
          titulo: book.title,
          autor: book.author,
          genero: book.genre || null,
          descricao: book.description || null,
        },
        titulo: book.title,
        descricao: book.description || null,
        preco: book.type === "Venda" ? Number(book.price) : null,
      });
      await refreshBooks();
    },
    updateBook: async (id, changes) => {
      const currentBook = books.find((book) => book.id === String(id));
      if (!currentBook) throw new Error("Anúncio não encontrado.");
      await api.put(`/livros/${currentBook.bookId}`, {
        titulo: changes.title,
        autor: changes.author,
        editora: currentBook.editora || null,
        ano_publicacao: currentBook.ano_publicacao || null,
        isbn: currentBook.isbn || null,
        genero: changes.genre || null,
        descricao: changes.description || null,
      });
      await api.put(`/divulgacoes/${currentBook.divulgacaoId}`, {
        id_livro: currentBook.bookId,
        titulo: changes.title,
        descricao: changes.description || null,
        preco: changes.type === "Venda" ? Number(changes.price) : null,
        status: currentBook.status || "Ativo",
      });
      await refreshBooks();
    },
    deleteBook: async (id) => {
      await api.delete(`/divulgacoes/${id}`);
      await refreshBooks();
    },
    toggleFavorite: (id) => changeData((data) => ({
      ...data,
      favorites: data.favorites.includes(id)
        ? data.favorites.filter((item) => item !== id)
        : [...data.favorites, id],
    })),
    addToCart: (book) => changeData((data) => ({
      ...data,
      cart: data.cart.some((item) => item.id === book.id) ? data.cart : [...data.cart, book],
    })),
    removeFromCart: (id) => changeData((data) => ({
      ...data,
      cart: data.cart.filter((item) => item.id !== id),
    })),
    checkout: async () => {
      await api.post("/vendas/checkout", {
        id_divulgacoes: cart.map((book) => book.divulgacaoId),
      });
      changeData((data) => ({ ...data, cart: [] }));
      const { data } = await api.get("/vendas");
      setOrdersByScope((all) => ({ ...all, [scope]: data }));
    },
  };

  return (
    <BookContext.Provider value={{ books, booksLoading, booksError, favorites, cart, orders, ...actions }}>
      {children}
    </BookContext.Provider>
  );
}

export const useBooks = () => useContext(BookContext);
