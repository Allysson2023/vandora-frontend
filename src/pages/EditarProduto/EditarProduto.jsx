import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import './EditarProduto.css';
import { API_URL } from "../../apiConfig";

function EditarProduto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [produto, setProduto] = useState(null);
  const [categorias, setCategorias] = useState([]);
  
  // Estados para as imagens (Podem ser File ou String)
  const [imagem1, setImagem1] = useState(null);
  const [imagem2, setImagem2] = useState(null);
  const [imagem3, setImagem3] = useState(null);
  
  const [showModal, setShowModal] = useState(false);

  // Função central para enviar ao ImgBB
  const uploadImagemSeguro = async (file) => {
    // Se já for string (link do banco), não precisa subir de novo
    if (typeof file === "string") return file;
    // Se não tiver imagem, retorna null
    if (!file) return null;

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`${API_URL}/api/upload-image`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
    });

    const data = await res.json();
    return data.url; // Retorna a URL que veio do seu backend
};

  useEffect(() => {
    fetch(`${API_URL}/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduto(data);
        setImagem1(data.imagem);
        setImagem2(data.imagem2);
        setImagem3(data.imagem3);
      });
  }, [id]);

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then(res => res.json())
      .then(data => setCategorias(data));
  }, []);

  const confirmarSalvar = async () => {
    const token = localStorage.getItem("token");

    // 1. Faz upload das imagens (só envia se for File, se for string já retorna a URL)
    const url1 = await uploadImagemSeguro(imagem1);
  const url2 = await uploadImagemSeguro(imagem2);
  const url3 = await uploadImagemSeguro(imagem3);

    // 2. Monta o objeto final para o banco
    const dadosAtualizados = {
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
      preco_antigo: produto.preco_antigo,
      estoque: produto.estoque,
      category_id: produto.category_id,
      destaque: produto.destaque,
      // Agora salvamos as URLs (novas ou as antigas que já estavam lá)
      imagem: url1,
      imagem2: url2,
      imagem3: url3
    };

    // 3. Envia via JSON
    const res = await fetch(`${API_URL}/api/products/${id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify(dadosAtualizados)
    });

    if (!res.ok) {
      const errorData = await res.json();
      alert("Erro ao salvar: " + errorData.message);
      return;
    }
    
    alert("Produto atualizado!");
    navigate(-1);
};

  if (!produto) return <p>Carregando...</p>;

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

{/* IMAGEM 1 */}
<div className="form-group">
  <label>Imagem 1</label>
  <div className="preview-container">
    <label htmlFor="input-img1" style={{ cursor: 'pointer' }}>
      <img
        src={typeof imagem1 === "string" ? imagem1 : URL.createObjectURL(imagem1)}
        className="preview"
        alt="imagem1"
        title="Clique para trocar a imagem"
      />
    </label>
    <input
      id="input-img1"
      type="file"
      accept="image/*"
      style={{ display: 'none' }}
      onChange={(e) => {
        if (e.target.files && e.target.files[0]) {
          setImagem1(e.target.files[0]); // CORRETO: usa setImagem1
        }
      }}
    />
  </div>
</div>

{/* IMAGEM 2 */}
<div className="form-group">
  <label>Imagem 2</label>
  <div className="preview-container">
    <label htmlFor="input-img2" style={{ cursor: 'pointer' }}>
      <img
        src={typeof imagem2 === "string" ? imagem2 : URL.createObjectURL(imagem2)}
        className="preview"
        alt="imagem2"
        title="Clique para trocar a imagem"
      />
    </label>
    <input
      id="input-img2"
      type="file"
      accept="image/*"
      style={{ display: 'none' }}
      onChange={(e) => {
        if (e.target.files && e.target.files[0]) {
          setImagem2(e.target.files[0]); // CORRIGIDO: mudado para setImagem2
        }
      }}
    />
  </div>
</div>

{/* IMAGEM 3 */}
<div className="form-group">
  <label>Imagem 3 </label>
  <div className="preview-container">
    <label htmlFor="input-img3" style={{ cursor: 'pointer' }}>
      <img
        src={typeof imagem3 === "string" ? imagem3 : URL.createObjectURL(imagem3)}
        className="preview"
        alt="imagem3"
        title="Clique para trocar a imagem"
      />
    </label>
    <input
      id="input-img3"
      type="file"
      accept="image/*"
      style={{ display: 'none' }}
      onChange={(e) => {
        if (e.target.files && e.target.files[0]) {
          setImagem3(e.target.files[0]); // CORRIGIDO: mudado para setImagem3
        }
      }}
    />
  </div>
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

<div className="form-group" style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "15px" }}>
  <label style={{ margin: 0 }}>Destaque no Carrossel:</label>
  <input
    type="checkbox"
    style={{ width: "auto", height: "auto" }}
    checked={!!produto.destaque} // Converte 0/1 para booleano
    onChange={(e) => 
      setProduto({ ...produto, destaque: e.target.checked ? 1 : 0 })
    }
  />
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