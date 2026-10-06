import {
  ArrowRight,
  BookOpen,
  Coins,
  Heart,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useBooks } from "../../contexts/BookContext";
import BookCard from "../../components/BookCard/BookCard";

import "./Home.css";

function Home() {
  const { books } = useBooks();

  return (
    <>
      {/* ================= HERO / SLOGAN ================= */}

      <section className="hero">
        {/* Texto principal */}
        <div className="hero-copy">
          <h1>
            {" "}
            Seu próximo livro está na <em>estante</em> de alguém.{" "}
          </h1>

          <p>
            {" "}
            Troque, doe e descubra livros incríveis em uma comunidade que acredita no poder de compartilhar histórias.
          </p>

          {/* Botões principais */}
          <div className="hero-actions">
            <Link className="button button--primary" to="/explorar">
              Explorar livros
              <ArrowRight size={17} />
            </Link>

            <Link className="button button--outline" to="/cadastro">
              Criar conta grátis
            </Link>
          </div>
        </div>

        {/* Imagem principal */}
        <div className="hero-art">
          <img
            src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=85"
            alt="Pessoa lendo em uma biblioteca"
          />
        </div>
      </section>

      {/* ================= BARRA DE CONFIANÇA ================= */}

      <section className="trust-bar">
        <span>
          <ShieldCheck />
          Trocas <b>seguras</b>
        </span>

        <span>
          <Heart />
          Comunidade que <b>compartilha</b>
        </span>
      </section>

      {/* ================= LIVROS EM DESTAQUE ================= */}

      <section className="content-section">
        {/* Título da seção */}
        <div className="section-heading">
          <div>
            <span className="section-label">RECÉM-CHEGADOS</span>

            <h2>Livros que esperam por você</h2>

            <p>Descubra novas histórias e dê uma nova vida aos seus livros.</p>
          </div>

          <Link to="/explorar">
            Ver todos
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Grid de livros */}
        <div className="book-grid">
          {books.slice(0, 4).map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* ================= COMO FUNCIONA ================= */}

      <section className="steps-section">
        <div>
          <h2>
            Trocar livros é <em>mais fácil do que parece.</em>
          </h2>
        </div>

        <div className="steps">
          {[
            [
              BookOpen,
              "Cadastre seus livros",
              "Mostre os livros que já fizeram parte da sua história.",
            ],
            [
              Coins,
              "Faça uma proposta",
              "Combine uma troca justa com outro leitor.",
            ],
            [
              Heart,
              "Compartilhe histórias",
              "Receba um livro e dê novos capítulos ao seu.",
            ],
          ].map(([Icon, title, text], index) => (
            <article key={title}>
              <i>0{index + 1}</i>

              <span>
                <Icon />
              </span>

              <h3>{title}</h3>

              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ================= CHAMADA FINAL ================= */}

      <section className="home-cta">
        <h2> Pronto para fazer parte dessa troca? </h2>

        <p> Cadastre-se gratuitamente e comece a descobrir novos mundos. </p>

        <Link className="button button--yellow" to="/cadastro">
          Criar minha conta
          <ArrowRight size={17} />
        </Link>
      </section>
    </>
  );
}

export default Home;
