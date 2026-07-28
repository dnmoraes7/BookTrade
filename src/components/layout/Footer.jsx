import { ArrowRight, BookOpen, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import "./layout.css";

function Footer() {
  return <footer className="site-footer"><div className="footer-grid"><div><Link className="brand footer-brand" to="/"><span><BookOpen size={20} /></span>book<span>swap</span></Link><p>Uma comunidade para histórias encontrarem novos começos.</p></div><div><h4>BookSwap</h4><Link to="/explorar">Explorar livros</Link><Link to="/doacoes">Doações</Link><Link to="/marketplace">Marketplace</Link></div><div><h4>Suporte</h4><a href="#ajuda">Central de ajuda</a><a href="#seguranca">Segurança</a><a href="#termos">Termos de uso</a></div><div className="newsletter"><h4>Boas histórias no seu e-mail</h4><p>Novidades e sugestões para sua próxima leitura.</p><form><input placeholder="Seu melhor e-mail" /><button aria-label="Assinar newsletter"><ArrowRight size={17} /></button></form></div></div><div className="footer-bottom">© 2024 BookSwap. Feito com <Heart size={13} /> para quem ama livros.<span>Privacidade · Cookies</span></div></footer>;
}

export default Footer;
