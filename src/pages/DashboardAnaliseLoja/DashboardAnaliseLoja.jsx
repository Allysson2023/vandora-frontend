import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./DashboardAnaliseLoja.css";

function DashboardAnaliseLoja() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {

        const resposta = await fetch(
            `http://localhost:5000/api/funcionario/loja-dashboard/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            }
        );

        const data = await resposta.json();
        console.log(data);
        
        setAnalytics(data);
    };

    if (!analytics) {
        return (
            <div className="adl-loadingScreen">
                Carregando análise da loja...
            </div>
        );
    }

    return (
        <div className="adl-wrapper">

            <div className="adl-topBar">

                <button
                    className="adl-returnBtn"
                    onClick={() => navigate(-1)}
                >
                    ← Voltar
                </button>

                <div>
                    <h1>{analytics.nome}</h1>
                    <p>Painel completo da loja</p>
                </div>

            </div>

            <div className="adl-kpiGrid">

                <div className="adl-kpiCard">
                    <span>💰 Hoje</span>
                    <strong>
                        R$ {Number(analytics.faturamentoHoje || 0).toFixed(2)}
                    </strong>
                </div>

                <div className="adl-kpiCard">
                    <span>📅 Mês</span>
                    <strong>
                        R$ {Number(analytics.faturamentoMes || 0).toFixed(2)}
                    </strong>
                </div>

                <div className="adl-kpiCard">
                    <span>🏆 Ano</span>
                    <strong>
                        R$ {Number(analytics.faturamentoAno || 0).toFixed(2)}
                    </strong>
                </div>

                <div className="adl-kpiCard">
                    <span>🛒 Pedidos</span>
                    <strong>{analytics.total_pedidos}</strong>
                </div>

                <div className="adl-kpiCard">
                    <span>📦 Produtos</span>
                    <strong>{analytics.total_produtos}</strong>
                </div>

                <div className="adl-kpiCard">
                    <span>📈 Ticket Médio</span>
                    <strong>
                        R$ {(
                            (analytics.faturamentoMes || 0) /
                            (analytics.total_pedidos || 1)
                        ).toFixed(2)}
                    </strong>
                </div>

            </div>

            <div className="adl-analysisSection">

                <div className="adl-analysisCard">

                    <h3>Desempenho da Loja</h3>

                    <div className="adl-performance">

                        {analytics.faturamentoMes > 5000 ? (
                            <span className="adl-good">
                                🟢 Excelente desempenho
                            </span>
                        ) : analytics.faturamentoMes > 1000 ? (
                            <span className="adl-medium">
                                🟡 Crescimento moderado
                            </span>
                        ) : (
                            <span className="adl-bad">
                                🔴 Necessita atenção
                            </span>
                        )}

                    </div>

                </div>

                <div className="adl-analysisCard">

                    <h3>Resumo Rápido</h3>

                    <ul className="adl-summaryList">
                        <li>Total de produtos cadastrados</li>
                        <li>Total de pedidos recebidos</li>
                        <li>Faturamento atualizado</li>
                        <li>Análise automática da loja</li>
                    </ul>

                </div>

            </div>

        </div>
    );
}

export default DashboardAnaliseLoja;