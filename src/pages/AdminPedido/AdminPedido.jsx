import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./AdminPedido.css";
import { formatarDataBR } from "../../utils/dateUtils";
import { API_URL } from "../../apiConfig";

function AdminPedido() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [pedido, setPedido] = useState(null);
    const [itens, setItens] = useState([]);
    const [erro, setErro] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {

        fetch(`${API_URL}/api/pedidos/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
console.log(data);

    if (!data.pedido) {
        setErro(data.message || "Pedido não encontrado");
        return;
    }

    const pedidoFormatado = data.pedido;

    if (
        pedidoFormatado.dadosEntrega &&
        typeof pedidoFormatado.dadosEntrega === "string"
    ) {
        pedidoFormatado.dadosEntrega = JSON.parse(
            pedidoFormatado.dadosEntrega
        );
    }

    setPedido(pedidoFormatado);
    setItens(data.itens || []);
})
            .catch(err => console.log(err));

    }, [id, token]);

    const [modalFinalizarPedido, setModalFinalizarPedido] = useState(false);

    async function atualizarStatus(status) {

        try {

            const res = await fetch(`${API_URL}/api/pedidos/${id}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message);
                return;
            }

            setPedido(prev => ({
                ...prev,
                status
            }));

        } catch (err) {
            console.log(err);
            setErro("Erro ao carregar pedido");
        }
    }

    if (erro) {
    return <h1>{erro}</h1>;
}

    if (!pedido) {
        return <h1>Carregando...</h1>;
    }

    const status = pedido.status;

    const isFinal = status === "finalizado" || status === "cancelado" || status === "recusado";

    const nomesStatus = {
    pendente: "⏳ Pendente",
    aceito: "✅ Pedido Aceito",
    separacao: "📦 Em Separação",
    rota: "🛵 Em Rota",
    finalizado: "✔️ Finalizado",
    recusado: "❌ Recusado",
    cancelado: "🚫 Cancelado"
};

    return (

        <div className="admin-pedido">

            <div className="topo-admin">

                <button className="btn-voltar" onClick={() => navigate(-1)}>
                    ← Voltar
                </button>

                <div>
                    <h1>Pedido - {pedido.id}</h1>

                    <span className={`status ${status}`}>
    {nomesStatus[status] || status}
</span>
                </div>

            </div>

            <div className="grid-admin">

                <div className="card-admin">
                    <h2>Cliente</h2>
                    
                    <p><strong>Nome:</strong> {pedido.nome_cliente}</p>
 
                    {pedido.dadosEntrega && (
                        <>
                            <p><strong>Pagamento:</strong> {pedido.dadosEntrega.pagamento}</p>
                        </>
                    )}

<p>Data do pedido: {formatarDataBR(pedido.created_at)}</p>

{/* 🔄 ÚLTIMA ATUALIZAÇÃO */}
{/* Verificamos se existe o campo updated_at no banco */}
{pedido.updated_at && (
  <p className="data-pedido">
    🔄 Atualizado em: {formatarDataBR(pedido.updated_at)}
  </p>
)}


                    <button
        className="btn-ver-cliente"
        onClick={() =>
            navigate(`/perfil-cliente/${pedido.usuario_id}`)
        }
    >
        Ver Perfil do Cliente
    </button>
                </div>

                <div className="card-admin">
                    <h2>Entrega</h2>

                    {pedido.tipo_pedido === "entrega" && pedido.dadosEntrega && (
                        <>
                            <p><strong>Endereço:</strong> {pedido.dadosEntrega.endereco}</p>

                            <p><strong>Número:</strong> {pedido.dadosEntrega.numero}</p>

                            <p><strong>Bairro:</strong> {pedido.dadosEntrega.bairro}</p>
                            
                            <p><strong>OBS:</strong> {pedido.dadosEntrega.observacao}</p>
                        </>
                    )}

                    {pedido.tipo_pedido === "retirada" && (
                        <p>Cliente vai retirar na loja</p>
                    )}
                </div>

            </div>

            <div className="produtos-admin">

                <h2>Produtos do Pedido</h2>

                {itens.map(item => (
                    <div key={item.id} className="produto-item">

                        <img
                            src={`http://localhost:5000/uploads/produtos/${item.imagem}`}
                            alt={item.nome}
                        />

                        <div>
                            <h3>{item.nome}</h3>
                            <p>Quantidade: {item.quantidade}</p>
                            <span>
    {Number(item.preco).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    })}
</span>
                        </div>

                    </div>
                ))}

            </div>

            <div className="acoes-status">

                <button
                    className="btn-status aceito"
                    onClick={() => atualizarStatus("aceito")}
                    disabled={status !== "pendente"}
                >
                    Aceitar
                </button>

                <button
                    className="btn-status recusado"
                    onClick={() => atualizarStatus("recusado")}
                    disabled={status !== "pendente"}
                >
                    Recusar
                </button>

                <button
                    className="btn-status separacao"
                    onClick={() => atualizarStatus("separacao")}
                    disabled={status !== "aceito"}
                >
                    Em Separação
                </button>

                <button
                    className="btn-status rota"
                    onClick={() => atualizarStatus("rota")}
                    disabled={status !== "separacao"}
                >
                    Em Rota
                </button>

                <button
                    className="btn-status finalizado"
                    onClick={() => setModalFinalizarPedido(true)}
                    disabled={status !== "rota"}
                >
                    Finalizar
                </button>

                <button
    className="btn-status cancelar"
    onClick={() => atualizarStatus("cancelado")}
    disabled={
    status === "rota" ||
    status === "finalizado" ||
    status === "cancelado" ||
    status === "recusado"
}
>
    Cancelar
</button>

            </div>

            <div className="footer-admin">
                <h2>
    Total: {Number(pedido.total_final).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    })}
</h2>
            </div>

            {modalFinalizarPedido && (

    <div className="confirmar-finalizar-overlay">

        <div className="confirmar-finalizar-box">

            <h3>
                Confirmar Finalização
            </h3>

            <p>
                Deseja realmente marcar este pedido como finalizado?
            </p>

            <div className="confirmar-finalizar-botoes">

                <button
                    className="confirmar-finalizar-cancelar"
                    onClick={() =>
                        setModalFinalizarPedido(false)
                    }
                >
                    Não
                </button>

                <button
                    className="confirmar-finalizar-confirmar"
                    onClick={() => {

                        atualizarStatus("finalizado");

                        setModalFinalizarPedido(false);

                    }}
                >
                    Sim, Finalizar
                </button>

            </div>

        </div>

    </div>

)}

        </div>
    );
}

export default AdminPedido;