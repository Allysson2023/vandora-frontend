import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./GerenciarBanners.css";
import { API_URL } from "../../apiConfig";
function GerenciarBanners() {
  const [titulo, setTitulo] = useState("");
  const [imagem, setImagem] = useState(null);
  const [tipo, setTipo] = useState("imagem"); // NOVO ESTADO
  const [banners, setBanners] = useState([]);
  const navigate = useNavigate();
  const [modalConfirmacao, setModalConfirmacao] = useState({ aberto: false, acao: null });
const [idParaExcluir, setIdParaExcluir] = useState(null);
const fileInputRef = useRef(null); // Adicione isso
const [modalInstrucao, setModalInstrucao] = useState(true);
  const [lojasDoFuncionario, setLojasDoFuncionario] = useState([]);
  const [lojaSelecionada, setLojaSelecionada] = useState("");

  useEffect(() => { 
    carregarBanners(); 
    carregarMinhasLojas();
  }, []);

  const carregarBanners = async () => {
  try {
    const res = await fetch(`${API_URL}/api/banners`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } // IMPORTANTE: faltou o token aqui!
    });
    const data = await res.json();
    console.log("Banners recebidos:", data); // Veja no console do navegador se os dados chegam
    setBanners(Array.isArray(data) ? data.reverse() : []);
  } catch (error) {
    console.error("Erro ao carregar banners:", error);
  }
};

const carregarMinhasLojas = async () => {
    try {
        const res = await fetch(`${API_URL}/api/funcionario/minhas-lojas`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await res.json();
        setLojasDoFuncionario(data);
    } catch (error) {
        console.error("Erro ao carregar lojas:", error);
    }
};

  const cadastrarBanner = async () => {
    // Adicionamos a validação do tipo também
    if (!imagem || !titulo || !tipo || !lojaSelecionada) return alert("Preencha todos os campos e selecione uma loja!");
    
    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("imagem", imagem);
    formData.append("tipo", tipo);
    formData.append("loja_id", lojaSelecionada);

    const res = await fetch(`${API_URL}/api/banners`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: formData,
    });

    if (res.ok) {
      alert("Cadastrado com sucesso!");
      limparCampos(); // <--- Chame aqui
      carregarBanners();
    } else {
      const err = await res.json();
      alert(err.error || "Erro ao cadastrar!");
    }
  };
// ... dentro da função GerenciarBanners
const confirmarAcao = () => {
  if (modalConfirmacao.acao === "cadastrar") cadastrarBanner();
  if (modalConfirmacao.acao === "excluir") deletarBanner(idParaExcluir);
  setModalConfirmacao({ aberto: false, acao: null });
};

const deletarBanner = async (id) => {
  await fetch(`${API_URL}/api/banners/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
  carregarBanners();
};

const limparCampos = () => {
  setTitulo("");
  setImagem(null);
  setTipo("imagem");
  setLojaSelecionada("");
  
  // O "pulo do gato" para limpar o input de arquivo:
  if (fileInputRef.current) {
    fileInputRef.current.value = ""; 
  }
};
  return (
    <div className="banner-page">


      {modalInstrucao && (
  <div className="modal-overlay">
    <div className="modal-content" style={{ maxWidth: '400px' }}>
      <h3>⚠️ Atenção: Requisitos de Mídia</h3>
      <p style={{ textAlign: 'left' }}>
        Para que seu banner ou vídeo fique perfeito na plataforma, siga estas especificações:
        <br /><br />
        • <strong>Banner (Imagem):</strong> Recomendamos <strong>1300x325 pixels</strong> (proporção 4:1).
        <br /><br />
        • <strong>Vídeo:</strong> Recomendamos formato MP4, tamanho máximo de 5MB e proporção 4:1 para evitar cortes indesejados.
        <br /><br />
        <em>Imagens fora destas proporções podem sofrer cortes automáticos para preencher o espaço.</em>
      </p>
      <button 
        className="save-btn" 
        onClick={() => setModalInstrucao(false)}
      >
        Entendido
      </button>
    </div>
  </div>
)}

{modalConfirmacao.aberto && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>Confirmação</h3>
      <p>Você tem certeza que deseja {modalConfirmacao.acao === "cadastrar" ? "publicar este item" : "excluir esta publicação"}?</p>
      <div className="modal-botoes">
        <button onClick={() => setModalConfirmacao({ aberto: false, acao: null })}>Cancelar</button>
        <button onClick={confirmarAcao}>Confirmar</button>
      </div>
    </div>
  </div>
)}



      <header className="banner-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Voltar</button>
        <h1>Gestão de Banners</h1>
      </header>

      <section className="upload-section">

        <div className="card-form">
          {/* Input oculto que o useRef controla */}
    <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => setImagem(e.target.files[0])} 
        style={{ display: 'none' }} 
    />
    
    {/* Botão para disparar o clique */}
    <button 
        className="btn-selecionar-arquivo" 
        onClick={() => fileInputRef.current.click()}
    >
        {imagem ? imagem.name : "Selecionar Imagem/Vídeo"}
    </button>

    <input 
        type="text" 
        placeholder="Título" 
        value={titulo} 
        onChange={(e) => setTitulo(e.target.value)} 
    />

    <label style={{ display: 'block', margin: '10px 0 5px' }}>Tipo de mídia:</label>
<select 
    value={tipo} 
    onChange={(e) => setTipo(e.target.value)}
    style={{ width: '100%', padding: '10px', marginBottom: '15px' }}
>
    <option value="imagem">Imagem</option>
    <option value="video">Vídeo</option>
</select>

// esse e para selecionar a lojas 
<label style={{ display: 'block', margin: '10px 0 5px' }}>Loja de Destino:</label>
<select 
    value={lojaSelecionada} 
    onChange={(e) => setLojaSelecionada(e.target.value)}
    style={{ width: '100%', padding: '10px', marginBottom: '15px' }}
>
    <option value="">Selecione uma loja</option>
    {lojasDoFuncionario.map(loja => (
        <option key={loja.id} value={loja.id}>{loja.nome}</option>
    ))}
</select>


<button className="save-btn" onClick={() => setModalConfirmacao({ aberto: true, acao: "cadastrar" })}>
  Publicar Banner
</button>

        </div>
      </section>

      <section className="banner-grid">
        {banners.map(b => (
          <div key={b.id} className="banner-card">
            {/* RENDERIZAÇÃO CONDICIONAL */}
            {b.tipo === 'video' ? (
              <video src={`${API_URL}/uploads/banners/${b.imagem}`} width="100%" />
            ) : (
              <img src={`${API_URL}/uploads/banners/${b.imagem}`} alt="Banner" />
            )}
            
            <div className="banner-info">
              <h4>{b.titulo} ({b.tipo})</h4>
              <p>Destino: <strong>Loja ID: {b.loja_id}</strong></p>
<button className="delete-btn" onClick={() => {
  setIdParaExcluir(b.id);
  setModalConfirmacao({ aberto: true, acao: "excluir" });
}}>Excluir</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export default GerenciarBanners;