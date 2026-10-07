import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("booktrade_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("booktrade_token");
      localStorage.removeItem("bookswap_user");
      window.dispatchEvent(new Event("booktrade:unauthorized"));
    }
    return Promise.reject(error);
  },
);

const placeholderImage = "/book-placeholder.svg";

export function mapDivulgacaoToBook(divulgacao) {
  const price = divulgacao.preco == null ? null : Number(divulgacao.preco);

  return {
    id: String(divulgacao.id_divulgacao),
    divulgacaoId: divulgacao.id_divulgacao,
    bookId: divulgacao.id_livro,
    ownerId: divulgacao.id_usuario,
    editora: divulgacao.editora,
    ano_publicacao: divulgacao.ano_publicacao,
    isbn: divulgacao.isbn,
    title: divulgacao.titulo || divulgacao.livro_titulo || "Livro sem título",
    author: divulgacao.autor || "Autor não informado",
    type: price === null ? "Troca" : "Venda",
    genre: divulgacao.genero || "Gênero não informado",
    condition: "Não informado",
    price,
    owner: divulgacao.usuario_nome || "Usuário",
    city: "Localização não informada",
    image: placeholderImage,
    description:
      divulgacao.descricao || divulgacao.livro_descricao || "Sem descrição.",
    status: divulgacao.status,
    publishedAt: divulgacao.data_publicacao,
  };
}

export async function getDivulgacoes() {
  const response = await api.get("/divulgacoes");
  return response.data.map(mapDivulgacaoToBook);
}

export default api;
