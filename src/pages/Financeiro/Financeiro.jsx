import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Financeiro.css";
import { API_URL } from "../../apiConfig";

function Financeiro() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [dados, setDados] = useState([]);

  useEffect(() => {

    const carregarFinanceiro = async () => {

      try {

        const token = localStorage.getItem("token");

        const res = await fetch(
          `${API_URL}/api/stores/${id}/financeiro`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await res.json();

        console.log(data);

        // garante array sempre
        setDados(Array.isArray(data) ? data : []);

      } catch (err) {
        console.log(err);
        setDados([]);
      }

    };

    carregarFinanceiro();

  }, [id]);

  // =========================
  // CÁLCULOS
  // =========================

  const total = dados.reduce((acc, item) => {
    return acc + Number(item.total || 0);
  }, 0);

  const media = dados.length ? total / dados.length : 0;

  // ordenação correta (mais recente primeiro)
  const movimentacoesOrdenadas = [...dados].sort((a, b) => {
    return new Date(b.data || 0) - new Date(a.data || 0);
  });

  // =========================
  // FORMATADOR
  // =========================
  const formatarMoeda = (valor) => {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="financeiro-container">

      <div className="financeiro-topo">

        <div>
          <h1 className="financeiro-title">
            Painel Financeiro
          </h1>

          <p className="financeiro-subtitle">
            Controle financeiro da sua loja
          </p>
        </div>

        <div className="financeiro-header-icon">
          💰
        </div>

      </div>

      <button
        className="btn-voltar"
        onClick={() => navigate(-1)}
      >
        ⬅ Voltar
      </button>

      {/* ================= CARDS ================= */}
      <div className="cards-financeiro">

        <div className="card-financeiro">
          <span>Total Faturado</span>
          <h2>{formatarMoeda(total)}</h2>
        </div>

        <div className="card-financeiro">
          <span>Total de Registros</span>
          <h2>{dados.length}</h2>
        </div>

        <div className="card-financeiro">
          <span>Média por Venda</span>
          <h2>{formatarMoeda(media)}</h2>
        </div>

      </div>

      {/* ================= LISTA ================= */}
      <div className="financeiro-lista">

        <h3>Últimas Movimentações</h3>

        {dados.length === 0 ? (
          <div className="financeiro-vazio">
            Nenhuma movimentação encontrada.
          </div>
        ) : (

          movimentacoesOrdenadas.map((d, i) => (

            <div className="financeiro-item" key={i}>

              <div className="financeiro-info">

                <div className="financeiro-data">
                  📅 {new Date(d.data).toLocaleString("pt-BR")}
                </div>

                <div className="financeiro-status">
                  Pedido finalizado
                </div>

              </div>

              <div className="financeiro-valor">
                {formatarMoeda(d.total)}
              </div>

            </div>

          ))


          
        )}

      </div>

    </div>
  );
}

export default Financeiro;