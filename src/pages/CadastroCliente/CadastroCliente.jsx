import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CadastroCliente.css";

function CadastroCliente() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");
    
    // Novo estado para o olho
    const [showPassword, setShowPassword] = useState(false);

    const cadastrar = async (e) => {
        e.preventDefault();
        setErro("");
        setSucesso("");

        if (!username || !password) {
            setErro("Preencha todos os campos");
            return;
        }

        try {
            setLoading(true);
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            if (!res.ok) {
                setErro(data.error || "Erro ao criar conta");
                return;
            }

            setSucesso("Conta criada com sucesso!");
            setTimeout(() => navigate("/login"), 1200);
        } catch (err) {
            setErro("Erro no servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cadastro-container">
            <form className="cadastro-form" onSubmit={cadastrar}> 
                
                <h2>Vandora - AC</h2>
                <p className="cadastro-subtitulo">Crie sua conta e aproveite as melhores ofertas.</p>
                 
                
                <input
                    type="text"
                    placeholder="Usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                {/* Container para o input de senha + botão olho */}
                <div className="password-input-wrapper">
    <input
        type={showPassword ? "text" : "password"}
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
    />
    <button 
        type="button" 
        className="toggle-password-btn"
        onClick={() => setShowPassword(!showPassword)}
    >
        {showPassword ? "🙈" : "👁️"}
    </button>
</div>
                
                {erro && <div className="msg-erro">{erro}</div>}
                {sucesso && <div className="msg-sucesso">{sucesso}</div>}

                <button type="submit">
                    {loading ? "Criando..." : "Criar Conta"}
                </button>

                <span className="link-login" onClick={() => navigate("/login")}>
                    Já tenho conta
                </span>
            </form>
        </div>
    );
}

export default CadastroCliente;