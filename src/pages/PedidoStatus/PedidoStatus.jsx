import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./PedidoStatus.css";

function PedidoStatus() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [pedido, setPedido] = useState(null);
    const [itens, setItens] = useState([]);

    const [mostrarModal, setMostrarModal] = useState(false);
const [nota, setNota] = useState(0);
const [comentario, setComentario] = useState("");

    const token = localStorage.getItem("token");

    // ===============================
    // CARREGAR PEDIDO
    // ===============================

useEffect(() => {
    // Altere a URL para buscar apenas UM pedido (a rota /pedidos/:id que você criou)
    fetch(`http://localhost:5000/api/pedidos/${id}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data => {
        // 'data' agora contém { pedido, itens } conforme seu backend
        setPedido(data.pedido);
        setItens(data.itens);
    })
    .catch(err => console.error("Erro ao carregar pedido:", err));
}, [id, token]);



    


    // ===============================
    // ABRIR CHAT (SEM MENSAGEM AUTOMÁTICA)
    // ===============================
    //function abrirChat() {

        // apenas abre o chat
    //    navigate(`/chat/${pedido.id}`);
    //}
    
    async function abrirChat() {
        if (!pedido) return;

    try {

        const res = await fetch(
            "http://localhost:5000/api/chat/abrir",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    loja_id: pedido.loja_id
                })
            }
        );

        const data = await res.json();

        if (!data.chat_id) {
            alert("Erro ao abrir chat");
            return;
        }

        navigate(`/chat/${data.chat_id}`);
        
    } catch (err) {
        console.log(err);
    }
}


async function finalizarPedido() {
    try {
        const res = await fetch(`http://localhost:5000/api/pedidos/${pedido.id}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ status: "finalizado" })
        });

        if (res.ok) {
            alert("Pedido finalizado com sucesso!");
            // Opcional: atualizar o estado local do pedido
            setPedido(prev => ({ ...prev, status: "finalizado" }));
        }
    } catch (err) {
        console.error("Erro ao atualizar status:", err);
    }
}



async function enviarAvaliacao() {
    
    await fetch("http://localhost:5000/api/avaliacao", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
    pedido_id: pedido.id,
    cliente_id: pedido.usuario_id,
    loja_id: pedido.loja_id,
    nota,
    comentario
})
});
setPedido(prev => ({
  ...prev,
  avaliado: 1
}));

setMostrarModal(false);
}

useEffect(() => {

  if (!pedido) return;

  if (pedido.status !== "finalizado") return;

  fetch(
    `http://localhost:5000/api/avaliacao/verificar/${pedido.id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
  .then(res => res.json())
  .then(data => {

    if (!data.avaliado) {
      setMostrarModal(true);
    }

  });

}, [pedido, token]);

const podeAbrirChat = ["aceito", "separação", "em Rota"].includes(pedido?.status);
    
    if (!pedido) {
        return <h2>Carregando...</h2>;
    }

    return (

        <div className="pagina-pedido">

            <div className="topo-pedido">

                <button onClick={() => navigate('/')}>
                    ← Voltar
                </button>

                <h1>Pedido #{pedido.id}</h1>

                <h2>🏪 {pedido.loja_nome}</h2>
            </div>



            <div className="status-pedido">

                <h2>⏳ {pedido.status}</h2>

                <div className="botoes-contato">

   

</div>

                

            </div>



            <div className="info-entrega">

                <h2>📍 Informações do Pedido</h2>

                {pedido.tipo_pedido === "entrega" && pedido.dadosEntrega && (
                    <div className="card-entrega">

                        <p><b>Nome:</b> {pedido.dadosEntrega.nome}</p>
                        <p><b>Endereço:</b> {pedido.dadosEntrega.endereco}</p>
                        <p><b>Número:</b> {pedido.dadosEntrega.numero}</p>
                        <p><b>Bairro:</b> {pedido.dadosEntrega.bairro}</p>
                        <p><b>Pagamento:</b> {pedido.dadosEntrega.pagamento}</p>
                        <p><b>Observação:</b>{pedido.dadosEntrega.observacao}</p>

                    </div>
                )}

                {pedido.tipo_pedido === "retirada" && pedido.dadosEntrega && (
                    <div className="card-entrega">

                        <p><b>Nome:</b> {pedido.dadosEntrega.nome}</p>
                        <p><b>CPF:</b> {pedido.dadosEntrega.cpf}</p>
                        <p><b>Tipo:</b> Retirada na loja</p>

                    </div>
                )}

            </div>



            <div className="lista-produtos">

                {itens.map(item => (

                    <div
                        key={`${item.id}-${item.nome}`}
                        className="card-produto-pedido"
                    >

                        <img
                            src={`http://localhost:5000/uploads/produtos/${item.imagem}`}
                            alt={item.nome}
                        />

                        <div>

                            <h3>{item.nome}</h3>

                            <p>Quantidade: {item.quantidade}</p>

                            <span>R$ {item.preco}</span>

                        </div>

                    </div>

                ))}

            </div>



            <div className="footer-pedido">

    <small>(Subtotal: R$ {pedido.total} + Taxa: R$ {pedido.taxa_servico})</small>
                <h2>Total: R$ {parseFloat(pedido.total_final).toFixed(2)}</h2>

            </div>

            {mostrarModal && (
  <div className="review-backdrop">
    <div className="review-box">

      <h2>Como foi seu pedido?</h2>
      <p className="review-subtitle">Sua opinião ajuda a loja a melhorar</p>

      <div className="review-stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            onClick={() => setNota(n)}
            className={`review-star ${n <= nota ? "on" : ""}`}
          >
            ★
          </span>
        ))}
      </div>

      <textarea
        className="review-input"
        placeholder="Escreva um comentário (opcional)"
        onChange={(e) => setComentario(e.target.value)}
      />

      <button className="review-button" onClick={enviarAvaliacao}>
        Enviar avaliação
      </button>

    </div>
  </div>
)}

        </div>

    );

}

export default PedidoStatus;