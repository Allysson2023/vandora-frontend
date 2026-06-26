import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Mensagens.css";
import { API_URL } from "../../apiConfig";
import socket from "../../socket";
function Mensagens() {

  const [conversas, setConversas] = useState([]);
  const navigate = useNavigate();


  const currentUser = JSON.parse(localStorage.getItem("user"));
  
 useEffect(() => {

  const token = localStorage.getItem("token");

  fetch(`${API_URL}/api/chat/cliente`, {
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

useEffect(() => {
  if (conversas.length === 0) return;

  // 1. Entrar em todas as salas de chat que o cliente já possui
  conversas.forEach(c => {
    socket.emit("join_chat", c.chatId);
  });

  // 2. Ouve o evento de nova mensagem
  const handleNovaMsg = (msg) => {
    setConversas(prev => {
      // Encontra o chat na lista
      const index = prev.findIndex(c => Number(c.chatId) === Number(msg.chat_id));
      if (index === -1) return prev; // Se não estiver na lista, ignora

      let updated = [...prev];
      updated[index].ultimaMensagem = msg.mensagem;
      
      // Move o chat atualizado para o topo da lista
      const chatAtualizado = updated.splice(index, 1)[0];
      updated.unshift(chatAtualizado);
      return updated;
    });
  };

  socket.on("nova_mensagem", handleNovaMsg);
  
  // Limpeza
  return () => {
    socket.off("nova_mensagem", handleNovaMsg);
  };
}, [conversas]);
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