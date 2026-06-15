import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProductDetalhes.css";

function ProdutoDetalhe(){

    const { id } = useParams();
    const navigate = useNavigate();
    const [modalSucesso, setModalSucesso] = useState(false);
    const [produto, setProduto] = useState(null);
    const [imagemPrincipal, setImagemPrincipal] = useState("");
const [modalLogin, setModalLogin] =
useState(false);

const [totalCurtidas, setTotalCurtidas] = useState(0);

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
            "http://localhost:5000/api/cart",
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

    // produto
    fetch(`http://localhost:5000/api/products/${id}`)
        .then(res => res.json())
        .then(data => {
            setProduto(data);

            setImagemPrincipal(
                `http://localhost:5000/uploads/produtos/${data.imagem}`
            );
        });

    // total curtidas
    fetch(`http://localhost:5000/api/products/${id}/likes`)
        .then(res => res.json())
        .then(data => {
            setTotalCurtidas(data.total);
        });

    // se usuário curtiu
    if (token) {
        fetch(`http://localhost:5000/api/products/${id}/liked`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => {
            setCurtido(data.liked);
        });
    }

}, [id]);

const toggleLike = async () => {

    const token = localStorage.getItem("token");

    if (!token) {
        setModalLogin(true);
        return;
    }

    try {

        if (!curtido) {

            await fetch(`http://localhost:5000/api/products/${id}/like`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setCurtido(true);
            setTotalCurtidas(prev => prev + 1);
            mostrarToast("❤️ Curtida adicionada!");

        } else {

            await fetch(`http://localhost:5000/api/products/${id}/like`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setCurtido(false);
            setTotalCurtidas(prev => prev - 1);
            mostrarToast("💔 Curtida removida!");
        }

    } catch (err) {
        console.log(err);
    }
};

const mostrarToast = (msg) => {
    setToast(msg);

    setTimeout(() => {
        setToast("");
    }, 2000);
};


    if(!produto){
        return <p>Carregando...</p>;
    }

    return(

    <div className="pagina-produto">

        <div className="topo-detalhe">

            <button
                className="btn-voltars"
                onClick={() => navigate(-1)}
            >
                ← Voltar
            </button> 

        </div>

        <div className="produto-detalhe">

            {toast && (
    <div className="toast-like">
        {toast}
    </div>
)}


    <div className="galeria">
        

    <img
        className="imagem-principal"
        src={imagemPrincipal}
        alt={produto.nome}
    />

    

    <div className="miniaturas">

        <img
            className={
                imagemPrincipal ===
                `http://localhost:5000/uploads/produtos/${produto.imagem}`
                ? "miniatura ativa"
                : "miniatura"
            }
            src={`http://localhost:5000/uploads/produtos/${produto.imagem}`}
            alt=""
            onClick={() =>
                setImagemPrincipal(
                    `http://localhost:5000/uploads/produtos/${produto.imagem}`
                )
            }
        />

        {produto.imagem2 && (
            <img
                className={
                    imagemPrincipal ===
                    `http://localhost:5000/uploads/produtos/${produto.imagem2}`
                    ? "miniatura ativa"
                    : "miniatura"
                }
                src={`http://localhost:5000/uploads/produtos/${produto.imagem2}`}
                alt=""
                onClick={() =>
                    setImagemPrincipal(
                        `http://localhost:5000/uploads/produtos/${produto.imagem2}`
                    )
                }
            />
        )}

        {produto.imagem3 && (
            <img
                className={
                    imagemPrincipal ===
                    `http://localhost:5000/uploads/produtos/${produto.imagem3}`
                    ? "miniatura ativa"
                    : "miniatura"
                }
                src={`http://localhost:5000/uploads/produtos/${produto.imagem3}`}
                alt=""
                onClick={() =>
                    setImagemPrincipal(
                        `http://localhost:5000/uploads/produtos/${produto.imagem3}`
                    )
                }
            />
        )}

    </div>

</div>

            <div className="info-produto">

                <h1>{produto.nome}</h1>
                {totalCurtidas > 0 && (
    <div className="pd-total-curtidas">
        ❤️ {totalCurtidas} pessoas curtiram este produto
    </div>
)}

               <button
    className={`pd-heart-btn ${curtido ? "ativo" : ""}`}
    type="button"
    onClick={toggleLike}
>
    {curtido ? "❤️" : "🤍"}
</button>
                
                <p className="loja">
                    Loja: {produto.nomeLoja}
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

                {
    produto.estoque <= 0 ? (

        <p className="indisponivel">
            Produto indisponível
        </p>

    ) : (

        <p className="estoque">
            Estoque disponível: {produto.estoque}
        </p>

    )
}

                <button
  className="btn-carrinho"
  onClick={adicionarAoCarrinho}
  disabled={produto.estoque <= 0}
>
  {
    produto.estoque <= 0
      ? "Produto Indisponível"
      : "Adicionar ao Carrinho"
  }
</button>

            </div>


        </div>











        {modalSucesso && (

  <div className="modal-overlay">

    <div className="modal-sucesso">

      <h3>Produto adicionado!</h3>

      <p>
        Produto adicionado ao carrinho com sucesso.
      </p>

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