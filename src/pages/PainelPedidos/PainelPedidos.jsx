import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./PainelPedidos.css";
import socket from "../../socket";
import { formatarDataBR } from "../../utils/dateUtils";
import { API_URL } from "../../apiConfig";

function PainelPedidos() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;

    const [pedidos, setPedidos] = useState([]);
    const [modalAberto, setModalAberto] = useState(false);
    const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
    const [acao, setAcao] = useState(null);
    const [faturamentoHoje, setFaturamentoHoje] = useState(0);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const { id } = useParams();
    const audioRef = useRef(null);

    // 1. FUNÇÃO PARA BUSCAR PEDIDOS (Obrigatória para o Socket)
    const fetchPedidos = async () => {
        try {
            const res = await fetch(`${API_URL}/api/loja/pedidos`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setPedidos(data);
            setCarregando(false);
        } catch (err) {
            setErro("Erro ao carregar pedidos");
            setCarregando(false);
        }
    };

    // 2. FUNÇÃO DE FATURAMENTO
    const atualizarFaturamento = () => {
        fetch(`${API_URL}/api/loja/faturamento-hoje`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => setFaturamentoHoje(Number(data.total_hoje) || 0))
        .catch(err => console.error("Erro ao atualizar faturamento", err));
    };

    // 3. EFEITO DO SOCKET E CARGA INICIAL
    useEffect(() => {
        if (!id) return;

    fetchPedidos();
    atualizarFaturamento();


    // Função de entrada na sala
    const entrarNaSala = () => {
        const nomeDaSala = `loja_${id}`;
        socket.emit("join_loja", nomeDaSala);
        console.log("✅ Entrou na sala da loja:", nomeDaSala);
    };

    // Escutar novos pedidos
    const handleNovoPedido = (data) => {
        console.log("🔔 Pedido recebido via Socket:", data);
        if (audioRef.current) audioRef.current.play().catch(() => {});
        fetchPedidos();
        atualizarFaturamento();
    };

    // Conecta e entra na sala
    socket.on("connect", entrarNaSala);
    entrarNaSala(); 

    // Escuta o evento
    socket.on("novo_pedido", handleNovoPedido);

    return () => {
        socket.off("connect", entrarNaSala);
        socket.off("novo_pedido", handleNovoPedido);
    };
}, [ token, id]);

    // --- FUNÇÕES AUXILIARES ---
    function abrirPedido(id) { navigate(`/admin/pedido/${id}`); }
    function abrirModal(pedido, tipo) {
        setPedidoSelecionado(pedido);
        setAcao(tipo);
        setModalAberto(true);
    }

    const confirmar = async () => {
        try {
            const res = await fetch(`${API_URL}/api/pedidos/${pedidoSelecionado.id}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: acao })
            });

            if (res.ok) {
                atualizarFaturamento();
                fetchPedidos(); // Atualiza lista
                setModalAberto(false);
            } else {
                const data = await res.json();
                alert(data.message);
            }
        } catch (err) { console.error(err); }
    };

    // --- RENDER ---
    if (carregando) return <div className="status-container"><div className="spinner"></div></div>;
    
    return (

        <div className="painel-container">
            <audio ref={audioRef} src="/sounds/notification.mp3" preload="auto" />

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
    {/* Use o operador lógico OR para fallback */}
    <h2>R$ {(Number(faturamentoHoje) || 0).toFixed(2)}</h2>
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
<p>📅 Criado em: {formatarDataBR(pedido.created_at)}</p>
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