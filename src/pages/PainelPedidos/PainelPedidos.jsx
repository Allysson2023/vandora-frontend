import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./PainelPedidos.css";
import socket from "../../socket";
import somPedido from "../../assets/sounds/notification.mp3";

function PainelPedidos() {

    const navigate = useNavigate();
    const { id: storeId } = useParams();
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    const [pedidos, setPedidos] = useState([]);

    // 🔥 MODAL STATE
    const [modalAberto, setModalAberto] = useState(false);
    const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
    const [acao, setAcao] = useState(null);
    const [faturamentoHoje, setFaturamentoHoje] = useState(0);

    // 👇 AQUI ENTRA A FUNÇÃO
function abrirPedido(id) {
    navigate(`/admin/pedido/${id}`);
}

    const audioRef = useRef(null);

    // Adicione este useEffect para buscar o valor
useEffect(() => {
    fetch(`http://localhost:5000/api/loja/faturamento-hoje`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setFaturamentoHoje(data.total_hoje))
    .catch(err => console.error("Erro ao buscar faturamento"));
}, [token]);

    useEffect(() => {

    audioRef.current = new Audio(somPedido);
    audioRef.current.volume = 1;

    const fetchPedidos = () => {
        fetch(`http://localhost:5000/api/loja/pedidos`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) setPedidos(data);
        });
    };

    fetchPedidos();

    socket.emit("join_loja", user.id);

    socket.on("novo_pedido", () => {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
        fetchPedidos();
    });

    return () => socket.off("novo_pedido");

}, [token, storeId, user]);

    // 🔥 ABRIR MODAL
    function abrirModal(pedido, tipo) {
        setPedidoSelecionado(pedido);
        setAcao(tipo);
        setModalAberto(true);
    }

    // 🔥 CONFIRMAR AÇÃO
    const confirmar = async () => {

        try {
            const res = await fetch(`http://localhost:5000/api/pedidos/${pedidoSelecionado.id}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: acao })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message);
                return;
            }

            setPedidos(prev =>
                prev.map(p =>
                    p.id === pedidoSelecionado.id
                        ? { ...p, status: acao }
                        : p
                )
            );

            setModalAberto(false);
            setPedidoSelecionado(null);
            setAcao(null);

        } catch (err) {
            console.log(err);
        }
    };

    return (

        <div className="painel-container">

            {/* 🔥 MODAL */}
            {modalAberto && (
                <div className="modal-overlay">
                    <div className="modal-box">

                        <h2>
                            {acao === "aceito" ? "Confirmar Aceitação" : "Confirmar Recusa"}
                        </h2>

                        <p>
                            Tem certeza que deseja {acao} o pedido #{pedidoSelecionado?.id}?
                        </p>

                        <div className="modal-actions">

                            <button
                                className="btn-cancelar"
                                onClick={() => setModalAberto(false)}
                            >
                                Cancelar
                            </button>

                            <button
                                className={acao === "aceito" ? "btn-aceitar" : "btn-recusar"}
                                onClick={confirmar}
                            >
                                Confirmar
                            </button>

                        </div>

                    </div>
                </div>
            )}

            {/* TOPO (NÃO MEXIDO) */}
            <div className="topo-painel">

                <button
                    className="btn-voltar"
                    onClick={() => navigate(-1)}
                >
                    ← Voltar
                </button>

                <h1>Painel de Pedidos</h1>
                <p>Gerencie os pedidos da sua loja</p>

                

            </div>

            {/* CARDS INFO (NÃO MEXIDO) */}
            <div className="cards-info">
    <div className="info-card">
        <h2>{pedidos.length}</h2>
        <span>Pedidos Totais</span>
    </div>

    {/* Aqui usamos o novo estilo */}
    <div className="faturamento-card">
        <span>Faturamento de Hoje</span>
        <h2>R$ {Number(faturamentoHoje).toFixed(2)}</h2>
    </div>
</div>

            {/* LISTA */}
            <div className="lista-pedidos">

                {pedidos.length === 0 ? (
                    <div className="sem-pedidos">
                        <h2>Nenhum pedido encontrado</h2>
                    </div>
                ) : (

                    pedidos.map((pedido) => {

                        console.log("STATUS REAL:", pedido.status);

                        const status = (pedido.status || "").toLowerCase().trim();
const bloqueado = status !== "aguardando_confirmacao";

                        return (
                            <div
    className="card-pedido"
    key={pedido.id}
    onClick={() => abrirPedido(pedido.id)}
>

                                <div className="pedido-topo">

                                    <div>
                                        <h2>Pedido #{pedido.id}</h2>
                                        <p>Cliente: {pedido.username}</p>
                                    </div>

                                    <span className={`status ${status}`}>
                                        {pedido.status}
                                    </span>

                                </div>

                                <div className="pedido-info">

                                    <p>Tipo: <strong>{pedido.tipo_pedido}</strong></p>
                                    <p>Total: <strong>R$ {pedido.total_final}</strong></p>

                                </div>

                                <div className="pedido-acoes">

                                    <button
                                        className="btn-aceitar"
                                        disabled={bloqueado}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            abrirModal(pedido, "aceito");
                                        }}
                                    >
                                        Aceitar
                                    </button>

                                    <button
                                        className="btn-recusar"
                                        disabled={bloqueado}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            abrirModal(pedido, "recusado");
                                        }}
                                    >
                                        Recusar
                                    </button>

                                </div>

                            </div>
                        );
                    })

                )}

            </div>

        </div>
    );
}

export default PainelPedidos;