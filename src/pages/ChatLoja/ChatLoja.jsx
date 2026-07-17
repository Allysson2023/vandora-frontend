import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../../socket";
import "./ChatLoja.css";
import { API_URL } from "../../apiConfig";
 
function ChatLoja() {

    const { chatId } = useParams();
    const navigate = useNavigate();

    const [mensagens, setMensagens] = useState([]);
    const [texto, setTexto] = useState("");

    const [enviando, setEnviando] = useState(false);

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    const mensagensRef = useRef(null);

    const abriuChatRef = useRef(false);

    const [chatInfo, setChatInfo] = useState(null);

    const lojaId = user?.loja_id;

    


    // ===============================
    // BUSCAR INFO DO CHAT (pedido + cliente_id)
    // ===============================
    useEffect(() => {

        if (!chatId || !user?.loja_id) return;

        fetch(`${API_URL}/api/chat/${chatId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => {
    setChatInfo(data);
})
        .catch(err => console.log("Erro chatInfo:", err));

    }, [chatId, lojaId, token]);

    
    // ===============================
    // SOCKET ENTRAR NO CHAT
    // ===============================


// ==================================================
// SOCKET ÚNICO E PADRONIZADO (Substitua os dois antigos por este)
// ==================================================
useEffect(() => {
    if (!chatId) return;

    // Entra na sala
    socket.emit("join_chat", chatId);

    // Ouve o evento
    const handleMessage = (msg) => {
        if (Number(msg.chat_id) !== Number(chatId)) return;
        // Bloqueio de eco (para não duplicar sua própria mensagem)
        const user = JSON.parse(localStorage.getItem("user"));
        if (Number(msg.remetente_id) === Number(user?.id)) return;

        setMensagens(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
        });
    };

    socket.on("nova_mensagem", handleMessage);
    return () => socket.off("nova_mensagem", handleMessage);
}, [chatId]);

    // ===============================
    // CARREGAR MENSAGENS
    // ===============================
    useEffect(() => {

        if (!chatId) return;

        fetch(`${API_URL}/api/chat/${chatId}/mensagens`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                setMensagens(data);
            }
        })
        .catch(err => console.log("Erro mensagens:", err));

    }, [chatId, token]);

    useEffect(() => {

    if (!mensagens.length) return;

    const el = mensagensRef.current;

    if (!el) return;

    // primeira abertura do chat
    if (!abriuChatRef.current) {

        abriuChatRef.current = true;

        setTimeout(() => {
            el.scrollTop = el.scrollHeight;
        }, 100);

        return;
    }

}, [mensagens, chatId]);

useEffect(() => {
    abriuChatRef.current = false;
}, [chatId]);




    // ===============================
    // AUTO SCROLL
    // ===============================
    useEffect(() => {
    const el = mensagensRef.current;
    if (!el) return;

    const nearBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < 120;

    if (nearBottom) {
        el.scrollTop = el.scrollHeight;
    }

}, [mensagens]);

    // ===============================
    // ENVIAR MENSAGEM
    // ===============================
    async function enviar() {
    // Agora o React entende o que é 'enviando'
    if (!texto.trim() || enviando) return; 

    setEnviando(true); // Bloqueia novos cliques
    
    const tempId = Date.now();
    const novaMsg = {
        id: tempId,
        chat_id: Number(chatId),
        mensagem: texto,
        remetente_tipo: "loja",
        remetente_id: user?.id,
        criado_em: new Date().toISOString(),
    };

    setMensagens(prev => [...prev, novaMsg]);
    setTexto("");

    try {
        await fetch(`${API_URL}/api/chat/mensagem`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                chat_id: Number(chatId),
                mensagem: texto,
                tipo: "texto",
                remetente_tipo: "loja",
                loja_id: user?.loja_id
            })
        });
    } catch (err) {
        console.log("Erro ao enviar:", err);
    } finally {
        setEnviando(false); // Libera o botão novamente
    }
}

    return (

        <div className="chat-loja-container">

            {/* HEADER */}
            <div className="chat-loja-header">

                <button
                    className="btn-voltar"
                    onClick={() => navigate(-1)}
                >
                    ← Voltar
                </button>

                <h2>
  💬 Conversando com: {chatInfo?.cliente_nome || "Carregando..."}
</h2>
            </div>

            {/* MENSAGENS */}
            <div className="chat-loja-mensagens" ref={mensagensRef}>

                {mensagens.map(m => {

    const hora = new Date(m.criado_em || Date.now())
        .toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

    return (
        <div
            key={m.id}
            className={`msg ${m.remetente_tipo}`}
        >
            <div>{m.mensagem}</div>

            <div className="msg-hora">
                {hora}
            </div>
        </div>
    );
})}

            </div>

            {/* INPUT */}
            <div className="chat-loja-input">

                <input
                    value={texto}
                    onChange={e => setTexto(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && enviar()}
                    placeholder="Digite uma mensagem..."
                />

                <button onClick={enviar}>
                    Enviar
                </button>

            </div>

        </div>
    );
}

export default ChatLoja;