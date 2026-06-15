import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Store.css";

function Store() {

    
    const { id } = useParams();
    const navigate = useNavigate();

    let user = null;

try {
  const storedUser = localStorage.getItem("user");
  user = storedUser ? JSON.parse(storedUser) : null;
} catch (err) {
  user = null;
  localStorage.removeItem("user");
}

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

    const [avaliacao, setAvaliacao] = useState({
    media: 0,
    total: 0
});
const menuRef = useRef(null);
const [copiado, setCopiado] = useState(false);



   const handleCompartilhar = async () => {
    try {
        // Copia direto para a área de transferência
        await navigator.clipboard.writeText(window.location.href);
        setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
        
        // Feedback visual rápido
        alert("Link copiado! É só colar no WhatsApp.");
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
        fetch(`http://localhost:5000/api/stores/${id}/products?pagina=${pagina}`)
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
        `http://localhost:5000/api/stores/${id}/favorito`,
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
        `http://localhost:5000/api/stores/${id}/total-favoritos`
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
    fetch(`http://localhost:5000/api/stores/${id}/public`)
        .then(res => res.json())
        .then(data => setStore(data))
        .catch(err => console.log(err));
}, [id]);

useEffect(() => {

    fetch(`http://localhost:5000/api/stores/${id}/avaliacoes`)
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

    console.log("CLICOU NO FAVORITO");

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Faça login primeiro");
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:5000/api/stores/${id}/favoritar`,
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
            "http://localhost:5000/api/chat/abrir",
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


    return (
        <div className="store-page">

            {/* TOP BAR */}
            <div className="store-top-bar">

                <button className="btn-back" onClick={() => navigate("/")}>
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
                            ? `http://localhost:5000/uploads/lojas/${store.imagem}`
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
                                ? `http://localhost:5000/uploads/lojas/${store.imagem}`
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









                        

                        

                        {/* =========================
                            STATUS + HORÁRIO (VOLTOU)
                        ========================= */}
                        <div className="horario-loja">

                            <div className={`store-status ${isLojaAberta() ? "open" : "closed"}`}>
                                <span className="dot"></span>
                                {isLojaAberta()
                                    ? "ABERTA"
                                    : "FECHADA"}
                            <span>
                                🕒 {store?.horario_abertura} às {store?.horario_fechamento}
                            </span>
                            </div>
 

                        </div>

                        {/* =========================
                            STATS (VOLTOU)
                        ========================= */}
                        {/* =========================


    REDES SOCIAIS (NOVO BLOCO)
========================= */}
{(store?.facebook || store?.instagram) && (



    
    <div className="store-social">
        <button className="btn-compartilhar" onClick={handleCompartilhar}>
    {copiado ? "✅ Link Copiado!" : "🔗 "}
</button>

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
    <span>{produtos.length} Produtos</span>
    <span
    className="link-comentarios"
    onClick={() => navigate(`/store/${id}/comentarios`)}
>
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


                <div className="products-grid">

                    {produtosFiltrados.map(produto => (
                        <div
                            key={produto.id}
                            className="product-card"
                            onClick={() => navigate(`/product/${produto.id}`)}
                        >
                            <img
                                src={
                                    produto.imagem
                                        ? `http://localhost:5000/uploads/produtos/${produto.imagem}`
                                        : "https://dummyimage.com/300x300"
                                }
                                alt={produto.nome}

                            />



                    <div className="product-info">

    <h3>{produto.nome}</h3>

    {/* likes */}
    <div className="likes-row">
        ❤️ {produto.curtidas ?? 0}
    </div>

    {/* preços */}
    <div className="price-row">

        <span className="product-price">
            R$ {produto.preco}
        </span>

        {produto.preco_antigo && (
            <span className="old-price">
                R$ {produto.preco_antigo}
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