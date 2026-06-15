import { useNavigate } from "react-router-dom";
import "./Clientes.css";

function Clientes() {

  const navigate = useNavigate();

  const clientes = [];

  return (
    <div className="clientes-container">

      <button
        className="btn-voltar"
        onClick={() => navigate(-1)}
      >
        ⬅ Voltar
      </button>

      <div className="clientes-topo">
        <h1>👥 Clientes</h1>
        <p>Gerencie os clientes da sua loja.</p>
      </div>

      {clientes.length === 0 ? (

        <div className="sem-clientes">

          <div className="icone-vazio">
            👥
          </div>

          <h2>Nenhum cliente encontrado</h2>

          <p>
            Sua loja ainda não possui clientes cadastrados ou
            nenhuma compra foi realizada até o momento.
          </p>

          <div className="info-box">

            <div className="info-item">
              🛒 Os clientes aparecerão após realizarem pedidos.
            </div>

            <div className="info-item">
              📦 Os dados serão atualizados automaticamente.
            </div>

            <div className="info-item">
              📈 Aqui você poderá acompanhar seu crescimento.
            </div>

          </div>

        </div>

      ) : (

        <div className="clientes-list">
          {/* Lista dos clientes virá aqui futuramente */}
        </div>

      )}

    </div>
  );
}

export default Clientes;