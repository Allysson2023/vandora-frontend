import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MinhasLojas.css";
import { API_URL } from "../../apiConfig";
function MinhasLojas() {

    const navigate = useNavigate();
    const [lojas, setLojas] = useState([]);

    useEffect(() => {
        carregarLojas();
    }, []);

    const carregarLojas = async () => {

        const resposta = await fetch(
            `${API_URL}/api/funcionario/minhas-lojas`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            }
        );

        const dados = await resposta.json();
        setLojas(dados);
    };


    return (
  <div className="ml-container">

    {/* HEADER */}
    <div className="ml-header">

      <button
        className="ml-backBtn"
        onClick={() => navigate(-1)}
      >
        ← Voltar
      </button>

      <div className="ml-headerText">
        <h1>Minhas Lojas</h1>
        <p>Gerencie e acompanhe o desempenho das lojas cadastradas</p>
      </div>

    </div>

    {/* LISTA */}
    <div className="ml-grid">

      {lojas.map((loja) => {

    const aberta = loja.aberta === 1;

    return (
        <div key={loja.id} className="ml-card">

            <div className="ml-cardTop">

                <span className={aberta ? "ml-status open" : "ml-status closed"}>
                    {aberta ? "🟢 Aberta" : "🔴 Fechada"}
                </span>

                <span className="ml-category">
                    {loja.categoria}
                </span>

            </div>

            <h2 className="ml-title">{loja.nome}</h2>

            <div className="ml-stats">

                <div className="ml-box">
                    <span>📦 Produtos</span>
                    <strong>{loja.total_produtos}</strong>
                </div>

                <div className="ml-box">
                    <span>🛒 Pedidos</span>
                    <strong>{loja.total_pedidos}</strong>
                </div>

                <div className="ml-box ml-highlight">
                    <span>💰 Faturamento de Hoje</span>

                    <strong>
                        {Number(loja.faturamento || 0).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL"
                        })}
                    </strong>

                </div>

            </div>

            <button
                className="ml-button"
                onClick={() => navigate(`/dashboard-loja/${loja.id}`)}
            >
                Ver Análise
            </button>

        </div>
    );
})}

    </div>

  </div>
);
}

export default MinhasLojas;