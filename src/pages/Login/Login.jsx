import { useState } from "react";
import "./Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");

  const [mostrarSenha, setMostrarSenha] = useState(false);
 
  async function handleLogin(e) {

  e.preventDefault();

  try {

    const resposta = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        password
      })
    });

    const dados = await resposta.json();

    if (resposta.ok) {

      localStorage.setItem("token", dados.token);
      localStorage.setItem("user", JSON.stringify(dados.user));
      localStorage.setItem("lojaId", dados.user.loja_id);

      sessionStorage.removeItem("boasVindas");

      window.location.href = "/";

    } else {

      setMensagemErro(dados.error || "Usuário ou senha inválidos");

    }

  } catch (err) {

    setMensagemErro("Erro no servidor");

  }

}

  return (
    <div className="container-geral">

    <div className="login-container">
      <h2>Vandora - AC</h2>

<p className="subtitulo">
  Entre na sua conta e encontre as melhores ofertas.
</p>

      <form onSubmit={handleLogin}>
        <input
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <div className="input-senha">
  <input
    type={mostrarSenha ? "text" : "password"}
    placeholder="Senha"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />

  <button
    type="button"
    className="btn-mostrar-senha"
    onClick={() => setMostrarSenha(!mostrarSenha)}
  >
    {mostrarSenha ? "🙈" : "👁"}
  </button>
</div>

{mensagemErro && (
  <div className="mensagem-erro">
    {mensagemErro}
  </div>
)}
        <button>Entrar</button>
      </form>
      {/* NOVO BOTÃO */}
<button
  type="button"
  className="btn-guest"
  onClick={() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  }}
>
  Continuar sem login 👀
</button>

    </div>
    </div>
  );
}

export default Login;