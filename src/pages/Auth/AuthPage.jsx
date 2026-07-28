import { ArrowRight, BookOpen, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import "./Auth.css";

function AuthPage({ mode }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const isLogin = mode === "login";
  const isRecover = mode === "recover";
  function submit(event) { event.preventDefault(); if (isRecover) return setSent(true); if (isLogin) login(form.email); else register(form); navigate("/dashboard"); }
  const title = isRecover ? "Recupere sua senha" : isLogin ? "Que bom ter você de volta!" : "Crie sua conta";
  return <main className="auth-page"><aside className="auth-aside"><Link className="brand" to="/"><span><BookOpen size={20} /></span>book<span>swap</span></Link><div><span className="eyebrow">A COMUNIDADE QUE LÊ JUNTO</span><h1>Uma nova história começa com uma <em>troca.</em></h1><p>Milhares de leitores já descobriram que compartilhar livros é multiplicar histórias.</p></div><small>“O BookSwap fez minha estante girar de novo.”</small></aside><section className="auth-panel"><Link to="/" className="back-link">← Voltar para início</Link><form onSubmit={submit}><h2>{title}</h2><p>{isRecover ? "Informe seu e-mail e enviaremos um link de recuperação." : isLogin ? "Entre para continuar sua jornada literária." : "Comece a dar novos capítulos aos seus livros."}</p>{sent ? <div className="success-message"><CheckCircle /><b>E-mail enviado!</b><span>Confira sua caixa de entrada para continuar.</span></div> : <>{!isLogin && !isRecover && <label>Nome completo<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Como podemos te chamar?" /></label>}<label>E-mail<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="voce@email.com" /></label>{!isRecover && <label>Senha<input required type="password" minLength="4" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="••••••••" /></label>}{isLogin && <Link className="forgot-link" to="/recuperar-senha">Esqueci minha senha</Link>}<button className="button button--primary full-button">{isRecover ? "Enviar link" : isLogin ? "Entrar na minha conta" : "Criar minha conta"}<ArrowRight size={17} /></button></>}<p className="auth-switch">{isLogin ? "Ainda não faz parte?" : "Já tem uma conta?"} <Link to={isLogin ? "/cadastro" : "/login"}>{isLogin ? "Criar conta grátis" : "Entrar"}</Link></p></form></section></main>;
}
export default AuthPage;
