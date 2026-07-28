import { BookOpen, CircleHelp, Coins, Heart, LayoutDashboard, LogOut, MessageCircle, Package, Settings, ShieldCheck } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./DashboardSidebar.css";

function DashboardSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const menu = [["/dashboard", "Visão geral", LayoutDashboard], ["/meus-livros", "Meus livros", BookOpen], ["/trocas", "Minhas trocas", Coins], ["/mensagens", "Mensagens", MessageCircle], ["/favoritos", "Favoritos", Heart], ["/pedidos", "Pedidos", Package], ["/perfil", "Configurações", Settings]];
  return <aside className="dashboard-sidebar"><div className="sidebar-user"><span>{user?.name?.slice(0, 2).toUpperCase() || "BS"}</span><div><b>{user?.name || "Visitante"}</b><small>{user?.email}</small></div></div><nav>{menu.map(([path, label, Icon]) => <NavLink to={path} key={path}><Icon size={18} /> <span>{label}</span></NavLink>)}{user?.role === "admin" && <NavLink to="/admin"><ShieldCheck size={18} /><span>Administração</span></NavLink>}</nav><a className="sidebar-help" href="#ajuda"><CircleHelp size={18} /><span>Ajuda e suporte</span></a><button className="sidebar-logout" onClick={() => { logout(); navigate("/"); }}><LogOut size={18} /><span>Sair</span></button></aside>;
}

export default DashboardSidebar;
