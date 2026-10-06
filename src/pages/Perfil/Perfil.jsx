import { Save } from "lucide-react";
import { useState } from "react";
import DashboardSidebar from "../../components/DashboardSidebar/DashboardSidebar";
import { useAuth } from "../../contexts/AuthContext";
import "../shared/Mensagens.css";

function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState(user);
  const [saved, setSaved] = useState(false);
  function submit(event) {
    event.preventDefault();
    updateProfile(form);
    setSaved(true);
  }
  return (
    <div className="workspace">
      <DashboardSidebar />
      <section className="workspace-main">
        <div className="workspace-heading">
          <div>
            <span className="section-label">MINHA CONTA</span>
            <h1>Perfil e configurações</h1>
            <p>Mantenha suas informações atualizadas.</p>
          </div>
        </div>
        <form className="profile-form panel" onSubmit={submit}>
          <div className="profile-avatar">
            {user?.name?.slice(0, 2).toUpperCase()}
          </div>
          <div className="form-grid">
            <label>
              Nome completo
              <input
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            </label>
            <label>
              E-mail
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
              />
            </label>
            <label>
              Cidade
              <input
                value={form.city}
                onChange={(event) =>
                  setForm({ ...form, city: event.target.value })
                }
              />
            </label>
            <label className="full-field">
              Sobre você
              <textarea
                value={form.bio}
                onChange={(event) =>
                  setForm({ ...form, bio: event.target.value })
                }
                placeholder="Conte um pouco sobre seus gostos literários"
              />
            </label>
          </div>
          <button className="button button--primary">
            <Save size={17} />
            Salvar alterações
          </button>
          {saved && (
            <span className="form-feedback">
              Perfil atualizado com sucesso.
            </span>
          )}
        </form>
      </section>
    </div>
  );
}
export default Profile;
