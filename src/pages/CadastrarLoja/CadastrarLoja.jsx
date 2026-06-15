import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CadastrarLoja.css";

function CadastrarLoja() {

  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [imagem, setImagem] = useState(null);
  const [username, setUsername] = useState("");
const [password, setPassword] = useState("");

const [mostrarModal, setMostrarModal] = useState(false);

const [erroModal, setErroModal] = useState(false);
const [mensagemErro, setMensagemErro] = useState("");

const [dadosLojista, setDadosLojista] = useState({
  loja: "",
  username: "",
  password: ""
});

  // NOVO
  const [whatsapp, setWhatsapp] = useState("");

  const navigate = useNavigate();

  useEffect(() => {

    fetch("http://localhost:5000/api/categories")
    .then(res => res.json())
    .then(data => setCategorias(data));

  }, []);

  function copiarDados() {

  const texto = `
Loja: ${dadosLojista.loja}

Usuário: ${dadosLojista.username}

Senha: ${dadosLojista.password}
`;

  navigator.clipboard.writeText(texto);

  alert("Dados copiados!");
}
 

  function cadastrarLoja(e){

    e.preventDefault();

    const formData = new FormData();

    formData.append("nome", nome);
    formData.append("categoria", categoria);
    formData.append("imagem", imagem);

    // NOVO
    formData.append("whatsapp", whatsapp);
formData.append("username", username);
formData.append("password", password);

    fetch("http://localhost:5000/api/stores", {

      method: "POST",

      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },

      body: formData

    })
    .then(res => res.json())
    .then(data => {

  if(data.message !== "Loja criada com sucesso"){

    setMensagemErro(data.message);
    setErroModal(true);

    return;
  }

  setDadosLojista({
    loja: nome,
    username,
    password
  });

  setMostrarModal(true);

})
.catch(() => {

  setMensagemErro("Erro ao conectar com o servidor.");
  setErroModal(true);

});

  }
const formularioValido =
  nome.trim() &&
  categoria.trim() &&
  whatsapp.trim() &&
  username.trim() &&
  password.trim() &&
  imagem;



  return ( 

    <div className="cadastro-loja">
      <button
  type="button"
  className="btn-voltarw"
  onClick={() => navigate(-1)}
>
  ← Voltar
</button>

      <form
        onSubmit={cadastrarLoja}
        className="form-loja"
      >

       <div className="topo-form">
  <h2>Cadastrar Loja</h2>
  <p>
    Crie uma nova loja para começar a vender no marketplace.
  </p>
</div>

        <input
          type="text"
          placeholder="Nome da loja"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />



        {/* NOVO CAMPO */}
        <input
          type="text"
          placeholder="WhatsApp da loja"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
        />




        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >

          <option value="">
            Escolha uma categoria
          </option>

          {categorias.map(cat => (

            <option
              key={cat.id}
              value={cat.nome}
            >
              {cat.nome}
            </option>

          ))}

        </select>




        <input
          type="file"
          onChange={(e) => setImagem(e.target.files[0])}
        />

<input
  type="text"
  placeholder="Usuário do lojista"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
/>

<input
  type="password"
  placeholder="Senha do lojista"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>

        <button type="submit"
        disabled={!formularioValido}
        >
          Criar Loja
        </button>

      </form>

      {
  mostrarModal && (

    <div className="modal-overlay">

      <div className="modal-lojista">

        <h2>✅ Loja criada com sucesso</h2>

        <div className="info-modal">
          <strong>Loja:</strong>
          <span>{dadosLojista.loja}</span>
        </div>

        <div className="info-modal">
          <strong>Usuário:</strong>
          <span>{dadosLojista.username}</span>
        </div>

        <div className="info-modal">
          <strong>Senha:</strong>
          <span>{dadosLojista.password}</span>
        </div>

        <div className="acoes-modal">

          <button
            className="btn-copiar"
            onClick={copiarDados}
          >
            📋 Copiar Dados
          </button>

          <button
            className="btn-fechar"
            onClick={() => {

              setMostrarModal(false);

              navigate("/funcionario/dashboard");

            }}
          >
            Fechar
          </button>

        </div>

      </div>

    </div>

  )
}
{
  erroModal && (

    <div className="modal-overlay">

      <div className="modal-lojista erro">

        <h2>❌ Erro</h2>

        <p>{mensagemErro}</p>

        <button
          className="btn-fechar"
          onClick={() => setErroModal(false)}
        >
          Fechar
        </button>

      </div>

    </div>

  )
}

    </div>

  );

}

export default CadastrarLoja;