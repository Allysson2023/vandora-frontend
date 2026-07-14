import { useState, useEffect } from "react";
import "./CadastrarProduto.css";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../apiConfig";

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
  const [subcategoriasDisponiveis, setSubcategoriasDisponiveis] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
    .then(res => res.json())
    .then(data => {
        // Garante que é um array, mesmo que venha vazio
        setCategorias(Array.isArray(data) ? data : []);
    })
    .catch(err => console.error("Erro ao carregar categorias:", err));
}, []);

  const uploadImagemSeguro = async (file) => {
    if (!file) return null; // Se não tem imagem, retorna null
    if (typeof file === "string") return file; // Se já for URL, retorna ela mesma

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`${API_URL}/api/upload-image`, { method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}`
      }, body: formData });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Falha no upload");
    return data.url; 
  };

async function cadastrarProduto(e) {
  e.preventDefault();

  const idNumerico = parseInt(categoryId);
  if (!categoryId || isNaN(idNumerico)) {
    setMensagem("Por favor, selecione uma subcategoria válida antes de cadastrar.");
    return; // Interrompe a execução
  }
  
  try {
    // 1. Upload das imagens
    const url1 = await uploadImagemSeguro(imagem);
    const url2 = await uploadImagemSeguro(imagem2);
    const url3 = await uploadImagemSeguro(imagem3);

    // 2. Construção do objeto de dados
    // Certifique-se de que 'categoryId' (do useState) está populado
    const dadosDoProduto = {
      nome: nome, 
      descricao: descricao, 
      preco: preco, 
      preco_antigo: precoAntigo,
      estoque: estoque,
      category_id: idNumerico,
      imagem: url1,
      imagem2: url2,
      imagem3: url3
    };

    // 3. Envio para o backend
    const resposta = await fetch(`${API_URL}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(dadosDoProduto)
    });
    
    const result = await resposta.json();

    if (resposta.ok) {
      setModalSucesso(true);
      // Limpeza dos campos
      setNome("");
      setDescricao("");
      setPreco("");
      setPrecoAntigo("");
      setEstoque("");
      setCategoryId(""); // Limpa o estado
      setSubcategoriasDisponiveis([]); // Limpa as subcategorias
      setImagem(null);
      setImagem2(null);
      setImagem3(null);
    } else {
      setMensagem(result.message || "Erro ao cadastrar produto");
    }
  } catch (erro) {
    setMensagem("Erro ao cadastrar produto");
    console.error("Erro completo:", erro);
  }
}

  return (
    <div className="cadastro-produto">

      {modalSucesso && (

  <div className="modal-overlay">
    <div className="modal-sucesso">

      <div className="icone-sucesso"> ✓ </div>

      <h2>Produto cadastrado!</h2>

      <p>Seu produto foi cadastrado com sucesso. </p>

      <button onClick={() => setModalSucesso(false)}> Fechar </button>

  </div> </div>)}

      <form onSubmit={cadastrarProduto} className="form-produto">

        <h2>Cadastrar Produto</h2>

        {mensagem && (
          <div className="mensagem-sucesso"> {mensagem} </div> )}

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

        <input type="text"
          placeholder="Nome do produto" value={nome}
          onChange={(e) => setNome(e.target.value)} />

        <textarea
          placeholder="Descrição do produto"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}/>

        <input type="number"
          placeholder="Preço antigo"
          value={precoAntigo}
          onChange={(e) => setPrecoAntigo(e.target.value)}/>

        <input type="number"
          placeholder="Preço" value={preco}
          onChange={(e) => setPreco(e.target.value)} />

        <input type="number"
          placeholder="Quantidade em estoque"
          value={estoque}
          onChange={(e) => setEstoque(e.target.value)}/>

        {/* Select 1: Departamento */}
<select 
  onChange={(e) => {
    const depSelecionado = categorias?.find(c => c.nome === e.target.value);
    setSubcategoriasDisponiveis(depSelecionado?.subcategorias || []);
    setCategoryId(""); 
  }}
>
  <option value="">Selecione um Departamento</option>
  {categorias?.map(cat => (
    <option key={cat.id} value={cat.nome}>{cat.nome}</option>
  ))}
</select>

{/* Select 2: Subcategoria */}
<select 
  value={categoryId} 
  onChange={(e) => setCategoryId(e.target.value)}
  disabled={!subcategoriasDisponiveis || subcategoriasDisponiveis.length === 0}
>
  <option value="">Selecione uma Subcategoria</option>
  {subcategoriasDisponiveis?.map(sub => (
    <option key={sub.id} value={sub.id}>
      {sub.nome}
    </option>
  ))}
</select>



        <div className="botoes-form">

          <button type="button"
            className="btn-voltar"
            onClick={() => navigate(-1)} >
            Voltar
          </button>

          <button type="submit" disabled={!categoryId}>
  Cadastrar
</button>

        </div>

      </form>

    </div>
  );
}

export default CadastrarProduto;