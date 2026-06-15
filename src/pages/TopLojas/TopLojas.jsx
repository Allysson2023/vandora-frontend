import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TopLojas.css";

function TopLojas() {

    const navigate = useNavigate();

    const [lojas, setLojas] = useState([]);

    useEffect(() => {
        carregarRanking();
    }, []);

    const carregarRanking = async () => {

        const resposta = await fetch(
            "http://localhost:5000/api/funcionario/top-lojas",
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            }
        );

        const data = await resposta.json();
        setLojas(data);
    };

    return (
        <div className="tl-wrapper">

            <div className="tl-header">

                <button
                    className="tl-backBtn"
                    onClick={() => navigate(-1)}
                >
                    ← Voltar
                </button>

                <div>
                    <h1>🏆 Ranking de Lojas</h1>
                    <p>
                        Lojas com maior faturamento hoje
                    </p>
                </div>

            </div>

            <div className="tl-ranking">

                {lojas.map((loja, index) => (

                    <div
                        key={loja.id}
                        className="tl-card"
                    >

                        <div className="tl-position">

                            {index === 0 && "🥇"}
                            {index === 1 && "🥈"}
                            {index === 2 && "🥉"}
                            {index > 2 && `#${index + 1}`}

                        </div>

                        <div className="tl-info">

                            <h3>{loja.nome}</h3>

                            <span>
                                {loja.categoria}
                            </span>

                        </div>

                        <div className="tl-metrics">

                            <strong>
                                {Number(loja.faturamentoHoje)
                                    .toLocaleString(
                                        "pt-BR",
                                        {
                                            style: "currency",
                                            currency: "BRL"
                                        }
                                    )}
                            </strong>

                            <small>
                                {loja.pedidosHoje} pedidos hoje
                            </small>

                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
}

export default TopLojas;