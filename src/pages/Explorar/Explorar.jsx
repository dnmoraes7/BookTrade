import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import BookCard from "../../components/BookCard/BookCard";
import SearchBar from "../../components/SearchBar/SearchBar";

import { useBooks } from "../../contexts/BookContext";
import { DEAL_TYPES, GENRES } from "../../data/catalogOptions";

import "./Explorar.css";

function Explorar({ mode }) {
  // Parâmetros da URL
  const [params, setParams] = useSearchParams();

  // Livros cadastrados
  const { books, booksLoading, booksError } = useBooks();

  // Lista de cidades cadastradas
  const cities = useMemo(() => {
    return ["Todas", ...new Set(books.map((book) => book.city))];
  }, [books]);

  // Texto pesquisado
  const [query, setQuery] = useState(params.get("q") || "");

  // Tipo de negociação
  const [type, setType] = useState(mode || "Todos");

  // Categoria/Gênero
  const [genre, setGenre] = useState("Todos");

  // Cidade
  const [city, setCity] = useState("Todas");

  // Filtra os livros
  const filtered = useMemo(() => {
    return books.filter(
      (book) =>
        // Pesquisa pelo título ou autor
        (!query ||
          `${book.title} ${book.author}`
            .toLowerCase()
            .includes(query.toLowerCase())) &&
        // Tipo de negociação
        (type === "Todos" || book.type === type || (book.price == null && ["Troca", "Doação"].includes(type))) &&
        // Gênero
        (genre === "Todos" || book.genre === genre) &&
        // Cidade
        (city === "Todas" || book.city === city),
    );
  }, [books, query, type, genre, city]);

  // Pesquisa
  function search(event) {
    event.preventDefault();

    setParams(query ? { q: query } : {});
  }

  return (
    <section className="catalog-page">
      {/* Título da página */}

      <div className="page-title">
        <h1>
          {mode === "Venda"
            ? "Livros à venda"
            : mode === "Doação"
              ? "Livros para doação"
              : "Explore livros"}
        </h1>
      </div>

      {booksError && <p className="empty-state">{booksError}</p>}
      {!booksError && booksLoading && (
        <p className="empty-state">Carregando divulgações...</p>
      )}
      {type === "Doação" && !booksLoading && !booksError && (
        <p className="empty-state">
          O banco atual não identifica se divulgações sem preço são para troca
          ou doação. Por isso, não é possível separar apenas as doações.
        </p>
      )}

      {/* Barra de pesquisa */}

      <SearchBar
        query={query}
        setQuery={setQuery}
        city={city}
        setCity={setCity}
        cities={cities}
        onSearch={search}
      />

      <div className="catalog-layout">
        {/* Filtros */}

        <aside className="filters">
          <div>
            <b>Filtros</b>

            <button
              onClick={() => {
                setType(mode || "Todos");
                setGenre("Todos");
                setCity("Todas");
              }}
            >
              Limpar
            </button>
          </div>

          <hr />

          {/* Tipo */}

          <strong>Tipo de negociação</strong>

          {["Todos", ...DEAL_TYPES].map((item) => (
            <label key={item}>
              <input
                type="radio"
                checked={type === item}
                onChange={() => setType(item)}
              />

              {item}
            </label>
          ))}

          <hr />

          {/* Categoria */}

          <strong>Gênero literário</strong>

          {["Todos", ...GENRES].map((item) => (
            <label key={item}>
              <input
                type="radio"
                checked={genre === item}
                onChange={() => setGenre(item)}
              />

              {item}
            </label>
          ))}
        </aside>

        {/* Lista de livros */}

        <div>
          {/* Quantidade encontrada */}

          <div className="catalog-result">
            <b>{filtered.length} livros encontrados</b>

            <span>Ordenar por: Mais recentes</span>
          </div>

          {/* Cards */}

          <div className="book-grid">
            {filtered.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          {/* Caso não encontre livros */}

          {!filtered.length && (
            <p className="empty-state">
              Nenhum livro encontrado com estes filtros.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default Explorar;
