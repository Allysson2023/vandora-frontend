import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import './EditarProduto.css'
import { API_URL } from "../../apiConfig";

function EditarProduto() {

  const { id } = useParams();
  const navigate = useNavigate();
  const [produto, setProduto] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [imagem1, setImagem1] = useState(null);
const [imagem2, setImagem2] = useState(null);
const [imagem3, setImagem3] = useState(null);
const [showModal, setShowModal] = useState(false);

const API_URL = `${API_URL}`;

  useEffect(() => {

  fetch(`${API_URL}/api/products/${id}`)
    .then(res => res.json())
    .then(data => {
      setProduto(data);

      setImagem1(data.imagem ? `${API_URL}/${data.imagem}` : null);
      setImagem2(data.imagem2 ? `${API_URL}/${data.imagem2}` : null);
      setImagem3(data.imagem3 ? `${API_URL}/${data.imagem3}` : null);
    });

}, [id]);

  useEffect(() => {

  fetch(`${API_URL}/api/categories`)
    .then(res => res.json())
    .then(data => setCategorias(data))
    .catch(err => console.log(err));

}, []);

  if (!produto) return <p>Carregando...</p>;
  

  const confirmarSalvar = async () => {
  const token = localStorage.getItem("token");
  const formData = new FormData();

  formData.append("nome", produto.nome);
  formData.append("descricao", produto.descricao);
  formData.append("preco", produto.preco);
  formData.append("preco_antigo", produto.preco_antigo || "");
  formData.append("estoque", produto.estoque);
  
  // CORREÇÃO AQUI: enviar category_id (usando o ID da categoria)
  formData.append("category_id", produto.category_id || "");

  if (imagem1 instanceof File) formData.append("imagem", imagem1);
  if (imagem2 instanceof File) formData.append("imagem2", imagem2);
  if (imagem3 instanceof File) formData.append("imagem3", imagem3);

  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });

  if (!res.ok) {
    const errorData = await res.json();
    alert("Erro ao salvar: " + errorData.message);
    return;
  }
  alert("Produto atualizado!");
};

  return (

    <div>

      <button
      className="btn-back"
      onClick={() => navigate(-1)}
    >
      ← Voltar
    </button>

      <div className="edit-container">

  <h1>Editar Produto</h1>

<div className="form-group">
  <label>Imagem 1</label>

  {imagem1 && (
  <img
    src={typeof imagem1 === "string" ? imagem1 : URL.createObjectURL(imagem1)}
    className="preview"
    alt="imagem1"
  />
)}

  <input
    type="file"
    onChange={(e) => setImagem1(e.target.files[0])}
  />
</div>

<div className="form-group">
  <label>Imagem 2</label>

  {imagem2 && (
    <img src={typeof imagem2 === "string" ? imagem2 : URL.createObjectURL(imagem2)} className="preview" />
  )}

  <input
    type="file"
    onChange={(e) => setImagem2(e.target.files[0])}
  />
</div>

<div className="form-group">
  <label>Imagem 3</label>

  {imagem3 && (
    <img src={typeof imagem3 === "string" ? imagem3 : URL.createObjectURL(imagem3)} className="preview" />
  )}

  <input
    type="file"
    onChange={(e) => setImagem3(e.target.files[0])}
  />
</div>



  <div className="form-group">
    <label>Nome</label>
    <input value={produto.nome}
      onChange={(e) =>
        setProduto({ ...produto, nome: e.target.value })
      }
    />
  </div>

  <div className="form-group">
    <label>Descrição</label>
    <textarea
  value={produto.descricao || ""}
  onChange={(e) =>
    setProduto({ ...produto, descricao: e.target.value })
  }
    />
  </div>

  <div className="form-group">
    <label>Preço</label>
    <input
  type="number"
  step="0.01"
  value={produto.preco}
      onChange={(e) =>
        setProduto({ ...produto, preco: e.target.value })
      }
    />
  </div>

  <div className="form-group">
    <label>Preço Antigo</label>
    <input
  type="number"
  step="0.01"
  value={produto.preco_antigo || ""}
      onChange={(e) =>
        setProduto({ ...produto, preco_antigo: e.target.value })
      }
    />
  </div>

  <div className="form-group">
    <label>Estoque</label>
    <input
  type="number"
  value={produto.estoque}
      onChange={(e) =>
        setProduto({ ...produto, estoque: e.target.value })
      }
    />
  </div>

  <div className="form-group">
  <label>Categoria</label>
  <select
    required
    value={produto.category_id || ""}
    onChange={(e) =>
      // CORREÇÃO: Atualize a chave 'category_id', não 'categoria'
      setProduto({ ...produto, category_id: e.target.value })
    }
  >
    <option value="">Selecione uma categoria</option>
    {categorias.map((categoria) => (
      <option
        key={categoria.id}
        value={categoria.id} // CORREÇÃO: O value do option deve ser o ID
      >
        {categoria.nome}
      </option>
    ))}
  </select>
</div>

  <button className="btn-save" onClick={() => setShowModal(true)}>
  Salvar
</button>

</div>

{showModal && (
  <div className="modal-overlay">
    <div className="modal-box">

      <h2>Confirmar alteração</h2>
      <p>Tem certeza que deseja salvar as alterações do produto?</p>

      <div className="modal-actions">

        <button
          className="btn-cancel"
          onClick={() => setShowModal(false)}
        >
          Cancelar
        </button>

        <button
          className="btn-confirm"
          onClick={async () => {
            await confirmarSalvar();
            setShowModal(false);
          }}
        >
          Sim, salvar
        </button>

      </div>

    </div>
  </div>
)}

    </div>

  );

}

export default EditarProduto;