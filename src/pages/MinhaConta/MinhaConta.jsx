import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./MinhaConta.css";
import { API_URL } from "../../apiConfig";
function MinhaConta() {

    const navigate = useNavigate();
    const { id } = useParams();

    const [usuario, setUsuario] = useState({});
    const [totalPedidos, setTotalPedidos] = useState(0);

    useEffect(() => {

        carregarUsuario();
        carregarPedidos();

    }, []);

    const carregarUsuario = async () => {

        try {

            const resposta = await fetch(
                `${API_URL}/api/perfil-cliente/${id}`,
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

    const carregarPedidos = async () => {

        try {

            const resposta = await fetch(
                `${API_URL}/api/perfil-cliente/${id}/pedidos`,
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

    return (

        <div className="conta-container">

    <button
        className="conta-btn-voltar"
        onClick={() => navigate(-1)}
    >
        ← Voltar
    </button>

    <div className="conta-banner"></div>

    <div className="conta-card">

        <div className="conta-avatar">

            {usuario.imagem_perfil ? (

                <img
                    src={usuario.imagem}
                    alt={usuario.nome}
                    className="conta-foto"
                />

            ) : (

                <div className="conta-letra">
                    {usuario.username?.charAt(0).toUpperCase()}
                </div>

            )}

        </div>

        <div className="conta-badge">
            Cliente
        </div>

        <h1 className="conta-nome">
            {usuario.username}
        </h1>

        <p className="conta-membro">
            Membro desde{" "}
            {usuario.created_at
                ? new Date(usuario.created_at)
                    .toLocaleDateString("pt-BR")
                : "-"}
        </p>

    </div>

    <div className="conta-grid">

        <div className="conta-box">

            <span className="conta-icone">
                📦
            </span>

            <h2>
                {totalPedidos}
            </h2>

            <p>
                Pedidos Realizados
            </p>

        </div>

        <div className="conta-box">

            <span className="conta-icone">
                🗓️
            </span>

            <h2>
                {usuario.created_at
                    ? new Date(usuario.created_at)
                        .getFullYear()
                    : "-"}
            </h2>

            <p>
                Ano de Cadastro
            </p>

        </div>

    </div>

    <div className="conta-info-card">

        <h3>
            Informações do Cliente
        </h3>

        <div className="conta-info-item">

            <span>Nome</span>

            <strong>
                {usuario.username}
            </strong>

        </div>

        <div className="conta-info-item">

            <span>ID do Cliente</span>

            <strong>
                #{usuario.id}
            </strong>

        </div>

        <div className="conta-info-item">

            <span>Pedidos</span>

            <strong>
                {totalPedidos}
            </strong>

        </div>

    </div>

</div>

    );

}

export default MinhaConta;