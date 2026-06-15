import { useState, useEffect } from "react";
import "./CadastrarProduto.css";
import { useNavigate } from "react-router-dom";

function CadastrarProduto() {

  const navigate = useNavigate();
 
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [mensagem, setMensagem] = useState("")
  const [descricao, setDescricao] = useState("");
  const [precoAntigo, setPrecoAntigo] = useState("");
  const [estoque, setEstoque] = useState("");
  const [imagem, setImagem] = useState(null);
  const [imagem2, setImagem2] = useState(null);
  const [imagem3, setImagem3] = useState(null);
  const [modalSucesso, setModalSucesso] = useState(false);
  useEffect(() => {

    fetch("http://localhost:5000/api/categories")
    .then(res => res.json())
    .then(data => setCategorias(data));

  }, []);

async function cadastrarProduto(e) {

  e.preventDefault();

  try {

    const formData = new FormData();

    formData.append("nome", nome);
    formData.append("descricao", descricao);
    formData.append("preco", preco);
    formData.append("preco_antigo", precoAntigo);
    formData.append("estoque", estoque);
    formData.append("category_id", categoryId);

    if (imagem) {
      formData.append("imagem", imagem);
    }

    if (imagem2) {
      formData.append("imagem2", imagem2);
    }

    if (imagem3) {
      formData.append("imagem3", imagem3);
    }

    const resposta = await fetch(
      "http://localhost:5000/api/products",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },

        body: formData
      }
    );

    const data = await resposta.json();

    if (resposta.ok) {

      setModalSucesso(true);

      setNome("");
      setDescricao("");
      setPreco("");
      setPrecoAntigo("");
      setEstoque("");
      setCategoryId("");

      setImagem(null);
      setImagem2(null);
      setImagem3(null);

    } else {
      setMensagem(data.message);
    }

  } catch (erro) {
    setMensagem("Erro ao cadastrar produto");
  }
}

  return (
    <div className="cadastro-produto">

      {modalSucesso && (

  <div className="modal-overlay">

    <div className="modal-sucesso">

      <div className="icone-sucesso">
        ✓
      </div>

      <h2>Produto cadastrado!</h2>

      <p>
        Seu produto foi cadastrado com sucesso.
      </p>

      <button
        onClick={() => setModalSucesso(false)}
      >
        Fechar
      </button>

    </div>

  </div>

)}

      <form onSubmit={cadastrarProduto} className="form-produto">

        <h2>Cadastrar Produto</h2>

        {mensagem && (
          <div className="mensagem-sucesso">
            {mensagem}
          </div>
        )}


      <p>Imagens do produto</p>
<div className="upload-container">
  <label className="input-file-custom">
    {imagem ? imagem.name : "Capa"}
    <input type="file" onChange={(e) => setImagem(e.target.files[0])} />
  </label>
  <label className="input-file-custom">
    {imagem2 ? imagem2.name : "Extra 1"}
    <input type="file" onChange={(e) => setImagem2(e.target.files[0])} />
  </label>
  <label className="input-file-custom">
    {imagem3 ? imagem3.name : "Extra 2"}
    <input type="file" onChange={(e) => setImagem3(e.target.files[0])} />
  </label>
</div>

        <input
          type="text"
          placeholder="Nome do produto"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <textarea
    placeholder="Descrição do produto"
    value={descricao}
    onChange={(e) => setDescricao(e.target.value)}
/>

<input
    type="number"
    placeholder="Preço antigo"
    value={precoAntigo}
    onChange={(e) => setPrecoAntigo(e.target.value)}
/>

        <input
          type="number"
          placeholder="Preço"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
        />

<input
    type="number"
    placeholder="Quantidade em estoque"
    value={estoque}
    onChange={(e) => setEstoque(e.target.value)}
/>

        <select
  value={categoryId} 
  onChange={(e) => setCategoryId(e.target.value)} // Corrigido para setCategoryId
>
  <option value="">
    Escolha uma categoria
  </option>

  {categorias.map(cat => (
    <option
      key={cat.id}
      value={cat.id} // Corrigido para cat.id
    >
      {cat.nome}
    </option>
  ))}
</select>

        <div className="botoes-form">

          <button
            type="button"
            className="btn-voltar"
            onClick={() => navigate(-1)}
          >
            Voltar
          </button>

          <button type="submit">
            Cadastrar
          </button>

        </div>

      </form>

    </div>
  );
}

export default CadastrarProduto;