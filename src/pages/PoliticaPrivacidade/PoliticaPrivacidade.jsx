import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PoliticaPrivacidade.css';

export default function PoliticaPrivacidade() {
  const navigate = useNavigate();

  return (
    <div className="politica-container">
      <div className="politica-card">
        <button className="btn-voltar-politica" onClick={() => navigate(-1)}>
          ← Voltar
        </button>

        <h1>Política de Privacidade — Vandora - AC</h1>
        <p className="ultima-atualizacao">Última atualização: 04 de agosto de 2026</p>

        <p>
          Bem-vindo ao <strong>Vandora - AC</strong>. A sua privacidade e a segurança dos seus dados são fundamentais para nós. 
          Esta Política de Privacidade explica de forma transparente como coletamos, usamos, armazenamos e protegemos as suas 
          informações quando você utiliza nossa plataforma de marketplace.
        </p>

        <h2>1. Informações que Coletamos</h2>
        <p>Para que o marketplace funcione perfeitamente tanto para compradores quanto para lojistas, coletamos os seguintes dados:</p>
        <ul>
          <li><strong>Dados Cadastrais:</strong> Nome de usuário, nome completo, e-mail, telefone, CPF/CNPJ e data de nascimento.</li>
          <li><strong>Dados de Acesso:</strong> Credenciais de login protegidas com criptografia de ponta (senhas com hash seguro).</li>
          <li><strong>Dados de Lojas (Lojistas):</strong> Nome da loja, categoria de atuação e imagens de perfil/banner.</li>
          <li><strong>Mensagens e Anexos (Chat):</strong> O histórico de conversas trocadas no chat entre clientes e lojistas, incluindo imagens de produtos e comprovantes de pagamento enviados na plataforma.</li>
          <li><strong>Dados de Navegação e Cookies:</strong> Informações de uso coletadas por cookies para manter sua sessão ativa e melhorar a navegação.</li>
        </ul>

        <h2>2. Como Utilizamos Seus Dados</h2>
        <p>Os dados coletados são utilizados exclusivamente para as seguintes finalidades no Vandora - AC:</p>
        <ul>
          <li>Permitir o cadastro e a autenticação segura de clientes, lojistas e administradores.</li>
          <li>Possibilitar a negociação direta, o suporte e o envio de comprovantes via chat em tempo real entre cliente e loja.</li>
          <li>Garantir a segurança contra fraudes e acessos não autorizados na plataforma.</li>
          <li>Gerenciar o catálogo de produtos e os pedidos realizados no marketplace.</li>
        </ul>

        <h2>3. Uso de Cookies</h2>
        <p>
          Utilizamos cookies para otimizar a sua experiência no site, lembrar suas credenciais de login e entender como você utiliza o sistema. 
          Ao continuar navegando no Vandora - AC, você concorda com o uso de cookies. Você pode desativá-los no seu navegador, 
          mas isso pode impedir o funcionamento correto do login e do chat.
        </p>

        <h2>4. Armazenamento e Segurança</h2>
        <p>
          Adotamos rigorosas práticas de segurança da informação (como limites de tentativas de acesso, criptografia de senhas e rotas protegidas por tokens JWT) 
          para garantir que seus dados estejam seguros contra vazamentos ou acessos não autorizados.
        </p>

        <h2>5. Compartilhamento de Informações</h2>
        <p>
          O Vandora - AC <strong>não comercializa</strong> dados de usuários. O compartilhamento de informações ocorre estritamente:
        </p>
        <ul>
          <li>Entre o cliente e o lojista envolvido em uma negociação de compra, para viabilizar o atendimento e a entrega.</li>
          <li>Por exigência legal, ordem judicial ou requisição de autoridades competentes.</li>
        </ul>

        <h2>6. Seus Direitos (LGPD)</h2>
        <p>Como usuário do Vandora - AC, você tem o direito de:</p>
        <ul>
          <li>Acessar e atualizar os seus dados cadastrais a qualquer momento no seu perfil.</li>
          <li>Solicitar informações sobre o tratamento dos seus dados.</li>
          <li>Solicitar a exclusão da sua conta e dados associados, respeitando as obrigações legais de retenção.</li>
        </ul>

        <h2>7. Contato</h2>
        <p>
          Se tiver dúvidas, sugestões ou solicitações referentes a esta Política de Privacidade, entre em contato com a administração 
          do Vandora - AC através dos canais oficiais de suporte da plataforma.
        </p>
      </div>
    </div>
  );
}