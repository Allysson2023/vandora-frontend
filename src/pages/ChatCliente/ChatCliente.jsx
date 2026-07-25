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
        formData.append("imagem", arquivo); // O multer no backend vai capturar isso

        try {
            const res = await fetch(`${API_URL}/api/chat/mensagem`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                    // ⚠️ Nota: Não adicione Content-Type aqui, o navegador define automático para FormData
                },
                body: formData
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Erro ao enviar imagem.");
                return;
            }

            // Adiciona otimisticamente na tela se quiser, ou aguarda o socket/resposta
            const tempMsg = {
                id: data.id || Date.now(),
                chat_id: Number(chatId),
                mensagem: data.url, // A URL segura devolvida pelo ImgBB no backend
                tipo: "imagem",
                remetente_tipo: "cliente",
                remetente_id: user?.id,
                criado_em: new Date().toISOString()
            };

            setMensagens(prev => [...prev, tempMsg]);
            e.target.value = ""; // Limpa o input file
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
                {mensagens.map((msg) => {
                    const hora = new Date(msg.criado_em).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                    });

                    return (
                        <div key={msg.id} className={`mensagem ${msg.remetente_tipo}`}>
                            <div className="texto-mensagem">
                                {msg.tipo === "imagem" ? (
                                    <a href={msg.mensagem} target="_blank" rel="noopener noreferrer">
                                        <img 
                                            src={msg.mensagem} 
                                            alt="Comprovante" 
                                            style={{ maxWidth: "200px", borderRadius: "8px", cursor: "pointer", display: "block" }} 
                                        />
                                    </a>
                                ) : (
                                    msg.mensagem
                                )}
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

                {/* Input de arquivo escondido */}
                <input 
                    type="file" 
                    id="inputComprovante" 
                    style={{ display: "none" }} 
                    accept="image/*"
                    onChange={handleEnviarImagem} 
                />

                {/* Botão de Clipe para anexar */}
                <button 
                    type="button" 
                    onClick={() => document.getElementById("inputComprovante").click()}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", marginRight: "8px" }}
                    title="Enviar comprovante"
                >
                    📎
                </button>

                <input
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Digite sua mensagem ou envie o comprovante..."
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

export data ChatCliente;