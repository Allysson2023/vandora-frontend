import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPanel.css";

function AdminPanel() {
  const navigate = useNavigate();
  
  // Estados individuais para manter compatibilidade com sua estrutura
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [notificacao, setNotificacao] = useState({ exibir: false, texto: "", estilo: "" });
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [modalResumo, setModalResumo] = useState(false);
const [dadosCadastrados, setDadosCadastrados] = useState({ user: "", pass: "" });

  async function confirmarCadastro() {
    if (password !== confirmPassword) {
      setNotificacao({ exibir: true, texto: "As senhas não coincidem!", estilo: "ux-toast-error" });
      setShowModal(false);
      return;
    }

    const tokenSeguranca = localStorage.getItem("token");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${tokenSeguranca}` },
        body: JSON.stringify({ 
            username, 
            email, 
            senha: password, 
            role: "funcionario" 
        })
      });

      const resultado = await response.json();

      // Fechamos o modal de confirmação em QUALQUER resultado (sucesso ou erro)
      setShowModal(false); 

      if (response.ok) {
        setDadosCadastrados({ user: username, pass: password });
        setUsername(""); setEmail(""); setPassword(""); setConfirmPassword("");
        setModalResumo(true); // Abre o modal de resumo
      } else {
        setNotificacao({ exibir: true, texto: resultado.message || "Erro ao cadastrar", estilo: "ux-toast-error" });
      }
    } catch (err) {
      setShowModal(false); // Garante que fecha em caso de erro de rede
      setNotificacao({ exibir: true, texto: "Erro ao conectar com o servidor.", estilo: "ux-toast-error" });
    }
  }

  return (
    <div className="ux-page-wrapper">
      <div className="ux-glass-card">
        <button className="ux-back-link" onClick={() => navigate("/")}>← Voltar para o painel</button>
        
        <div className="ux-text-header">
          <h1>Novo Colaborador</h1>
          <p>Preencha os dados para registrar um novo membro na equipe.</p>
        </div>

        <form className="ux-form-grid" onSubmit={(e) => { e.preventDefault(); setShowModal(true); }}>
          <input name="username" placeholder="Nome de usuário" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <input name="email" type="email" placeholder="E-mail corporativo" value={email} onChange={(e) => setEmail(e.target.value)} required />
          
          <div className="ux-password-wrapper">
  <input 
    name="password" 
    type={showPassword ? "text" : "password"} 
    placeholder="Senha" 
    value={password} 
    onChange={(e) => setPassword(e.target.value)} 
    required 
  />
  <button type="button" onClick={() => setShowPassword(!showPassword)}>
    {showPassword ? "🙈" : "👁️"}
  </button>
</div>

{/* Novo campo de confirmação com a lógica do olho */}
<div className="ux-password-wrapper">
  <input 
    name="confirmPassword" 
    type={showConfirmPassword ? "text" : "password"} 
    placeholder="Confirmar senha" 
    value={confirmPassword} 
    onChange={(e) => setConfirmPassword(e.target.value)} 
    required 
  />
  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
    {showConfirmPassword ? "🙈" : "👁️"}
  </button>
</div>

          {notificacao.exibir && (
            <div className={`ux-toast ${notificacao.estilo}`}>{notificacao.texto}</div>
          )}

          <button type="submit" className="ux-btn-primary">Cadastrar Funcionário</button>
        </form>
      </div>

      {showModal && (
        <div className="ux-modal-overlay">
          <div className="ux-modal-box">
            <h3>Confirmar Operação</h3>
            <p>Deseja salvar este colaborador no sistema Vandora?</p>
            <div className="ux-modal-actions">
              <button className="ux-btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="ux-btn-confirm" onClick={confirmarCadastro}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {modalResumo && (
  <div className="ux-modal-overlay">
    <div className="ux-modal-box">
      <h3>Cadastro Concluído!</h3>
      <div style={{ background: "#f1f5f9", padding: "15px", borderRadius: "8px", margin: "15px 0" }}>
        <p><strong>Usuário:</strong> {dadosCadastrados.user}</p>
        <p><strong>Senha:</strong> {dadosCadastrados.pass}</p>
      </div>
      <div className="ux-modal-actions">
        <button 
          className="ux-btn-confirm" 
          onClick={() => {
    navigator.clipboard.writeText(`Usuário: ${dadosCadastrados.user}\nSenha: ${dadosCadastrados.pass}`);
    alert("Dados copiados com sucesso!"); // Feedback visual simples
}}
        >
          Copiar Dados
        </button>
        <button className="ux-btn-cancel" onClick={() => navigate("/")}>Fechar </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default AdminPanel;