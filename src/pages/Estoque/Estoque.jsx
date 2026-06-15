import { useEffect, useState } from "react";
import { useParams,  useNavigate  } from "react-router-dom";
import "./Estoque.css";

function Estoque() {

  const { id } = useParams();

  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() =>  {
    carregarEstoque();
  }, []);

 const carregarEstoque = async () => {

  try {

    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5000/api/stores/${id}/estoque`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await res.json();

    console.log(data);

    setProdutos(Array.isArray(data) ? data : []);

    setLoading(false);

  } catch (error) {

    console.log(error);

    setLoading(false);
  }

};

  if (loading) {
    return <h2>Carregando estoque...</h2>;
  }

  return (
    <div className="estoque-container">

        <button className="btn-voltar" onClick={() => navigate(-1)}>
  ⬅ Voltar
</button>

      <h1>⚠️ Controle de Estoque</h1>

      {produtos.length === 0 ? (
        <p>Nenhum produto encontrado</p>
      ) : (
        <table className="estoque-table">

          <thead>
            <tr>
              <th>Produto</th>
              <th>Estoque</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            {produtos.map((p) => (

              <tr key={p.id}>

                <td>{p.nome}</td>

                <td>{p.estoque}</td>

                <td>
                  {p.estoque <= 5 ? (
                    <span className="baixo">Baixo</span>
                  ) : (
                    <span className="ok">OK</span>
                  )}
                </td>

              </tr>

            ))}

          </tbody>

        </table>
      )}

    </div>
  );

}

export default Estoque;