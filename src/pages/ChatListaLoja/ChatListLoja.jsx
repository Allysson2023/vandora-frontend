import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import socket from "../../socket";
import { API_URL } from "../../apiConfig";
import { useChat } from "../../ChatContext"; // Importa o estado global
import "./ChatListLoja.css";

function ChatListLoja() {
    // Agora pegamos a lista do contexto global
    const { listaChats, setListaChats } = useChat();
    const navigate = useNavigate();
    const { id: lojaId } = useParams();
    const token = localStorage.getItem("token");

    // ===============================
    // CARREGAR CHATS
    // ===============================
    useEffect(() => {
        if (!lojaId || !token) return;

        const carregarChats = async () => {
            try {
                const res = await fetch(`${API_URL}/api/chat/loja/${lojaId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error("Erro ao carregar chats");
                
                const data = await res.json();
                // Atualiza o estado global no contexto
                setListaChats(data); 
            } catch (err) {
                console.log(err);
            }
        };

        carregarChats();
    }, [lojaId, token, setListaChats]);

    // ===============================
    // ABRIR CHAT
    // ===============================
    async function abrirChat(chatId) {
        try {
            await fetch(`${API_URL}/api/chat/visualizar/${chatId}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });

            // Atualiza o contexto global para remover a bolinha de notificação
            setListaChats(prev =>
                prev.map(chat =>
                    Number(chat.id) === Number(chatId)
                        ? { ...chat, tem_nova_msg: 0 }
                        : chat
                )
            );

            navigate(`/chat/${Number(chatId)}/loja`);
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
    if (listaChats.length === 0) return;

    // 1. Entrar nas salas de todos os chats que aparecem na lista
    listaChats.forEach(chat => {
        socket.emit("join_chat", chat.id);
    });

    // 2. Escutar novas mensagens para atualizar a lista
    const handleNovaMsg = (msg) => {
        setListaChats(prev => {
            const index = prev.findIndex(c => Number(c.id) === Number(msg.chat_id));
            if (index === -1) return prev;

            let updated = [...prev];
            // Atualiza a última mensagem e marca como "tem_nova_msg"
            updated[index].ultima_mensagem = msg.mensagem;
            updated[index].tem_nova_msg = 1;

            // Move para o topo
            const chatAtualizado = updated.splice(index, 1)[0];
            updated.unshift(chatAtualizado);
            return updated;
        });
    };

    socket.on("nova_mensagem", handleNovaMsg);

    return () => {
        socket.off("nova_mensagem", handleNovaMsg);
    };
}, [listaChats]);

    // ===============================
    // RENDERIZAÇÃO
    // ===============================
    return (
        <div className="chat-list-container">
            <div className="top-bar">
                <button className="btn-voltar" onClick={() => navigate(-1)}>← Voltar</button>
                <h2>💬 Conversas</h2>
            </div>

            {/* AQUI ESTAVA O ERRO: mudamos 'chats' para 'listaChats' */}
            {listaChats.length === 0 ? (
                <p className="sem-chats">Nenhuma conversa encontrada</p>
            ) : (
                <div className="lista-chats">
                    {listaChats.map(chat => (
                        <div
                            key={chat.id}
                            className={`chat-card ${chat.tem_nova_msg ? "ativo" : ""}`}
                            onClick={() => abrirChat(chat.id)}
                        >
                            {chat.tem_nova_msg === 1 && (
                                <span className="bolinha-notificacao"></span>
                            )}
                            <div className="chat-info">
                                <h3>👤 {chat.cliente_nome}</h3>
                                <p className="ultima-msg">{chat.ultima_mensagem || "Sem mensagens"}</p>
                            </div>
                            <div className="chat-seta">→</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ChatListLoja;