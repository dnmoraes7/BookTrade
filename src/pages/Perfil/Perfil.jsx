import { Save } from "lucide-react";
import { useState } from "react";
import DashboardSidebar from "../../components/DashboardSidebar/DashboardSidebar";
import { useAuth } from "../../contexts/AuthContext";
import "../shared/Mensagens.css";

function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    telefone: user?.telefone || "",
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setSaved(false);
    setError("");
    try {
      await updateProfile(form);
      setSaved(true);
    } catch (requestError) {
      setError(requestError.response?.data?.erro || "Não foi possível salvar o perfil.");
    }
  }

  return (
    <div className="workspace">
      <DashboardSidebar />
      <section className="workspace-main">
        <div className="workspace-heading">
          <div><span className="section-label">MINHA CONTA</span><h1>Perfil e configurações</h1><p>Atualize seus dados cadastrados.</p></div>
        </div>
        <form className="profile-form panel" onSubmit={submit}>
          <div className="profile-avatar">{user?.name?.slice(0, 2).toUpperCase()}</div>
          <div className="form-grid">
            <label>Nome completo<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
            <label>E-mail<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
            <label>Telefone<input value={form.telefone} onChange={(event) => setForm({ ...form, telefone: event.target.value })} /></label>
          </div>
          <button className="button button--primary"><Save size={17} /> Salvar alterações</button>
          {saved && <span className="form-feedback">Perfil atualizado com sucesso.</span>}
          {error && <span className="form-feedback" role="alert">{error}</span>}
        </form>
      </section>
    </div>
  );
}

export default Profile;
