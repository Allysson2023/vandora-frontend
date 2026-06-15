import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MeusPedidos.css";
import socket from "../../socket";

function MeusPedidos() {

    const [pedidos, setPedidos] = useState([]);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const user = JSON.parse(localStorage.getItem("user"));

    const nomesStatus = {
        aceito: "✅ Pedido Aceito",
        separacao: "📦 Em Separação",
        rota: "🛵 Em Rota",
        finalizado: "✔️ Finalizado",
        recusado: "❌ Recusado"
    };

    useEffect(() => {

        fetchPedidos();

        // 🔥 ENTRAR NA ROOM
        socket.emit("join", user.id);

        // 🔥 OUVIR NOTIFICAÇÃO
        socket.on("nova_notificacao", (data) => {

            console.log("Notificação recebida:", data);

            // 🔥 Atualizar pedidos automaticamente
            fetchPedidos();

        });

        return () => {
    socket.off("nova_notificacao");
};

    }, []);

    const fetchPedidos = () => {

        fetch("http://localhost:5000/api/meus-pedidos", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => {
            setPedidos(data);
        })
        .catch(err => console.log(err));

    };

    return (
        <div className="pagina-pedidos">

            <div className="topo-pedidos">

                <button
                    className="btn-voltar"
                    onClick={() => navigate(-1)}
                >
                    ← Voltar
                </button>

                <h1>📦 Meus Pedidos</h1>

            </div>

            {pedidos.length === 0 ? (
                <p>Você ainda não fez pedidos</p>
            ) : (

                <div className="lista-pedidos">

                    {pedidos.map(pedido => (

  <div
    key={pedido.id}
    className="card-pedido"
    onClick={() => navigate(`/pedido/${pedido.id}`)}
  >

    <div className="pedido-header">
      <h3>Pedido #{pedido.id}</h3>

      <span className="pedido-total">
        R$ {Number(pedido.total).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL"
        })}
      </span>
    </div>



    <span className={`status-badge ${pedido.status}`}>
  {nomesStatus[pedido.status] || pedido.status}
</span>

    {/* 📅 DATA DO PEDIDO */}
    <p className="data-pedido">
      📅 Criado em:{" "}
      {new Date(pedido.created_at).toLocaleDateString("pt-BR")}
    </p>

    <p className="data-pedido">
      ⏰ Hora:{" "}
      {new Date(pedido.created_at).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
      })}
    </p>

    {/* 🔄 ÚLTIMA ATUALIZAÇÃO */}
    {pedido.updated_at && (
      <p className="data-pedido">
        🔄 Atualizado em:{" "}
        {new Date(pedido.updated_at).toLocaleString("pt-BR")}
      </p>
    )}

  </div>

))}

                </div>

            )}

        </div>
    );
}

export default MeusPedidos;