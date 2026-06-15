import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./FuncionarioDashboard.css";

function FuncionarioDashboard() {

  const navigate = useNavigate();
  const [resumo, setResumo] = useState(null);

  const [banners, setBanners] = useState([]);
const [imagem, setImagem] = useState(null);
const [titulo, setTitulo] = useState("");

  useEffect(() => {
  carregarResumo();
}, []);


const carregarBanners = async () => {
  const res = await fetch("http://localhost:5000/api/banners");
  const data = await res.json();
  setBanners(data);
};

const enviarBanner = async () => {
  const formData = new FormData();
  formData.append("imagem", imagem);
  formData.append("titulo", titulo);

  const res = await fetch("http://localhost:5000/api/banners", {
    method: "POST",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    body: formData,
  });

  if (res.ok) {
    alert("Banner adicionado!");
    carregarBanners();
  } else {
    const erro = await res.json();
    alert(erro.error || "Erro ao enviar");
  }
};


const carregarResumo = async () => {

  const resposta = await fetch(
    "http://localhost:5000/api/funcionario/resumo",
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }
  );

  const dados = await resposta.json();

  setResumo(dados);
};

  return (
    <div className="funcionario-container">

      <div className="topo-dashboard">
        <button
          className="btn-voltarr"
          onClick={() => navigate(-1)}
        >
          ← Voltar
        </button>

        <div>
          <h1>Painel do Funcionário</h1>
          <p>
            Gerencie lojas, acompanhe vendas e monitore o crescimento do marketplace.
          </p>
        </div>
      </div>

      <div className="resumo-dashboard">

        <div className="resumo-card">
          <h3>🏪 Lojas Cadastrada</h3>
          <span>{resumo?.totalLojas || 0}</span>
        </div>

        

        <div className="resumo-card">
          <h3>💰 Valor</h3>
          <span>R$ {(resumo?.ganhos || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2
    })}</span>
        </div>

        <div className="resumo-card">
          <h3>📈 Crescimento</h3>
          <span>{resumo?.crescimento || 0}%</span>
        </div>

      </div>


      <div className="cards-dashboard">
      <div className="card-funcionario" onClick={() => navigate("/gerenciar-banners")}>
  <div className="icone-card">🖼️</div>
  <h2>Gerenciar Banners</h2>
  <p>Cadastre e remova banners promocionais da Home.</p>
  <button>Acessar</button>
</div>

        

        <div className="card-funcionario">
          <div className="icone-card">🏪</div>
          <h2>Minhas Lojas</h2>
          <p>
            Visualize todas as lojas cadastradas e acompanhe suas atividades.
          </p>
          <button
    onClick={() => navigate("/minhas-lojas")}
  >
    Visualizar
  </button>
        </div>

        <div className="card-funcionario"
        onClick={() => navigate("/cadastrar-loja")}>
          <div className="icone-card">➕</div>
          <h2>Cadastrar Loja</h2>
          <p>
            Crie novas lojas e configure seus limites de produtos.
          </p>
          <button>Cadastrar</button>
        </div>

        

        <div className="card-funcionario">
          <div className="icone-card">⭐</div>
          <h2>Top Lojas</h2>
          <p>
            Ranking das lojas com melhor desempenho no marketplace.
          </p>
          <button
            onClick={() => navigate("/top-lojas")}
          >
            Visualizar
            </button>
        </div>

      </div>

    </div>
  );
}

export default FuncionarioDashboard;