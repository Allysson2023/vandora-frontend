import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../apiConfig";
import "./Barbearias.css"; // Importando o CSS dedicado

function Barbearias() {
  const [barbearias, setBarbearias] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API_URL}/api/barbearias`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setBarbearias(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar barbearias:", err);
        setLoading(false);
      });
  }, [token]);

  return (
    <div className="barbearias-page">
      {/* Topo / Header da Página */}
      <div className="barbearias-header">
        <button className="btn-voltar-home" onClick={() => navigate("/")}>
          ← Voltar para a Home
        </button>
        <div className="header-titles">
          <h1>✂️ Barbearias & Cortes</h1>
          <p>Escolha o seu estilo, agende seu horário com os melhores profissionais e evite filas.</p>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="barbearias-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando barbearias disponíveis...</p>
          </div>
        ) : barbearias.length === 0 ? (
  <div className="empty-state">
    <div className="empty-icon-wrapper">
      <span>💈</span>
    </div>
    <h3>Nenhuma barbearia ativa no momento</h3>
    <p>Nosso sistema está operando em capacidade máxima. Novos estabelecimentos e barbeiros estão sendo integrados à plataforma.</p>
    <div className="empty-badge-tech">🚀 Sistema Pronto para Novas Lojas</div>
  </div>
) : (
          <div className="barbearias-grid">
            {barbearias.map((barbearia) => (
              <div 
                key={barbearia.id} 
                className="barber-card"
                onClick={() => navigate(`/barbearia/${barbearia.slug}`)}
              >
                <div className="card-image-wrapper">
                  <img 
                    src={barbearia.imagem_capa || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80"} 
                    alt={barbearia.nome} 
                  />
                  <span className="badge-status">Disponível</span>
                </div>
                
                <div className="card-content">
                  <h3>{barbearia.nome}</h3>
                  <p>{barbearia.descricao || "Cortes modernos, barba navalhada e um ambiente totalmente voltado para você."}</p>
                  
                  <button className="btn-agendar-barber">
                    Ver Horários & Agendar 🚀
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Barbearias;