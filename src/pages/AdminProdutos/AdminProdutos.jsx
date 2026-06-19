import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./AdminProdutos.css";
import { API_URL } from "../../apiConfig";

function AdminProdutos() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState([]);
  const [modalDelete, setModalDelete] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [temMaisProdutos, setTemMaisProdutos] = useState(true);

  useEffect(() => {

    fetch(`${API_URL}/api/stores/${id}/products?pagina=${pagina}`)
      .then(res => res.json())
      .then(data => {

  setProdutos(data);

  setTemMaisProdutos(data.length >= 15);

});

  }, [id, pagina]);

  const excluir = async () => {
  if (!produtoSelecionado) return;

  const res = await fetch(`${API_URL}/api/products/${produtoSelecionado.id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

  if (res.ok) {
    setProdutos(prev => prev.filter(p => p.id !== produtoSelecionado.id));
    setModalDelete(false);
    setProdutoSelecionado(null);
  } else {
    alert("Erro ao excluir produto. Tente novamente.");
  }
};

const produtosFiltrados = produtos.filter(produto =>
  produto.nome.toLowerCase().includes(
    busca.toLowerCase().trim()
  )
);
  return (

    <div className="admin-page">

      <button
      className="btn-back"
      onClick={() => navigate(-1)}
    >
      ← Voltar
    </button>

      <h1>Gerenciar Produtos</h1>

      <div className="search-box">

  <input
    type="text"
    placeholder="Buscar produto..."
    value={busca}
    onChange={(e) => setBusca(e.target.value)}
  />

</div>

      {produtosFiltrados.map(produto => (

        <div className="admin-card" key={produto.id}>

          <img
            src={`${API_URL}/uploads/produtos/${produto.imagem}`}
          />

          <div>
            <h3>
  {produto.nome} ❤️ {produto.curtidas || 0}
</h3>
            <p>R$ {produto.preco}</p>
            <p>estoque: {produto.estoque}</p>
          </div>

          <div className="admin-buttons">

            <button
              onClick={() => navigate(`/admin/produto/${produto.id}`)}
            >
              ✏️ Editar
            </button>

            <button
  onClick={() => {

    setProdutoSelecionado(produto);

    setModalDelete(true);

  }}
>
  🗑 Excluir
</button>

          </div>

        </div>

      ))}
      <div className="paginacao">

  {pagina > 1 && (

    <button
      className="btn-page"
      onClick={() => setPagina(pagina - 1)}
    >
      ← Voltar
    </button>

  )}

  {temMaisProdutos && (

    <button
      className="btn-page"
      onClick={() => setPagina(pagina + 1)}
    >
      Próxima →
    </button>

  )}

</div>

{modalDelete && (

  <div className="modal-overlay">

    <div className="modal-delete">

      <h2>Excluir Produto</h2>

      <p>
        Deseja realmente excluir:
      </p>

      <strong>
        {produtoSelecionado?.nome}
      </strong>

      <div className="modal-actions">

        <button
          className="btn-cancelar"
          onClick={() => setModalDelete(false)}
        >
          Cancelar
        </button>

        <button
          className="btn-confirmar"
          onClick={excluir}
        >
          Excluir
        </button>

      </div>

    </div>

  </div>

)}

    </div>

  );

}

export default AdminProdutos;