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
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");
    const [mostrarModal, setMostrarModal] = useState(false);
    const [imagem, setImagem] = useState(null);
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [nomeCompleto, setNomeCompleto] = useState("");
    const [email, setEmail] = useState("");
    const [telefone, setTelefone] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [cpfCnpj, setCpfCnpj] = useState("");
    const [originalData, setOriginalData] = useState({});

    useEffect(() => {
        buscarCliente();
    }, []);

    const buscarCliente = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/api/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) {
                setErro("Cliente não encontrado");
                return;
            }
            setUsername(data.username);
            setNomeCompleto(data.nome_completo || "");
            setEmail(data.email || "");
            setTelefone(data.telefone || "");
            setDataNascimento(data.data_nascimento ? data.data_nascimento.split('T')[0] : "");
            setCpfCnpj(data.cpf_cnpj || "");
            setOriginalData(data);
        } catch {
            setErro("Erro ao carregar cliente");
        }
    };

    // FUNÇÃO QUE FALTAVA: Previne o envio padrão e abre o modal
    const abrirConfirmacao = (e) => {
        e.preventDefault();
        setMostrarModal(true);
    };

    const atualizar = async () => {
        setErro("");
        setSucesso("");
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            let imagemUrlFinal = originalData.imagem_perfil || "";

            // ETAPA 1: Upload para o ImgBB (Nuvem)
            if (imagem) {
                const formData = new FormData();
                formData.append("image", imagem);

                const resUpload = await fetch(`${API_URL}/api/upload-user-photo`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData
                });

                const dataUpload = await resUpload.json();
                if (!resUpload.ok) throw new Error("Erro ao subir a imagem para nuvem");
                imagemUrlFinal = dataUpload.url;
            }

            // ETAPA 2: Atualiza o banco com a URL da nuvem
            const res = await fetch(`${API_URL}/api/users/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    username,
                    nome_completo: nomeCompleto,
                    email,
                    telefone,
                    data_nascimento: dataNascimento,
                    cpf_cnpj: cpfCnpj,
                    password: password.trim() ? password : null,
                    imagem_perfil: imagemUrlFinal
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erro ao atualizar");

            setSucesso("Dados atualizados com sucesso!");
            localStorage.removeItem("token");
            setTimeout(() => navigate("/login"), 1200);
        } catch (err) {
            setErro(err.message || "Erro no servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="atualizar-container">
            <form className="atualizar-form" onSubmit={abrirConfirmacao}>
                <h2>Atualizar Dados</h2>
                <p className="atualizar-subtitulo">Atualize os dados da conta.</p>

                <div className="container-foto">
                    <img
                        src={imagem ? URL.createObjectURL(imagem) : (originalData.imagem_perfil || "https://via.placeholder.com/150")}
                        alt="Perfil"
                        className="preview-foto"
                    />
                    <label htmlFor="file-upload" className="custom-file-upload">Alterar Foto</label>
                    <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImagem(e.target.files[0])}
                        style={{ display: 'none' }}
                    />
                </div>

                <input type="text" placeholder="Usuário" value={username} onChange={(e) => setUsername(e.target.value)} />
                <input type="text" placeholder="Nome Completo" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} />
                <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input type="text" placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
                <input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />
                <input type="text" placeholder="CPF ou CNPJ" value={cpfCnpj} onChange={(e) => setCpfCnpj(e.target.value)} />

                <div className="input-senha-container">
                    <input
                        type={mostrarSenha ? "text" : "password"}
                        placeholder="Nova senha (opcional)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="button" className="btn-olho" onClick={() => setMostrarSenha(!mostrarSenha)}>
                        {mostrarSenha ? "👁️‍🗨️" : "👁️"}
                    </button>
                </div>

                {erro && <div className="msg-erro">{erro}</div>}
                {sucesso && <div className="msg-sucesso">{sucesso}</div>}

                <button type="submit" disabled={loading}>
                    {loading ? "Salvando..." : "Salvar Alterações"}
                </button>

                <span className="link-voltar" onClick={() => navigate(-1)}>Voltar</span>
            </form>

            {mostrarModal && (
                <div className="modal-overlay">
                    <div className="modal-confirmacao">
                        <h3>Confirmar Alteração</h3>
                        <p>Tem certeza que deseja atualizar seus dados? Você precisará fazer login novamente.</p>
                        <div className="modal-botoes">
                            <button type="button" className="btn-cancelar" onClick={() => setMostrarModal(false)}>Cancelar</button>
                            <button type="button" className="btn-confirmar" onClick={() => { setMostrarModal(false); atualizar(); }}>Confirmar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AtualizarCliente;