import { useEffect, useState, useRef } from "react";
import { useNavigate , useParams} from "react-router-dom";
import socket from "../../socket";
import "./ChatListLoja.css";
import { API_URL } from "../../apiConfig";
import somNotificacao from "../../assets/sounds/notification.mp3";

function ChatListLoja() {
 
    const [chats, setChats] = useState([]);
    const navigate = useNavigate();

    const params = useParams();
const lojaId = Number(params.id);

    const token = localStorage.getItem("token");
    const currentUser = JSON.parse(localStorage.getItem("user"));

    let user = null;
try {
    user = JSON.parse(localStorage.getItem("user"));
} catch (err) {
    user = null;
}




   

    // ===============================
    // CARREGAR CHATS
    // ===============================
    const carregarChats = async () => {
    if (!lojaId || !token) return;

    try {
        const res = await fetch(
            `${API_URL}/api/chat/loja/${lojaId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!res.ok) throw new Error("Erro ao carregar chats");

        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));

        const chatsOrdenados = data.sort(
            (a, b) =>
                new Date(b.atualizado_em || 0) -
                new Date(a.atualizado_em || 0)
        );

        setChats(chatsOrdenados);

    } catch (err) {
        console.log(err);
    }
};

    // ===============================
    // INIT
    // ===============================
    useEffect(() => {
  if (!token) return;

  if (!lojaId) return;

  if (!currentUser?.id) return;

  carregarChats();

  socket.emit("join_loja", currentUser.id);

}, [lojaId, token, currentUser?.id]);

    // ===============================
    // SOCKET TEMPO REAL
    // ===============================

useEffect(() => {
  if (!currentUser?.id) return;

  socket.emit("join_loja", currentUser.id);

  const handleNovaMsg = (msg) => {
    setChats(prev => {
      const updated = [...prev];

      const index = updated.findIndex(
        c => Number(c.id) === Number(msg.chat_id)
      );

      if (index !== -1) {
        updated[index].ultima_mensagem = msg.mensagem;
        updated[index].tem_nova_msg = true;
        updated[index].atualizado_em = msg.criado_em;
      }

      return updated;
    });
  };

  socket.on("nova_mensagem_loja", handleNovaMsg);

  return () => {
    socket.off("nova_mensagem_loja", handleNovaMsg);
  };
}, [currentUser?.id]);
    // ===============================
    // ABRIR CHAT
    // ===============================
    async function abrirChat(chatId) {

    try {

        await fetch(
            `${API_URL}/api/chat/visualizar/${chatId}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        setChats(prev =>
            prev.map(chat =>
                Number(chat.id) === Number(chatId)
                    ? {
                        ...chat,
                        tem_nova_msg: false
                    }
                    : chat
            )
        );

        navigate(`/chat/${Number(chatId)}/loja`);

    } catch (err) {
        console.log(err);
    }
}

    // ===============================
    // VOLTAR
    // ===============================
    function voltar() {
        navigate(-1);
    }

    useEffect(() => {
    console.log("USER:", user);
    console.log("LOJA_ID:", lojaId);
    console.log("USER ID:", currentUser?.id);
}, []);

    return (

        <div className="chat-list-container">

            <div className="top-bar">

                <button
                    className="btn-voltar"
                    onClick={voltar}
                >
                    ← Voltar
                </button>

                <h2>💬 Conversas</h2>

            </div>

            {chats.length === 0 ? (

                <p className="sem-chats">
                    Nenhuma conversa encontrada
                </p>

            ) : (

                <div className="lista-chats">

                    {chats.map(chat => (

                        <div
                            key={chat.id}
                            className={`chat-card ${
                                chat.tem_nova_msg ? "ativo" : ""
                            }`}
                            onClick={() => abrirChat(chat.id)}
                        >

                            {chat.tem_nova_msg && (
                                <span className="bolinha-notificacao"></span>
                            )}

                            <div className="chat-info">

                                <h3>
                                    👤 {chat.cliente_nome}
                                </h3>

                                <p className="ultima-msg">
                                    {chat.ultima_mensagem ||
                                        "Sem mensagens ainda"}
                                </p>

                            </div>

                            <div className="chat-seta">
                                →
                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}

export default ChatListLoja;