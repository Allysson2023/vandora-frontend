import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate,  useLocation  } from "react-router-dom";
import socket from "../../socket";
import "./ChatCliente.css";
import { API_URL } from "../../apiConfig";

function ChatCliente() {
 
    const { chatId } = useParams();
    const navigate = useNavigate();
 
    const [mensagem, setMensagem] = useState("");
    const [mensagens, setMensagens] = useState([]);
    const [chatInfo, setChatInfo] = useState(null);

const jaEnviouInicial = useRef(false);
    const token = localStorage.getItem("token");

    const mensagensRef = useRef(null);
    const abriuChatRef = useRef(false);

    const location = useLocation();
const mensagemInicial = location.state?.mensagemInicial;

    // ===============================
    // CARREGAR MENSAGENS + CHAT INFO
    // ===============================
    useEffect(() => {

    if (!chatId || !token) return;

    async function loadChat() {
        try {

            const [msgRes, chatRes] = await Promise.all([
                fetch(`${API_URL}/api/chat/${chatId}/mensagens`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${API_URL}/api/chat/${chatId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            const msgs = await msgRes.json();
            const chat = await chatRes.json();

            if (Array.isArray(msgs)) {
                setMensagens(msgs);
            }

            setChatInfo(chat);

        } catch (err) {
            console.log(err);
        }
    }

    loadChat();

}, [chatId, token]);

    useEffect(() => {

    if (!mensagens.length) return;

    const el = mensagensRef.current;

    if (!el) return;

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
    // SOCKET ENTRAR NO CHAT
    // ===============================
    useEffect(() => {
    if (!chatId) return;

    socket.emit("entrar_chat", { chatId });

    return () => {
        socket.emit("sair_chat", { chatId });
    };
}, [chatId]);

    // ===============================
    // SOCKET MENSAGENS EM TEMPO REAL
    // ===============================
    useEffect(() => {
  if (!chatId) return;

  const handleMessage = (msg) => {
    if (Number(msg.chat_id) !== Number(chatId)) return;

    // BLOQUEIO DE ECO: 
    // Verifica se o ID do remetente é o ID do usuário logado (cliente)
    // O backend envia "remetente_id" no objeto da mensagem
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
    // SCROLL AUTOMÁTICO
    // ===============================
    useEffect(() => {

    const el = mensagensRef.current;
    if (!el) return;

    const nearBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < 120;

    if (nearBottom) {
        el.scrollTo({
            top: el.scrollHeight,
            behavior: "smooth"
        });
    }
 
}, [mensagens]);

    // ===============================
    // ENVIAR MENSAGEM
    // ===============================
    async function enviarMensagem() {
  if (!mensagem.trim()) return;

  const user = JSON.parse(localStorage.getItem("user"));
  const tempMsg = {
    id: Date.now(), // ID temporário
    chat_id: Number(chatId),
    mensagem: mensagem,
    remetente_tipo: "cliente",
    remetente_id: user?.id,
    criado_em: new Date().toISOString()
  };

  // 1. Atualização Otimista
  setMensagens(prev => [...prev, tempMsg]);
  setMensagem("");

  try {
    await fetch(`${API_URL}/api/chat/mensagem`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        chat_id: Number(chatId),
        mensagem: tempMsg.mensagem,
        tipo: "texto",
        remetente_tipo: "cliente"
      })
    });
  } catch (err) {
    console.log(err);
    // Se der erro, você pode remover a mensagem da lista aqui
  }
}

useEffect(() => {

    if (!mensagemInicial || !chatId || !token) return;

    const enviarInicial = async () => {

        if (jaEnviouInicial.current) return;

        jaEnviouInicial.current = true;

        try {
            await fetch(`${API_URL}/api/chat/mensagem`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    chat_id: Number(chatId),
                    mensagem: mensagemInicial,
                    tipo: "texto",
                    remetente_tipo: "cliente"
                })
            });

            setMensagens(prev => [
                ...prev,
                {
                    id: Date.now(),
                    temp_id: Date.now(),
                    chat_id: Number(chatId),
                    mensagem: mensagemInicial,
                    remetente_tipo: "cliente",
                    criado_em: new Date().toISOString()
                }
            ]);

        } catch (err) {
            console.log(err);
        }
    };

    enviarInicial();

}, [mensagemInicial, chatId, token]);

    return (
        <div className="chat-container">

            {/* HEADER */}
            <div className="chat-header">

    <button onClick={() => navigate(-1)}>
        ← Voltar
    </button>

    💬 Conversando com{" "}

    <b>
        {chatInfo?.loja_nome || "Loja"}
    </b>

</div>

            {/* MENSAGENS */}
            <div
                ref={mensagensRef}
                className="chat-mensagens"
            >

                {mensagens.map((msg) => {

                    const hora = new Date(msg.criado_em )
                        .toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                        });

                    return (
                        <div
                            key={msg.id}
                            className={`mensagem ${msg.remetente_tipo}`}
                        >

                            <div className="texto-mensagem">
                                {msg.mensagem}
                            </div>

                            <div className="msg-hora">
                                {hora}
                            </div>

                        </div>
                    );
                })}

            </div>

            {/* INPUT */}
            <div className="chat-input-area">

                <input
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    onKeyDown={(e) =>
                        e.key === "Enter" && enviarMensagem()
                    }
                />

                <button onClick={enviarMensagem}>
                    Enviar
                </button>

            </div>

        </div>
    );
}

export default ChatCliente;