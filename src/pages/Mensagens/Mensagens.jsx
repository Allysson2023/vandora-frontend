import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Mensagens.css";

function Mensagens() {

  const [conversas, setConversas] = useState([]);
  const navigate = useNavigate();


 useEffect(() => {

  const token = localStorage.getItem("token");

  fetch("http://localhost:5000/api/chat/cliente", {
    headers: {
      Authorization: `Bearer ${token}` 
    }
  })
    .then(res => res.json())
    .then(data => {

      console.log("RESPOSTA CHAT:", data);

      if (Array.isArray(data)) {
        setConversas(data);
      } 
      else {
        setConversas([]);
      }

    })
    .catch(err => console.log(err));

  console.log("TOKEN SENDO USADO:", token);

}, []);

  return (
    <div className="mensagens-container">

      <div className="topo-mensagens">

    <button
        className="btn-voltar"
        onClick={() => navigate(-1)}
    >
        ← Voltar
    </button>

    <h2>📩 Minhas Conversas</h2>

</div>

      {conversas.length === 0 ? (
        <p>Nenhuma conversa ainda</p>
      ) : (
        conversas.map((c) => (

          <div
            key={c.chatId}
            className="chat-card"
            onClick={() =>
  navigate(`/chat/${c.chatId}`, {
    state: { tipo: "cliente" }
  })
}
          > 

            <h3>
              {c.nomeLoja || `Loja #${c.loja_id}`}
            </h3>

            <p>
              {c.ultimaMensagem ||
                "Sem mensagens ainda"}
            </p>

          </div>

        ))
      )}

    </div>
  );
}

export default Mensagens;