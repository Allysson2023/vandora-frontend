import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./EditarLoja.css";
import { API_URL } from "../../apiConfig";

function EditarLoja() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loja, setLoja] = useState(null);
  const [logo, setLogo] = useState(null); // Estado para o arquivo da nova logo
  const [showModal, setShowModal] = useState(false);
  const [showSucesso, setShowSucesso] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [showModalTelegram, setShowModalTelegram] = useState(false);

  useEffect(() => {
    // 1. Buscar a lista de departamentos para o Select
    fetch(`${API_URL}/api/principais`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    .then(res => res.json())
    .then(data => setCategorias(data));

    // 2. Buscar dados da loja
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/api/stores/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(data => setLoja(data))
    .catch(err => console.log("Erro ao buscar loja:", err));
}, [id]);

  const tocarSomSucesso = () => {
    const audio = new Audio('/sounds/sucesso.mp3');
    audio.play().catch(e => console.log("Erro ao tocar som:", e));
  };

  const confirmarAtualizacao = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    let logoUrlFinal = loja.imagem || "";

    try {
      // 1. Upload da logo para o ImgBB (se uma nova foi selecionada)
      if (logo) {
        const formData = new FormData();
        formData.append("image", logo);

        const resUpload = await fetch(`${API_URL}/api/upload-store-logo`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        
        const dataUpload = await resUpload.json();
        if (!resUpload.ok) {
          console.error("Erro do Backend no Upload:", dataUpload); 
          throw new Error(dataUpload.message || "Erro ao subir a logo");
        }
        logoUrlFinal = dataUpload.url; // URL recebida do ImgBB
      }

      // 2. Atualizar dados no banco de dados (Incluindo os campos Pix)
      const payload = {
        ...loja,
        imagem: logoUrlFinal,
        aceita_entrega: loja.aceita_entrega ? 1 : 0,
        aceita_retirada: loja.aceita_retirada ? 1 : 0,
        chave_pix: loja.chave_pix || "",
        tipo_chave_pix: loja.tipo_chave_pix || ""
      };

      const res = await fetch(`${API_URL}/api/stores/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Erro ao atualizar loja");

      setShowModal(false);
      setShowSucesso(true);
      tocarSomSucesso();
    } catch (error) {
      alert("Erro ao atualizar loja: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!loja) return <p>Carregando...</p>;

  return (
    <div className="edit-loja-page">
      <button className="btn-back" onClick={() => navigate(-1)}>← Voltar</button>

      <div className="edit-loja-card">
        <h1>Editar Loja</h1>

        {/* Upload da Logo */}
        <div className="form-group">
          <label>Logo da Loja</label>
          <img 
            src={logo ? URL.createObjectURL(logo) : (loja.imagem || "https://via.placeholder.com/150")} 
            alt="Logo" 
            style={{ width: '150px', marginBottom: '10px', display: 'block', borderRadius: '8px' }}
          />
          <input 
            type="file" 
            id="fileInput" 
            accept="image/*" 
            style={{ display: 'none' }} 
            onChange={(e) => setLogo(e.target.files[0])} 
          />
          <button 
            type="button" 
            className="btn-select-file" 
            onClick={() => document.getElementById('fileInput').click()}
          >
            Selecionar Nova Logo
          </button>
        </div>

        <div className="form-group">
          <label>
            ID do Telegram 
            <button type="button" onClick={() => setShowModalTelegram(true)}>?</button>
          </label>
          <input 
            type="text" 
            value={loja.telegram_chat_id || ""} 
            onChange={(e) => setLoja({...loja, telegram_chat_id: e.target.value})}
            placeholder="Ex: 8263023605"
          />
        </div>

        <div className="form-group">
          <label>Nome da Loja</label>
          <input value={loja.nome || ""} onChange={(e) => setLoja({...loja, nome: e.target.value})} />
        </div>

        <div className="form-group">
          <label>Departamento (Categoria)</label>
          <select 
            value={loja.categoria || ""} 
            onChange={(e) => setLoja({...loja, categoria: e.target.value})}
          >
            <option value="">Escolha um departamento</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.nome}>{cat.nome}</option>
            ))}
          </select>
        </div>

        {/* ==================================================== */}
        {/* NOVOS CAMPOS: DADOS DO PIX PARA O RECEBIMENTO MANUAL */}
        {/* ==================================================== */}
        <div className="form-group">
          <label>Tipo da Chave Pix</label>
          <select 
            value={loja.tipo_chave_pix || ""} 
            onChange={(e) => setLoja({...loja, tipo_chave_pix: e.target.value})}
          >
            <option value="">Selecione o tipo de chave</option>
            <option value="CPF">CPF</option>
            <option value="CNPJ">CNPJ</option>
            <option value="E-mail">E-mail</option>
            <option value="Telefone">Telefone</option>
            <option value="Chave Aleatória">Chave Aleatória</option>
          </select>
        </div>

        <div className="form-group">
          <label>Chave Pix</label>
          <input 
            type="text" 
            value={loja.chave_pix || ""} 
            onChange={(e) => setLoja({...loja, chave_pix: e.target.value})} 
            placeholder="Digite sua chave Pix (ex: seu e-mail, celular ou CNPJ)"
          />
        </div>
        {/* ==================================================== */}

        <div className="form-group">
          <label>Endereço</label>
          <input value={loja.endereco || ""} onChange={(e) => setLoja({...loja, endereco: e.target.value})} />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="form-group" style={{ flex: 2 }}>
            <label>Número</label>
            <input value={loja.numero || ""} onChange={(e) => setLoja({...loja, numero: e.target.value})} />
          </div>
          <div className="form-group" style={{ flex: 3 }}>
            <label>CEP</label>
            <input value={loja.cep || ""} onChange={(e) => setLoja({...loja, cep: e.target.value})} />
          </div>
        </div>

        <div className="form-group">
          <label>Bairro</label>
          <input value={loja.bairro || ""} onChange={(e) => setLoja({...loja, bairro: e.target.value})} />
        </div>

        <div className="form-group">
          <label>Cidade</label>
          <input value={loja.cidade || ""} onChange={(e) => setLoja({...loja, cidade: e.target.value})} />
        </div>

        <div className="form-group-checkbox">
          <label>
            <input type="checkbox" checked={loja.aceita_entrega === 1} onChange={(e) => setLoja({...loja, aceita_entrega: e.target.checked ? 1 : 0})} />
            Aceita Entrega
          </label>
          <label>
            <input type="checkbox" checked={loja.aceita_retirada === 1} onChange={(e) => setLoja({...loja, aceita_retirada: e.target.checked ? 1 : 0})} />
            Aceita Retirada
          </label>
        </div>

        <div className="form-group">
          <label>Descrição</label>
          <textarea value={loja.descricao || ""} onChange={(e) => setLoja({...loja, descricao: e.target.value})} />
        </div>

        <div className="form-group">
          <label>Horário Abertura</label>
          <input type="time" value={loja.horario_abertura || ""} onChange={(e) => setLoja({...loja, horario_abertura: e.target.value})} />
        </div>

        <div className="form-group">
          <label>Horário Fechamento</label>
          <input type="time" value={loja.horario_fechamento || ""} onChange={(e) => setLoja({...loja, horario_fechamento: e.target.value})} />
        </div>

        <div className="form-group">
          <label>Facebook</label>
          <input value={loja.facebook || ""} onChange={(e) => setLoja({...loja, facebook: e.target.value})} />
        </div>

        <div className="form-group">
          <label>Instagram</label>
          <input value={loja.instagram || ""} onChange={(e) => setLoja({...loja, instagram: e.target.value})} />
        </div>

        <div className="form-group">
          <label>Meta Mensal (R$)</label>
          <input type="number" value={loja.meta_mensal || ""} onChange={(e) => setLoja({...loja, meta_mensal: e.target.value})} />
        </div>

        <button onClick={() => setShowModal(true)} disabled={loading}>
          {loading ? "Salvando..." : "Atualizar Loja"}
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Confirmar atualização</h2>
            <p>Tem certeza que deseja atualizar o perfil da sua loja?</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-confirm" onClick={confirmarAtualizacao}>Sim, atualizar</button>
            </div>
          </div>
        </div>
      )}

      {showSucesso && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Sucesso!</h2>
            <p>As informações da sua loja foram atualizadas com sucesso.</p>
            <button className="btn-confirm" onClick={() => setShowSucesso(false)}>Entendido</button>
          </div>
        </div>
      )}

      {/* Modal de Explicação */}
      {showModalTelegram && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', maxWidth: '400px' }}>
            <h3>Como pegar seu ID? 🤖</h3>
            <p>Oi! Sabe o nosso robô do Vandora? Ele funciona assim:</p>
            <ul>
              <li>1. Procure pelo <b>@vandora_AC_bot</b> no seu Telegram.</li>
              <li>2. Clique no botão que diz <b>"Iniciar"</b>.</li>
              <li>3. Ele vai te mandar um número secreto. Esse é o seu ID!</li>
              <li>4. É só copiar esse número e colar ali na caixinha.</li>
            </ul>
            <button onClick={() => setShowModalTelegram(false)} style={{ width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
              OK, entendi!
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default EditarLoja;