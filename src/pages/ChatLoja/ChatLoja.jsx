import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../../socket";
import "./ChatLoja.css";
 
function ChatLoja() {

    const { chatId } = useParams();
    const navigate = useNavigate();

    const [mensagens, setMensagens] = useState([]);
    const [texto, setTexto] = useState("");

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    const mensagensRef = useRef(null);

    const abriuChatRef = useRef(false);

    const [chatInfo, setChatInfo] = useState(null);
    const [cliente, setCliente] = useState(null);

    const lojaId = user?.loja_id;

    


    // ===============================
    // BUSCAR INFO DO CHAT (pedido + cliente_id)
    // ===============================
    useEffect(() => {

        if (!chatId || !user?.loja_id) return;

        fetch(`http://localhost:5000/api/chat/${chatId}`, {
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
    // BUSCAR DADOS DO CLIENTE
    // ===============================
    useEffect(() => {

        const clienteId = chatInfo?.cliente_id;

        if (!clienteId) return;

        fetch(`http://localhost:5000/api/users/${clienteId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => {
            setCliente(data);
        })
        .catch(err => console.log("Erro cliente:", err));

    }, [chatInfo?.cliente_id, token]);

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
    // CARREGAR MENSAGENS
    // ===============================
    useEffect(() => {

        if (!chatId) return;

        fetch(`http://localhost:5000/api/chat/${chatId}/mensagens`, {
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
    // SOCKET REALTIME
    // ===============================
    useEffect(() => {
    if (!chatId) return;

    const handle = (msg) => {

        if (!msg?.chat_id) return;
        if (Number(msg.chat_id) !== Number(chatId)) return;

        const isMyMessage =
            msg.remetente_tipo === "loja" &&
            Number(msg.remetente_id) === Number(user?.id);

        if (isMyMessage) return; // ❌ bloqueia eco

        setMensagens(prev => {
  const exists = prev.some(
    m => m.id === msg.id || m.temp_id === msg.temp_id
  );

  if (exists) return prev;

  return [...prev, msg];
});
    };

    socket.on("nova_mensagem", handle);

    return () => {
        socket.off("nova_mensagem", handle);
    };
}, [chatId, user?.id]);

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
    const [enviando, setEnviando] = useState(false);

async function enviar() {
  if (!texto.trim() || enviando) return;

  const novaMsg = {
    id: Date.now(), // temporário
    chat_id: Number(chatId),
    mensagem: texto,
    remetente_tipo: "loja",
    remetente_id: user?.id,
    criado_em: new Date().toISOString(),
    temp_id: Date.now()
  };

  // 🔥 atualiza na hora (UI instantânea)
  setMensagens(prev => [...prev, novaMsg]);

  setTexto("");
  setEnviando(true);

  try {
    await fetch("http://localhost:5000/api/chat/mensagem", {
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
    console.log(err);
  } finally {
    setEnviando(false);
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
  💬 Conversando com: {chatInfo?.cliente?.nome || "Carregando..."}
  {" - "}
  Pedido #{chatInfo?.pedido_id}
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