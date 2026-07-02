import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./ProductDetalhes.css";
import { API_URL } from "../../apiConfig";
function ProdutoDetalhe(){

    const {id, slug } = useParams();
    const navigate = useNavigate();
    const [modalSucesso, setModalSucesso] = useState(false);
    const [produto, setProduto] = useState(null);
    const [imagemPrincipal, setImagemPrincipal] = useState("");
    const [modalLogin, setModalLogin] =useState(false);
    const [totalCurtidas, setTotalCurtidas] = useState(0);
    const [backgroundPos, setBackgroundPos] = useState("0% 0%");
    const [curtido, setCurtido] = useState(false);
    const [toast, setToast] = useState("");

    const adicionarAoCarrinho = async () => {

       const token = localStorage.getItem("token");

    if (!token) {

    setModalLogin(true);

    return;

}

    if(produto.estoque <= 0){

        alert(
            "Produto indisponível no momento.\n\nFale com a loja para saber quando haverá reposição."
        );

        return;
    }

    


    try {


        const response = await fetch(
            `${API_URL}/api/cart`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify({
                    product_id: produto.id,
                    quantidade: 1
                })
            }
        );

        const data = await response.json();

        console.log(data);

        if(response.ok){

            setModalSucesso(true);

        }else{

            alert(data.message || "Erro ao adicionar no carrinho");

        }

    } catch (error) {

        console.log(error);

        alert("Erro no servidor");

    }

};

    useEffect(() => {
    const token = localStorage.getItem("token");

    // 1. Define qual URL usar baseado no que veio na URL (id ou slug)
    const urlProduto = slug 
        ? `${API_URL}/api/products/slug/${slug}` 
        : `${API_URL}/api/products/${id}`;

    // Busca o produto
    fetch(urlProduto)
        .then(res => res.json())
        .then(data => {
            setProduto(data);
            setImagemPrincipal(data.imagem);
            
            // Depois que o produto carregar, buscamos as curtidas usando o ID do produto carregado
            // (Importante usar data.id aqui, pois o slug sozinho não serviria para buscar curtidas)
            const prodId = data.id;

            // total curtidas
            fetch(`${API_URL}/api/products/${prodId}/likes`)
                .then(res => res.json())
                .then(likeData => setTotalCurtidas(likeData.total));

            // se usuário curtiu
            if (token) {
                fetch(`${API_URL}/api/products/${prodId}/liked`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                .then(res => res.json())
                .then(likeData => setCurtido(likeData.liked));
            }
        })
        .catch(err => console.error("Erro ao carregar produto:", err));

}, [id, slug]);

const toggleLike = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
        setModalLogin(true);
        return;
    } 

    // SEGURANÇA: Verifica se o produto carregou antes de tentar curtir
    if (!produto || !produto.id) {
        console.error("ID do produto não disponível.");
        return;
    }

    try {
        // MUDANÇA AQUI: use produto.id ao invés de id
        const endpoint = `${API_URL}/api/products/${produto.id}/like`;

        if (!curtido) {
            await fetch(endpoint, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });

            setCurtido(true);
            setTotalCurtidas(prev => prev + 1);
            mostrarToast("❤️ Curtida adicionada!");
        } else {
            await fetch(endpoint, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            setCurtido(false);
            setTotalCurtidas(prev => prev - 1);
            mostrarToast("💔 Curtida removida!");
        }
    } catch (err) {
        console.error("Erro na requisição:", err);
        alert("Erro ao processar sua curtida.");
    }
};

const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setBackgroundPos(`${x}% ${y}%`);
};


const mostrarToast = (msg) => {
    setToast(msg);

    setTimeout(() => {
        setToast("");
    }, 2000);
};

    if(!produto){
        return <p>Aguarde Carregando...</p>;
    }

    return(

    <div className="pagina-produto">
        <div className="topo-detalhe">
            <button className="btn-voltars"
                onClick={() => navigate(-1)}
            > ←  </button>  </div>

        <div className="produto-detalhe">
            {toast && (
    <div className="toast-like">
        {toast}
    </div>)}

    <div className="galeria">
    <div 
        className="container-zoom" 
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setBackgroundPos("50% 50%")}
        style={{ 
            backgroundImage: `url(${imagemPrincipal})`,
            backgroundPosition: backgroundPos 
        }}
    >
        <img className="imagem-zoom" src={imagemPrincipal} alt={produto.nome} />
    </div>

    <div className="miniaturas">
        {/* Usando a URL direta do banco */}
        <img 
            className={imagemPrincipal === produto.imagem ? "miniatura ativa" : "miniatura"}
            src={produto.imagem} 
            alt="Foto 1" 
            onClick={() => setImagemPrincipal(produto.imagem)} 
        />

        {produto.imagem2 && (
            <img 
                className={imagemPrincipal === produto.imagem2 ? "miniatura ativa" : "miniatura"}
                src={produto.imagem2} 
                alt="Foto 2" 
                onClick={() => setImagemPrincipal(produto.imagem2)} 
            />
        )}

        {produto.imagem3 && (
            <img 
                className={imagemPrincipal === produto.imagem3 ? "miniatura ativa" : "miniatura"}
                src={produto.imagem3} 
                alt="Foto 3" 
                onClick={() => setImagemPrincipal(produto.imagem3)} 
            />
        )}
    </div>
</div>
            <div className="info-produto">
                <h1>{produto.nome}</h1>
                {totalCurtidas > 0 && (
    <div className="pd-total-curtidas">
        ❤️ {totalCurtidas} </div>)}
               <button
    className={`pd-heart-btn ${curtido ? "ativo" : ""}`}
    type="button"
    onClick={toggleLike}>{curtido ? "❤️" : "🤍"}</button>
               <p className="loja">Loja:{" "}
    <Link to={`/store/${produto.store_id}`} className="link-loja">
        {produto.nomeLoja}
    </Link>
</p>

                <p className="descricao">
                    {produto.descricao}
                </p>

                <div className="precos">

                    {produto.preco_antigo && (
                        <span className="preco-antigo">
                            R$ {produto.preco_antigo}
                        </span>
                    )}

                    <span className="preco-atual">
                        R$ {produto.preco}
                    </span>
                </div>

                {produto.estoque <= 0 ? (

        <p className="indisponivel"> Produto indisponível</p>):(
        <p className="estoque">Disponível: {produto.estoque}</p> )} 
        
        </div>
         <button className="btn-carrinhooo" onClick={adicionarAoCarrinho}
  disabled={produto.estoque <= 0}>
  { produto.estoque <= 0 ? "Produto Indisponível" : "Adicionar ao Carrinho" }</button>



        </div>

        {modalSucesso && ( <div className="modal-overlay">

    <div className="modal-sucesso"> <h3>Produto adicionado!</h3>

      <p> Produto adicionado ao carrinho com sucesso. </p>

      <button
        className="btn-ok"
        onClick={() => setModalSucesso(false)}
      >
        OK
      </button>
    </div>
  </div>
)}

{modalLogin && (

  <div className="modal-overlay">

    <div className="modal-login">

      <h3>
        Faça login para continuar
      </h3>

      <p>
        Crie sua conta para
        adicionar produtos
        ao carrinho.
      </p>

      <div className="modal-botoes">

        <button
          className="btn-login"
          onClick={() => navigate("/login")}
        >
          Entrar
        </button>

        <button
          className="btn-cadastro"
          onClick={() => navigate("/cadastro")}
        >
          Criar Conta
        </button>

      </div>

      <button
        className="btn-fechar"
        onClick={() =>
          setModalLogin(false)
        }
      >
        Fechar
      </button>
    </div>
  </div>
)}


    </div>

);
}

export default ProdutoDetalhe;