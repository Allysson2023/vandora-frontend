import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Home.css";
import { API_URL } from "../../apiConfig";

function Home() {

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const [lojas, setLojas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [menuAberto, setMenuAberto] = useState(false);
  const [modalSair, setModalSair] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [temMaisProdutos, setTemMaisProdutos] = useState(true);
  const [quantidadeCarrinho, setQuantidadeCarrinho] = useState(0);

  const [modalCarrinhoVazio, setModalCarrinhoVazio] = useState(false);
  const [mostrarBoasVindas, setMostrarBoasVindas] =
    useState(false);

const [usuarioLogado, setUsuarioLogado] =
    useState(null);

  const token = localStorage.getItem("token");
const estaLogado = !!token;

const user = JSON.parse(localStorage.getItem("user"));
const tipoUsuario = user?.tipo;

  const menuRef = useRef(null);

  const [imagensBanner, setImagensBanner] = useState([]);
const [bannerIndex, setBannerIndex] = useState(0);
const [videoDestaque, setVideoDestaque] = useState(null);
  const [videos, setVideos] = useState([]); 
const [videoIndex, setVideoIndex] = useState(0);
  // =========================
  // FECHAR MENU
  // =========================
  useEffect(() => {

    

    function handleClickFora(event) {

      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuAberto(false);
      }

    }

    document.addEventListener("mousedown", handleClickFora);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickFora
      );
    };

  }, []);

  const carregarDados = async () => {
  setLoading(true);
  setErro(false);
  try {
    // Fazemos todas as requisições em paralelo
    await Promise.all([
      fetch(`${API_URL}/api/banners/imagens`).then(r => r.json()).then(setImagensBanner),
      fetch(`${API_URL}/api/banners/video`).then(r => r.json()).then(setVideos),
      fetch(`${API_URL}/api/categories`).then(r => r.json()).then(setCategorias),
      fetch(`${API_URL}/api/stores`).then(r => r.json()).then(setLojas),
      // ... adicione outras chamadas aqui
    ]);
  } catch (err) {
    console.error("Erro ao carregar:", err);
    setErro(true);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  carregarDados();
}, []);




// Controle de tempo do vídeo (Troca a cada 5 segundos igual ao banner)
useEffect(() => {
  if (videos.length === 0) return;
  const interval = setInterval(() => {
    setVideoIndex((prev) => (prev + 1) % videos.length);
  }, 5000);
  return () => clearInterval(interval);
}, [videos]);

// 3. Controle do tempo do Carrossel
useEffect(() => {
  if (imagensBanner.length === 0) return;
  const interval = setInterval(() => {
    setBannerIndex((prev) => (prev + 1) % imagensBanner.length);
  }, 5000);
  return () => clearInterval(interval);
}, [imagensBanner]);








  useEffect(() => {

  const userSalvo =
    localStorage.getItem("user");

  const boasVindasMostrada =
    sessionStorage.getItem("boasVindas");


  if (
    userSalvo &&
    !boasVindasMostrada
  ) {

    setUsuarioLogado(
      JSON.parse(userSalvo)
    );

    setMostrarBoasVindas(true);

    sessionStorage.setItem(
      "boasVindas",
      "true"
    );
  }

}, []);

  // =========================
  // SAIR
  // =========================
  const sair = () => {

  localStorage.removeItem("token");

  sessionStorage.removeItem("boasVindas");

  setModalSair(false);

  navigate("/login");

};



  // =========================
  // PRODUTOS
  // =========================
 useEffect(() => {
  // 1. Não busca se o carregamento global não terminou
  if (loading) return;

  // 2. Só busca se as categorias já tiverem sido carregadas (pelo menos 1)
  if (categorias.length === 0) return; 

  let url = `${API_URL}/api/products?pagina=${pagina}`;

  if (busca) url += `&busca=${encodeURIComponent(busca)}`;
  
  // AQUI: Só adiciona o parâmetro se houver uma categoria selecionada
  if (categoriaSelecionada) {
    url += `&categoria=${encodeURIComponent(categoriaSelecionada)}`;
  }


  fetch(url)
    .then(res => res.json())
    .then(data => {
      
      if (Array.isArray(data)) {
        setProdutos(pagina === 1 ? data : prev => [...prev, ...data]);
        setTemMaisProdutos(data.length >= 30);
      } else {
        setProdutos([]);
      }
    })
    .catch(err => console.error("Erro na busca:", err));

// Adicionamos 'categorias.length' como dependência para garantir que ele espere os dados
}, [categoriaSelecionada, busca, pagina, loading, categorias.length]);

  // =========================
  // CARRINHO
  // =========================
  
  useEffect(() => {

  const token = localStorage.getItem("token");

  if (!token) {
    setQuantidadeCarrinho(0);
    return;
  }

  fetch(`${API_URL}/api/cart`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(data => {

      if (Array.isArray(data)) {

        const total = data.reduce(
          (acc, item) => acc + item.quantidade,
          0
        );

        setQuantidadeCarrinho(total);

      }

    })
    .catch(() => setQuantidadeCarrinho(0));

}, [location]);

  // =========================
  // ABRIR CARRINHO
  // =========================
  const abrirCarrinho = async () => {

  const token = localStorage.getItem("token");

  if (!token) {
    setModalCarrinhoVazio(true);
    return;
  }

  try {

    const res = await fetch(`${API_URL}/api/cart`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      setModalCarrinhoVazio(true);
      return;
    }

    navigate("/carrinho");

  } catch (err) {
    console.log(err);
  }

};

  // =========================
  // ALERTA PEDIDO
  // =========================
  useEffect(() => {

    if (location.state?.pedidoSucesso) {
      alert("Pedido realizado com sucesso!");
    }

  }, []);

  let tipoExibicao = "";

if (usuarioLogado?.tipo === "cliente") {
  tipoExibicao = "Cliente";
}

if (usuarioLogado?.tipo === "lojista") {
  tipoExibicao = "Lojista";
}

if (usuarioLogado?.tipo === "funcionario") {
  tipoExibicao = "Funcionário";
}

if (usuarioLogado?.tipo === "admin") {
  tipoExibicao = "Administrador";
}

// --- TELA DE CARREGANDO ---
  if (loading) {
    return (
      <div className="status-container">
        <div className="spinner"></div>
        <p>Carregando Vandora - AC...</p>
      </div>
    );
  }

  // --- TELA DE ERRO / MANUTENÇÃO ---
  if (erro) {
    return (
      <div className="status-container">
        <div className="error-icon">⚠️</div>
        <h3>Ops!</h3>
        <p>No momento não foi possível conectar ao servidor.</p>
        <button className="btn-carregar" onClick={() => window.location.reload()}>
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="home">
      
      {/* TOPO */}
<header className="topo">
  <h2 
    style={{ cursor: "pointer" }} 
    onClick={() => {
      if (user?.role === "admin" || user?.tipo === "admin") {
        navigate("/admin/painel");
      } else {
        navigate("/");
      }
    }}
  >
    Vandora - AC
  </h2>

        <div className="acoes-topo">

          <input
            type="text"
            placeholder="Buscar lojas ou produtos..."
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPagina(1);
            }}
          />
 
         <button onClick={abrirCarrinho} className="btn-carrinhoo">
  🛒 

  <span className="cart-badge">
    {quantidadeCarrinho}
  </span>
</button>

          

          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="btn-maiss"
          >
            +
          </button>
          <button
    className="btn-notificacao"
    onClick={() => navigate("/notificacoes")}
    disabled={!estaLogado}
>
    🔔
</button>

        </div>
      </header>

      {/* MENU */}
      {menuAberto && (
  <div className="menu-dropdown" ref={menuRef}>
    

    {!estaLogado ? (
      <>
      
        <div
          className="menu-item"
          onClick={() => navigate("/login")}
        >
          🔑 Entrar
        </div>

        <div
          className="menu-item"
          onClick={() => navigate("/cadastro")}
        >
          👤 Criar Conta
        </div>

      </>
    ) : (
      <>

{tipoUsuario === "funcionario" && (
  <div
    className="menu-item"
    onClick={() => navigate("/funcionario/dashboard")}
  >
    🏢 Painel Administrativo
  </div>
)}

{tipoUsuario === "lojista" && (
  <div
    className="menu-item"
    onClick={() => navigate(`/store/${user.loja_id}/dashboard`)}
  >
    🏪 Painel da Loja
  </div>
)}

      <div
  className="menu-item"
  onClick={() => navigate("/mensagens")}
>
  💬 Minhas Conversas
</div>
      
        <div
          className="menu-item"
          onClick={() => navigate("/meus-pedidos")}
        >
          📦 Histórico de Pedidos
        </div>

        <div
    className="menu-item"
    onClick={() => navigate("/perfil")}
  >
    👤 Meu Perfil
  </div>

        <div
          className="menu-item"
          onClick={() => setModalSair(true)}
        >
          🚪 Sair do Login
        </div>

      </>
    )}
    {/* --- OPÇÃO NOVA PARA TODOS --- */}
    <div className="menu-item" onClick={() => navigate("/sobre")}>
      ℹ️ Sobre a Vandora
    </div>

  </div>
)}

<div 
  className="banner-container" 
  onClick={() => {
    const banner = imagensBanner[bannerIndex];
    console.log("DADOS COMPLETOS DO BANNER:", banner); 
    
    // Verificamos se existe o ID ou qualquer campo que identifique a loja
    // Vamos testar o que existe dentro do seu objeto banner:
    if (banner && banner.slug) {
        navigate(`/store/slug/${banner.slug}`);
    } else if (banner && banner.loja_slug) {
        navigate(`/store/slug/${banner.loja_slug}`);
    } else {
        alert("Erro: O banner não tem slug. Veja o console (F12) para ver o que ele tem.");
    }
}}
  style={{ cursor: 'pointer' }}
>
    <img 
  src={imagensBanner[bannerIndex]?.imagem} 
  alt="Banner"
  className="banner-ativo"
  onError={(e) => { e.target.src = "https://dummyimage.com/1200x300"; }}
/>
  </div>
</div>

      {/* LOJAS */}

      <div className="carrossel">
        {lojas.map((loja) => (
          <div
            key={loja.id}
            className="card-loja"
            onClick={() => navigate(`/store/slug/${loja.slug}`)}
          >
            <img
              src={loja.imagem || "https://dummyimage.com/300x300"}
              alt={loja.nome}
            />
            <p>{loja.nome}</p>

<div className="loja-avaliacao">
  ⭐ {loja.media_avaliacao}

  <span>
    ({loja.total_avaliacoes}
    {loja.total_avaliacoes === 1
      ? " avaliação"
      : " avaliações"})
  </span>
</div>
          </div>
        ))}
      </div>


  


{/* 
<div className="home-destaques">
  {videos.length > 0 ? (
    <div 
      className="video-container" 
      onClick={() => navigate(`/store/${videos[videoIndex].loja_id}`)}
      style={{ cursor: 'pointer' }}
    >
      <video 
        key={videos[videoIndex].id} 
        src={videos[videoIndex].imagem}
        autoPlay 
        muted 
        className="video-ativo"
        onEnded={() => {
            setVideoIndex((prev) => (prev + 1) % videos.length);
        }}
      />
    </div>
  ) : (
    <p>Carregando vídeos...</p>
  )}
</div> */}

      {/* CATEGORIAS */}
<div className="menu">

  <span
    className={`categoria-item ${
  categoriaSelecionada === "" ? "categoria-ativa" : ""
}`}
    onClick={() => {
      setCategoriaSelecionada("");
      setPagina(1);
    }}
  >
    Todos
  </span>
 
  {categorias.map((cat, index) => {


  return (
    <span
      key={cat.nome}
      className={`categoria-item ${
        categoriaSelecionada === cat.nome
          ? "categoria-ativa"
          : ""
      }`}
      onClick={() => {
        setCategoriaSelecionada(cat.nome);
        setPagina(1);
      }}
    >
      {cat.nome}
    </span>
  );

})}

</div>

      {/* PRODUTOS */}

      <div className="produto-grid">
        {produtos.map((produto) => (
          <div
            key={produto.id}
            className="card-produto"
            onClick={() => navigate(`/product/slug/${produto.slug}`)}
          >
            <img src={produto.imagem} alt={produto.nome} />



                <h3 className="produto-title-safe">{produto.nome}</h3>

<p className="produto-store-safe">{produto.nomeLoja}</p>

<div className="produto-footer-safe">

  <div className="produto-likes-safe">
    ❤️ {produto.curtidas}
  </div>

  <div className="produto-price-safe">
    <span className="price-current-safe">
      R$ {Number(produto.preco).toFixed(2)}
    </span>

    {produto.preco_antigo && (
      <span className="price-old-safe">
        R$ {Number(produto.preco_antigo).toFixed(2)}
      </span>
    )}
  </div>

</div>


          </div>
        ))}
      </div>
        {/* PAGINAÇÃO */}
        
        <div className="paginacao">
        
          {pagina > 1 && (
        
            <button
              className="btn-carregar"
              onClick={() => setPagina(pagina - 1)}
            >
              Voltar
            </button>
        
          )}
        
          {temMaisProdutos && (
        
            <button
              className="btn-carregar"
              onClick={() => setPagina(pagina + 1)}
            >
              Próximo
            </button>
        
          )}
        
        </div>

      {modalSair && (

  <div className="modal-overlay">

    <div className="modal-sair">

      <h3>Deseja realmente sair?</h3>

      <p>
        Você será desconectado da sua conta.
      </p>

      <div className="modal-botoes">

        <button
          className="btn-cancelar"
          onClick={() => setModalSair(false)}
        >
          Não
        </button>

        <button
          className="btn-confirmar"
          onClick={sair}
        >
          Sim
        </button>

      </div>
    </div>

  </div>

)}

{modalCarrinhoVazio && (

  <div className="modal-overlay">

    <div className="modal">

      <h3>Seu carrinho está vazio 🧺</h3>

      <p>Adicione produtos antes de continuar.</p>

      <button
        onClick={() => setModalCarrinhoVazio(false)}
        className="btn-ok"
      >
        OK
      </button>

    </div>

  </div>

)}
{ mostrarBoasVindas && (

  <div className="welcome-overlay">

    <div className="welcome-card">

      <div className="welcome-icon">
        🎉
      </div>

      <h2 className="welcome-title">
        Bem-vindo ao Vandora - AC
      </h2>

      <p className="welcome-user">
        Olá, <strong>{usuarioLogado?.username}</strong>
      </p>

      <div className="welcome-role">
        {tipoExibicao}
      </div>

      <p className="welcome-text">
        Seu acesso foi realizado com sucesso.
      </p>

      <button
        className="welcome-button"
        onClick={() => setMostrarBoasVindas(false)}
      >
        Entrar
      </button>

    </div>

  </div>

)}

    </div>
  );
}

export default Home;