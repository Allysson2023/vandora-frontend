import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./MaisVendidos.css";

function MaisVendidos() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    carregar();
  }, []);

 const carregar = async () => {

  try {

    const token = localStorage.getItem("token");

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/stores/${id}/mais-vendidos`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await res.json();

    console.log(data);

    // evita quebrar o .map()
    if (Array.isArray(data)) {
      setProdutos(data);
    } else {
      setProdutos([]);
    }

  } catch (err) {

    console.log(err);
    setProdutos([]);

  }

};

  return (
    <div className="mv-container">

      {/* HEADER */}
      <div className="mv-header">

        <button className="btn-voltar" onClick={() => navigate(-1)}>
          ⬅ Voltar
        </button>

        <div>
          <h1>🔥 Mais Vendidos</h1>
          <p>Ranking dos produtos mais vendidos da sua loja</p>
        </div>

      </div>

      {/* RANKING */}
      <div className="mv-list">

        {produtos.length === 0 ? (
          <div className="mv-empty">
            Nenhum produto vendido ainda
          </div>
        ) : (

          produtos.map((p, index) => (

            <div key={p.id} className="mv-item">

              <div className="mv-left">

                <span className="mv-rank">
                  #{index + 1}
                </span>

                <div> 
                  <p className="mv-name">{p.nome}</p>
                  <small>{p.total_vendido}  {
    p.total_vendido > 1 ? "vendas" : "venda"
  }</small>
                </div>

              </div>

              <div className="mv-badge">
                {p.total_vendido}
              </div>

            </div>

          ))

        )}

      </div>

    </div>
  );
}

export default MaisVendidos;