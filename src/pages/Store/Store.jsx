import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Store.css";
import { API_URL } from "../../apiConfig";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

function Store() {

    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();

    let user = null;

    const isLogged = !!user;
    const isLojista = user?.tipo === "lojista";
    const isDonoDaLoja = isLojista && user?.loja_id === Number(id);
    const [produtos, setProdutos] = useState([]);
    const [pagina, setPagina] = useState(1);
    const [temMaisProdutos, setTemMaisProdutos] = useState(true);
    const [store, setStore] = useState(null);
    const [busca, setBusca] = useState("");
    const [menuConfig, setMenuConfig] = useState(false);
    const [favorito, setFavorito] = useState(false);
    const [totalFavoritos, setTotalFavoritos] = useState(0);
    const [avaliacao, setAvaliacao] = useState({media: 0, total: 0});
    const menuRef = useRef(null);
    const [copiado, setCopiado] = useState(false);

    try {
  const storedUser = localStorage.getItem("user");
  user = storedUser ? JSON.parse(storedUser) : null;
} catch (err) {
  user = null;
  localStorage.removeItem("user");
}

    const carregarDadosDaLoja = async () => {
    setLoading(true);
    setErro(false);
    try {
        const [lojaRes, prodRes, favRes, totalFavRes, avalRes] = await Promise.all([
            fetch(`${API_URL}/api/stores/${id}/public`).then(r => r.json()),
            fetch(`${API_URL}/api/stores/${id}/products?pagina=${pagina}`).then(r => r.json()),
            fetch(`${API_URL}/api/stores/${id}/favorito`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            }).then(r => r.json()).catch(() => ({ favorito: false })),
            fetch(`${API_URL}/api/stores/${id}/total-favoritos`).then(r => r.json()),
            fetch(`${API_URL}/api/stores/${id}/avaliacoes`).then(r => r.json())
        ]);

        setStore(lojaRes);
        setProdutos(prodRes);
        setTemMaisProdutos(prodRes.length >= 20);
        setFavorito(favRes.favorito);
        setTotalFavoritos(totalFavRes.total);
        setAvaliacao(avalRes);
    } catch (err) {
        console.error("Erro ao carregar loja:", err);
        setErro(true);
    } finally {
        setLoading(false);
    }
};

useEffect(() => {
    carregarDadosDaLoja();
}, [id, pagina]);


   const handleCompartilhar = async () => {
    try {
        await navigator.clipboard.writeText(window.location.href);
        setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
        alert("Link da loja copiado com sucesso!");
    } catch (err) {
        console.error("Erro ao copiar:", err);
    }
};

    // =========================
    // FECHAR MENU AO CLICAR FORA
    // =========================
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuConfig(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // =========================
    // CARREGAR PRODUTOS
    // =========================
    useEffect(() => {
        fetch(`${API_URL}/api/stores/${id}/products?pagina=${pagina}`)
            .then(res => res.json())
            .then(data => {
                if (!Array.isArray(data)) return;

                if (pagina === 1) {
                    setProdutos(data);
                } else {
                    setProdutos(prev => [...prev, ...data]);
                }
                setTemMaisProdutos(data.length >= 20);
            });
    }, [id, pagina]);

    useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(
        `${API_URL}/api/stores/${id}/favorito`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )
        .then(res => res.json())
        .then(data => {
            setFavorito(data.favorito);
        });

}, [id]);


useEffect(() => {

    fetch(
        `${API_URL}/api/stores/${id}/total-favoritos`
    )
        .then(res => res.json())
        .then(data => {
            setTotalFavoritos(data.total);
        });

}, [id]);


    // =========================
    // CARREGAR LOJA
    // =========================
    useEffect(() => {
    fetch(`${API_URL}/api/stores/${id}/public`)
        .then(res => res.json())
        .then(data => setStore(data))
        .catch(err => console.log(err));
}, [id]);

useEffect(() => {
    fetch(`${API_URL}/api/stores/${id}/avaliacoes`)
        .then(res => res.json())
        .then(data => {
            setAvaliacao(data);
        })
        .catch(err => console.log(err));

}, [id]);

    // =========================
    // FILTRO PRODUTOS
    // =========================
    const produtosFiltrados = produtos.filter(produto =>
        produto.nome.toLowerCase().includes(busca.toLowerCase().trim())
    );

    // =========================
    // LOJA ABERTA / FECHADA
    // =========================
    const isLojaAberta = () => {
        if (!store?.horario_abertura || !store?.horario_fechamento) return false;

        const agora = new Date();

        const [hA, mA] = store.horario_abertura.split(":");
        const [hF, mF] = store.horario_fechamento.split(":");

        const abertura = new Date();
        abertura.setHours(hA, mA, 0);

        const fechamento = new Date();
        fechamento.setHours(hF, mF, 0);

        return agora >= abertura && agora <= fechamento;
    };

    const handleDashboard = () => {

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    navigate("/login-lojista");
    return;
  }

  if (user.tipo !== "lojista") {
    alert("Acesso negado");
    return;
  }

  if (user.loja_id !== Number(id)) {
    alert("Você não é dono desta loja");
    return;
  }

  navigate(`/store/${id}/dashboard`);
};


const handleFavoritar = async () => {

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Faça login primeiro");
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/api/stores/${id}/favoritar`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        setFavorito(data.favorito);

        if (data.favorito) {
            setTotalFavoritos(prev => prev + 1);
        } else {
            setTotalFavoritos(prev => prev - 1);
        }

    } catch (err) {
        console.log(err);
    }
};

const abrirChatLoja = async () => {

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Faça login primeiro");
        navigate("/login");
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/api/chat/abrir`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    loja_id: Number(id)
                })
            }
        );

        const data = await response.json();

        navigate(`/chat/${data.chat_id}`);

    } catch (err) {
        console.log(err);
    }
};

// --- TELA DE CARREGAMENTO ---
if (loading) {
    return (
        <div className="status-container">
            <div className="spinner"></div>
            <p>Por favor Aguarde, Carregando loja...</p>
        </div>
    );
}

// --- TELA DE ERRO ---
if (erro) {
    return (
        <div className="status-container">
            <div className="error-icon">⚠️</div>
            <h3>Ops!</h3>
            <p>Não foi possível carregar as informações desta loja.</p>
            <button className="btn-carregar" onClick={() => window.location.reload()}>
                Tentar novamente
            </button>
        </div>
    );
}

    return (
        <div className="store-page">

            {/* TOP BAR */}
            <div className="store-top-bar">

                <button className="btn-back" onClick={() => navigate(-1)}>
                    ← Voltar
                </button>

                <div className="top-actions" ref={menuRef}>

                   {isDonoDaLoja && (
  <button
    className="btn-mais"
    onClick={() => setMenuConfig(prev => !prev)}
  >
    +
  </button>
)}

{isDonoDaLoja && menuConfig && (
  <div className="dropdown-config-top">
    <button onClick={handleDashboard}>
      📊 Painel da Loja
    </button>
  </div>
)}

                </div>
            </div>

            {/* HEADER */}
            <div className="store-header">

                <img
                    className="store-banner"
                    src={
                        store?.imagem
                            ? `${API_URL}/uploads/lojas/${store.imagem}`
                            : "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200"
                    }
                    alt="banner"
                />

                <div className="store-overlay"></div>

                <div className="store-profile">

                    <img
                        className="store-logo"
                        src={
                            store?.imagem
                                ? `${API_URL}/uploads/lojas/${store.imagem}`
                                : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRl55ZXLSARGsTv4qgCQBC_UD8wwSrV-3I-qg&s"
                        }
                        alt="logo"
                    />

                    <div className="store-info">

                        <h1>{store?.nome}</h1>
                         <span>
        {totalFavoritos} favoritos
    </span>
                        <p>{store?.descricao}</p>

                        <div className="horario-loja">

                            <div className={`store-status ${isLojaAberta() ? "open" : "closed"}`}>
                                <span className="dot"></span>
                                {isLojaAberta()
                                    ? "ABERTA"
                                    : "FECHADA"}
                            <span>
                                 {store?.horario_abertura} às {store?.horario_fechamento}
                            </span>
                            </div>
                        </div>

{(store?.facebook || store?.instagram) && (



    
    <div className="store-social">
<button
    className="social-btn mensagem"
    onClick={abrirChatLoja}
>
    💬
</button>



    <button
        className={`btn-favorito ${favorito ? "ativo" : ""}`}
        onClick={handleFavoritar}
    >
        {favorito ? "❤️ " : "🤍 "}
    </button>

        {store?.facebook && (
            <a
                href={store.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn facebook"
            >
                <img
                    src="https://cdn-icons-png.flaticon.com/512/733/733547.png"
                    alt="Facebook"
                />
                
            </a>
        )}

        {store?.instagram && (
            <a
                href={store.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn instagram"
            >
                <img
                    src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png"
                    alt="Instagram"
                />
                
            </a>
        )} 

{/* =========================
    STATS (AGORA LIMPO)
========================= */}


<div className="store-stats">
   
    <div className="store-rating">
    ⭐ {avaliacao.media} (
    {avaliacao.total} {avaliacao.total === 1 ? "avaliação" : "avaliações"}
    )
</div>
</span>
</div>
    </div>
)}


                    </div>
                </div>
            </div>

            {/* PRODUTOS */}
            <div className="store-products">

                <div className="search-box">
                    <input
                        placeholder="Buscar produtos..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>

{produtos.some(p => p.destaque === 1) && (
  <div className="destaques-container" style={{ margin: "20px 0" }}>
    <h2>Promoções</h2>
    <Swiper
      modules={[Autoplay, Pagination]}
      spaceBetween={20}
      slidesPerView={2}
      autoplay={{ delay: 3000 }}
      pagination={{ clickable: true }}
    >
      {produtos.filter(p => p.destaque === 1).map(produto => (
        <SwiperSlide key={produto.id}>
          <div className="product-card" onClick={() => navigate(`/product/slug/${produto.slug}`)}>
            <img src={produto.imagem} alt={produto.nome} />
            <h4>R$:{produto.preco}</h4>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  </div>
)}

<h2>Produtos</h2>
                <div className="products-grid">

                    {produtosFiltrados.map(produto => (
                        <div
                            key={produto.id}
                            className="product-card"
                            onClick={() => navigate(`/product/slug/${produto.slug}`)}
                        >
                            <img src={produto.imagem} alt={produto.nome} />



                    <div className="product-info">

    <h3>{produto.nome}</h3>

    {/* preços */}
    <div className="price-row">

        {produto.preco_antigo && (
            <span className="old-price">
                R$ {produto.preco_antigo}
            </span>
        )}
        <span className="product-price">
            R$ {produto.preco}
        </span>


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
    ← Voltar
</button>
                    )}

                    {temMaisProdutos && (
                        <button
    className="btn-carregar"
    onClick={() => setPagina(pagina + 1)}
>
    Próximo →
</button>
                    )}

                </div>

            </div>

        </div>
    );
}

export default Store;