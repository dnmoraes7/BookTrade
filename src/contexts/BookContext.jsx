/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { seedBooks } from "../data/seedBooks";

const BookContext = createContext();
const read = (key, initial) =>
  JSON.parse(localStorage.getItem(key) || JSON.stringify(initial));

export function BookProvider({ children }) {
  const [books, setBooks] = useState(() => read("bookswap_books", seedBooks));
  const [favorites, setFavorites] = useState(() =>
    read("bookswap_favorites", []),
  );
  const [cart, setCart] = useState(() => read("bookswap_cart", []));
  const [orders, setOrders] = useState(() => read("bookswap_orders", []));

  useEffect(
    () => localStorage.setItem("bookswap_books", JSON.stringify(books)),
    [books],
  );
  useEffect(
    () => localStorage.setItem("bookswap_favorites", JSON.stringify(favorites)),
    [favorites],
  );
  useEffect(
    () => localStorage.setItem("bookswap_cart", JSON.stringify(cart)),
    [cart],
  );
  useEffect(
    () => localStorage.setItem("bookswap_orders", JSON.stringify(orders)),
    [orders],
  );

  const actions = useMemo(
    () => ({
      addBook: (book) =>
        setBooks((items) => [
          {
            ...book,
            id: crypto.randomUUID(),
            owner: "Marina Silva",
            city: "São Paulo, SP",
          },
          ...items,
        ]),
      updateBook: (id, changes) =>
        setBooks((items) =>
          items.map((book) =>
            book.id === id ? { ...book, ...changes } : book,
          ),
        ),
      deleteBook: (id) =>
        setBooks((items) => items.filter((book) => book.id !== id)),
      toggleFavorite: (id) =>
        setFavorites((ids) =>
          ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id],
        ),
      addToCart: (book) =>
        setCart((items) =>
          items.some((item) => item.id === book.id) ? items : [...items, book],
        ),
      removeFromCart: (id) =>
        setCart((items) => items.filter((item) => item.id !== id)),
      checkout: () => {
        setOrders((items) => [...cart, ...items]);
        setCart([]);
      },
    }),
    [cart],
  );

  return (
    <BookContext.Provider
      value={{ books, favorites, cart, orders, ...actions }}
    >
      {children}
    </BookContext.Provider>
  );
}

export const useBooks = () => useContext(BookContext);
