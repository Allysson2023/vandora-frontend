import React from 'react';
import { useNavigate } from 'react-router-dom';
import './About.css';

function About() {
  const navigate = useNavigate();

  return (
    <div className="about-wrapper">

        {/* Botão de voltar posicionado no topo */}
      <button className="about-back-btn" onClick={() => navigate("/")}>
        ← Voltar para o início
      </button>
      
      <header className="about-hero">
        <h1>Vandora: O Eixo que Move sua Cidade.</h1>
        <p>Transformamos a forma como você compra, vende e se conecta.</p>
      </header>

      <section className="about-grid">
        <div className="about-card">
          <div className="icon">🚀</div>
          <h3>Para Clientes</h3>
          <p>Encontre exclusividade e agilidade. Ao comprar na Vandora, você fortalece o comércio local e recebe tudo no conforto do seu lar.</p>
        </div>
        <div className="about-card">
          <div className="icon">💼</div>
          <h3>Para Lojistas</h3>
          <p>Sua loja, seu palco. Damos o poder da tecnologia para que você escale suas vendas, gerencie pedidos e alcance novos horizontes.</p>
        </div>
        <div className="about-card">
          <div className="icon">🤝</div>
          <h3>Nosso Propósito</h3>
          <p>Acreditamos que o comércio fortalece laços. Criamos um ecossistema digital onde todos crescem juntos e com transparência.</p>
        </div>
      </section>

      <div className="about-cta">
        <h2>Pronto para fazer parte dessa história?</h2>
        <button onClick={() => navigate("/cadastro")}>Começar Agora</button>
      </div>
    </div>
  );
}

export default About;