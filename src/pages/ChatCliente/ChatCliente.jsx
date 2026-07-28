import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
    // SOCKET MENSAGENS EM TEMPO REAL
    // ===============================
    useEffect(() => {
        if (!chatId) return;

        socket.emit("join_chat", chatId);

        const handleMessage = (msg) => {
            if (Number(msg.chat_id) !== Number(chatId)) return;
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
    // ENVIAR MENSAGEM (TEXTO)
    // ===============================
    async function enviarMensagem() {
        if (!mensagem.trim()) return;

        const user = JSON.parse(localStorage.getItem("user"));
        const tempMsg = {
            id: Date.now(),
            chat_id: Number(chatId),
            mensagem: mensagem,
            tipo: "texto",
            remetente_tipo: "cliente",
            remetente_id: user?.id,
            criado_em: new Date().toISOString()
        };

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
        }
    }

    // ===============================
    // ENVIAR IMAGEM / COMPROVANTE
    // ===============================
    async function handleEnviarImagem(e) {
        const arquivo = e.target.files[0];
        if (!arquivo) return;

        const user = JSON.parse(localStorage.getItem("user"));
        const formData = new FormData();
        formData.append("chat_id", Number(chatId));
        formData.append("remetente_tipo", "cliente");
        formData.append("tipo", "imagem");
        formData.append("imagem", arquivo);

        try {
            const res = await fetch(`${API_URL}/api/chat/mensagem`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Erro ao enviar imagem.");
                return;
            }

            const tempMsg = {
                id: data.id || Date.now(),
                chat_id: Number(chatId),
                mensagem: data.url,
                tipo: "imagem",
                remetente_tipo: "cliente",
                remetente_id: user?.id,
                criado_em: new Date().toISOString()
            };

            setMensagens(prev => [...prev, tempMsg]);
            e.target.value = "";
        } catch (err) {
            console.error("Erro ao enviar imagem:", err);
            alert("Erro de conexão ao enviar imagem.");
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
                        chat_id: Number(chatId),
                        mensagem: mensagemInicial,
                        tipo: "texto",
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

    function formatarDataWhatsApp(dataString) {
    if (!dataString) return "";
    
    const dataMsg = new Date(dataString);
    const hoje = new Date();
    
    // Zera as horas para comparar apenas os dias
    const dMsg = new Date(dataMsg.getFullYear(), dataMsg.getMonth(), dataMsg.getDate());
    const dHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    
    const diffTime = dHoje - dMsg;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 0) {
        return "Hoje";
    } else if (diffDays === 1) {
        return "Ontem";
    } else {
        // Exibe no formato DD/MM/YYYY
        return dataMsg.toLocaleDateString("pt-BR");
    }
}


    return (
        <div className="chat-container">

            {/* HEADER */}
            <div className="chat-header">
                <button onClick={() => navigate(-1)}>
                    ← Voltar
                </button>
                💬 Conversando com{" "}
                <b>{chatInfo?.loja_nome || "Loja"}</b>
            </div>

            {/* MENSAGENS */}
            <div ref={mensagensRef} className="chat-mensagens">
    {mensagens.map((msg, index) => {
        // Pega a data da mensagem atual formatada
        const dataFormatada = formatarDataWhatsApp(msg.criado_em);
        
        // Pega a data da mensagem anterior (se houver) para saber se exibe o separador
        const dataAnterior = index > 0 ? formatarDataWhatsApp(mensagens[index - 1].criado_em) : null;
        const mostrarSeparador = dataFormatada !== dataAnterior;

        const hora = new Date(msg.criado_em || Date.now()).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

        // Verificação se é imagem (seja do cliente ou da loja)
        const ehImagem = msg.tipo === "imagem" || (typeof msg.mensagem === "string" && (msg.mensagem.startsWith("http://") || msg.mensagem.startsWith("https://")) && (msg.mensagem.includes("ibb.co") || msg.mensagem.match(/\.(jpeg|jpg|gif|png)$/i)));

        return (
            <div key={msg.id || index}>
                {/* Exibe o separador de data estilo WhatsApp se mudou o dia */}
                {mostrarSeparador && (
                    <div className="separador-data">
                        <span>{dataFormatada}</span>
                    </div>
                )}

                <div className={`mensagem ${msg.remetente_tipo}`}>
                    <div className="texto-mensagem">
                        {ehImagem ? (
                            <a href={msg.mensagem} target="_blank" rel="noopener noreferrer">
                                <img 
                                    src={msg.mensagem} 
                                    alt="Anexo" 
                                    style={{ maxWidth: "200px", borderRadius: "8px", display: "block", cursor: "pointer" }} 
                                />
                            </a>
                        ) : (
                            <div>{msg.mensagem}</div>
                        )}
                    </div>
                    <div className="msg-hora">
                        {hora}
                    </div>
                </div>
            </div>
        );
    })}
</div>

            {/* INPUT */}
            <div className="chat-input-area">
                <input 
                    type="file" 
                    id="inputComprovante" 
                    style={{ display: "none" }} 
                    accept="image/*"
                    onChange={handleEnviarImagem} 
                />

                <button 
                    type="button" 
                    className="btn-anexo"
                    onClick={() => document.getElementById("inputComprovante").click()}
                    title="Enviar comprovante"
                >
                    +
                </button>

                <input
                    type="text"
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Digite sua mensagem ou envie o comprovante..."
                    onKeyDown={(e) =>
                        e.key === "Enter" && enviarMensagem()
                    }
                />

                <button className="btn-enviar" onClick={enviarMensagem}>
                    Enviar
                </button>
            </div>

        </div>
    );
}

export default ChatCliente;