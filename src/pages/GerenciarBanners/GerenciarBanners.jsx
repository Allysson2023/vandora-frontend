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
  if (!imagem || !titulo || !tipo || !lojaSelecionada) return alert("Preencha tudo!");

  // 1. Primeiro: Upload para o ImgBB através do seu servidor
  const formData = new FormData();
  formData.append("image", imagem); // O backend que trata o ImgBB espera "image"

  try {
    const resUpload = await fetch(`${API_URL}/api/upload-store-logo`, { // Use a mesma rota de upload da logo
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: formData
    });

    const dataUpload = await resUpload.json();
    if (!resUpload.ok) throw new Error("Erro ao subir a imagem");

    // 2. Agora: Salvar os dados no seu banco de dados enviando a URL
    const res = await fetch(`${API_URL}/api/banners`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}` 
      },
      body: JSON.stringify({
        titulo: titulo,
        loja_id: lojaSelecionada,
        tipo: "imagem",
        imagemUrl: dataUpload.url // A URL que veio do ImgBB
      }),
    });

    if (res.ok) {
      alert("Cadastrado com sucesso!");
      limparCampos();
      carregarBanners();
    } else {
      alert("Erro ao salvar no banco!");
    }
  } catch (err) {
    console.error(err);
    alert("Erro no upload: " + err.message);
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
    {/* Input oculto */}
    <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => setImagem(e.target.files[0])} 
        style={{ display: 'none' }} 
        accept="image/*"
    />
    
    {/* Botão de seleção */}
    <button 
        className="btn-selecionar-arquivo" 
        onClick={() => fileInputRef.current.click()}
    >
        {imagem ? imagem.name : "Selecionar Imagem"}
    </button>

    {/* Input de Título */}
    <input 
        type="text" 
        placeholder="Título do Banner" 
        value={titulo} 
        onChange={(e) => setTitulo(e.target.value)} 
    />

    {/* Select de Loja */}
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

    {/* Botão de Envio */}
    <button className="save-btn" onClick={() => setModalConfirmacao({ aberto: true, acao: "cadastrar" })}>
        Publicar Banner
    </button>
  </div>
</section>

      <section className="banner-grid">
    {banners.map(b => (
        <div key={b.id} className="banner-card">
            <img src={b.imagem} alt={b.titulo} />
            
            <div className="banner-info">
                <h4>{b.titulo}</h4>
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