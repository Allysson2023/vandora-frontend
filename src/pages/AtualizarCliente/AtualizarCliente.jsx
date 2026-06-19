import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AtualizarCliente.css";
import { API_URL } from "../../apiConfig";
function AtualizarCliente() {

    const navigate = useNavigate();
    const { id } = useParams();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [carregando, setCarregando] = useState(true);

    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    useEffect(() => {
        buscarCliente();
    }, []);
    const [usernameOriginal, setUsernameOriginal] = useState("");
    const [senhaAlterada, setSenhaAlterada] = useState(false);
    const [mostrarModal, setMostrarModal] = useState(false);

    const [imagem, setImagem] = useState(null);
    const [mostrarSenha, setMostrarSenha] = useState(false);

    const abrirConfirmacao = (e) => {
    e.preventDefault();

    setErro("");

    if (!username) {
        setErro("Preencha o usuário");
        return;
    }
    if (password.trim()) {

    if (password.length < 6) {
        setErro("A senha deve ter pelo menos 6 caracteres");
        return;
    }

    const senhaForte =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

    if (!senhaForte.test(password)) {
        setErro(
            "A senha deve conter letra maiúscula, minúscula e número"
        );
        return;
    }
}

    setMostrarModal(true);
};


    const buscarCliente = async () => {

        try {

            const token = localStorage.getItem("token");

const res = await fetch(
    `${API_URL}/api/users/${id}`,
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
);

            const data = await res.json();

            if (!res.ok) {
                setErro("Cliente não encontrado");
                return;
            }

            setUsername(data.username);
            setUsernameOriginal(data.username);

        } catch {
            setErro("Erro ao carregar cliente");
        } finally {
            setCarregando(false);
        }
    };

    const atualizar = async () => {

    setErro("");
    setSucesso("");

    try {

        setLoading(true);

        const formData = new FormData();

formData.append("username", username);

if (password.trim()) {
    formData.append("password", password);
}

if (imagem) {
    formData.append("imagem_perfil", imagem);
}

const token = localStorage.getItem("token");

const res = await fetch(
    `${API_URL}/api/users/${id}`,
    {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    }
);

        const data = await res.json();

        if (!res.ok) {
            setErro(data.error || "Erro ao atualizar");
            return;
        }

        setSucesso("Dados atualizados com sucesso!");

        localStorage.removeItem("token");

        setTimeout(() => {
            navigate("/login");
        }, 1200);

    } catch {

        setErro("Erro no servidor");

    } finally {

        setLoading(false);

    }
};
const houveAlteracao =
    username !== usernameOriginal ||
    senhaAlterada ||
    imagem;
    
    if (carregando) {
        return (
            <div className="atualizar-container">
                <div className="atualizar-form">
                    <h2>Carregando...</h2>
                </div>
            </div>
        );
    }

    return (

        <div className="atualizar-container">

            <form
                className="atualizar-form"
                onSubmit={abrirConfirmacao}
            >

                <h2>Atualizar Dados</h2>

                <p className="atualizar-subtitulo">
                    Atualize os dados da conta.
                </p>

                {imagem && (
    <img
        src={URL.createObjectURL(imagem)}
        alt="Preview"
        className="preview-foto"
    />
)}

                <input
    type="file"
    accept="image/*"
    capture="user"
    onChange={(e) => {
        setImagem(e.target.files[0]);
    }}
/>

                <input
                    type="text"
                    placeholder="Usuário"
                    value={username}
                    onChange={(e) =>
                        setUsername(e.target.value)
                    }
                />

 <div className="input-senha-container">
    <input
        type={mostrarSenha ? "text" : "password"}
        placeholder="Nova senha (opcional)"
        value={password}
        className="input-estilizado"
        onChange={(e) => {
            setPassword(e.target.value);
            setSenhaAlterada(e.target.value.trim().length > 0);
        }}
    />
    <button
        type="button"
        className="btn-olho"
        onClick={() => setMostrarSenha(!mostrarSenha)}
    >
        {mostrarSenha ? "👁️‍🗨️" : "👁️"}
    </button>
</div>


                <small className="senha-info">
    A senha deve ter pelo menos 6 caracteres,
    uma letra maiúscula e um número.
</small>

                {erro &&
                    <div className="msg-erro">
                        {erro}
                    </div>
                }

                {sucesso &&
                    <div className="msg-sucesso">
                        {sucesso}
                    </div>
                }

                <button 
                type="submit"
                disabled={!houveAlteracao || loading}
                >

                    {loading
                        ? "Salvando..."
                        : "Salvar Alterações"}

                </button>

                <span
                    className="link-voltar"
                    onClick={() => navigate(-1)}
                >
                    Voltar
                </span>

            </form>

            {
    mostrarModal && (
        <div className="modal-overlay">
            <div className="modal-confirmacao">

                <h3>Confirmar Alteração</h3>

                <p>
                    Tem certeza que deseja atualizar seus dados?
                    Você precisará fazer login novamente.
                </p>

                <div className="modal-botoes">

                    <button
                        type="button"
                        className="btn-cancelar"
                        onClick={() => setMostrarModal(false)}
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        className="btn-confirmar"
                        onClick={() => {
                            setMostrarModal(false);
                            atualizar();
                        }}
                    >
                        Confirmar
                    </button>

                </div>

            </div>
        </div>
    )
}


        </div>

    );
}

export default AtualizarCliente;