import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PerfilCliente.css";
import { API_URL } from "../../apiConfig";
function PerfilCliente() {
  const navigate = useNavigate();

  const [totalPedidos, setTotalPedidos] = useState(0);

  const [usuario, setUsuario] = useState({
    id: "",
    username: "",
    email: "",
    created_at: ""
  });

  const [modalSair, setModalSair] = useState(false);

  const [totalFavoritos, setTotalFavoritos] = useState(0);

  useEffect(() => {
    carregarPerfil();
    carregarPedidos();
  carregarFavoritos();
  }, []);

  const carregarPedidos = async () => {
    try {
      const resposta = await fetch(
        `${API_URL}/api/meus-pedidos`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      const dados = await resposta.json();

      if (Array.isArray(dados)) {
        setTotalPedidos(dados.length);
      }
    } catch (erro) {
      console.log(erro);
    }
  };

  const carregarFavoritos = async () => {

  try {

    const resposta = await fetch(
      `${API_URL}/api/favoritos/quantidade`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    const dados = await resposta.json();

    setTotalFavoritos(dados.total);

  } catch (erro) {

    console.log(erro);

  }

};


  const carregarPerfil = async () => {
    try {
      const resposta = await fetch(
        `${API_URL}/api/client-profile`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      const dados = await resposta.json();

      setUsuario(dados);
    } catch (erro) {
      console.log(erro);
    }
  };

  const sairDaConta = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("boasVindas");
    navigate("/login");
  };

  return (
    <div className="perfil-cliente">

      <div className="topo-perfil">
        <button
          className="btn-voltar-perfil"
          onClick={() => navigate(-1)}
        >
          ← Voltar
        </button>
      </div>

      <div className="card-perfil">

        <div className="avatar">

  {usuario.imagem_perfil ? (

    <img
      src={`${API_URL}/uploads/perfil/${usuario.imagem_perfil}`}
      alt="Foto de Perfil"
      className="foto-perfil"
    />

  ) : (

    usuario.username?.charAt(0).toUpperCase()

  )}

</div>

        <h2 className="titulo-perfil">
          Olá, {usuario.username} 👋
        </h2>

        <p className="email-perfil">
          {usuario.email}
        </p>

        <span className="membro-desde">
          Membro desde{" "}
          {usuario.created_at
            ? new Date(usuario.created_at).toLocaleDateString("pt-BR")
            : "-"}
        </span>

        <div className="estatisticas">

          <div className="box-stat">
            <span className="icone-stat">📦</span>
            <h3>{totalPedidos}</h3>
            <p>Pedidos realizados</p>
          </div>

          <div className="box-stat">
            <span className="icone-stat">⭐</span>
            <h3>{totalFavoritos}</h3>
            <p>Favoritos</p>
          </div>

        </div>

        <div className="info-perfil">

          <div className="info-item">
            <span>Usuário</span>
            <strong>{usuario.username}</strong>
          </div>

          {/* Novos itens */}
    <div className="info-item">
        <span>Nome Completo</span>
        <strong>{usuario.nome_completo || "Não informado"}</strong>
    </div>

    <div className="info-item">
        <span>E-mail</span>
        <strong>{usuario.email}</strong>
    </div>

    <div className="info-item">
        <span>Telefone</span>
        <strong>{usuario.telefone || "Não informado"}</strong>
    </div>

    <div className="info-item">
        <span>Data de Nascimento</span>
        <strong>
            {usuario.data_nascimento 
                ? new Date(usuario.data_nascimento).toLocaleDateString("pt-BR") 
                : "Não informado"}
        </strong>
    </div>

    <div className="info-item">
        <span>CPF/CNPJ</span>
        <strong>{usuario.cpf_cnpj || "Não informado"}</strong>
    </div>

          <div className="info-item">
            <span>Conta criada em</span>
            <strong>
              {usuario.created_at
                ? new Date(usuario.created_at).toLocaleDateString("pt-BR")
                : "-"}
            </strong>
          </div>

        </div>

        <button
          className="btn-editar"
          onClick={() =>
            navigate(`/atualizar-cliente/${usuario.id}`)
          }
        >
          Editar Perfil
        </button>

        <button
          className="btn-sair"
          onClick={() => setModalSair(true)}
        >
          Sair da Conta
        </button>

      </div>

      {modalSair && (
        <div className="perfil-modal-overlay">
 
          <div className="perfil-modal-sair">

            <h3>Sair da conta</h3>

            <p>
              Tem certeza que deseja sair da sua conta?
            </p>

            <div className="perfil-modal-botoes">

              <button
                className="perfil-btn-cancelar"
                onClick={() => setModalSair(false)}
              >
                Cancelar
              </button>

              <button
                className="perfil-btn-confirmar"
                onClick={sairDaConta}
              >
                Sim, sair
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default PerfilCliente;