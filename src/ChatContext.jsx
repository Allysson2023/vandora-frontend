import { createContext, useContext, useEffect, useState } from 'react';
import socket from './socket';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [listaChats, setListaChats] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.id) return;

    if (user.tipo === 'lojista') {
      socket.emit("join_loja", user.id);
    }

    const handleNovaMsgLoja = (msg) => {
      setListaChats(prev => {
        const index = prev.findIndex(c => Number(c.id) === Number(msg.chat_id));
        if (index === -1) return prev; 
        
        let updated = [...prev];
        updated[index] = { 
            ...updated[index], 
            ultima_mensagem: msg.mensagem, 
            tem_nova_msg: 1 
        };
        
        // Joga para o topo da lista
        const [chat] = updated.splice(index, 1);
        updated.unshift(chat);
        
        return updated;
      });
    };

    socket.on("nova_mensagem_loja", handleNovaMsgLoja);
    return () => socket.off("nova_mensagem_loja", handleNovaMsgLoja);
  }, []);

  return (
    <ChatContext.Provider value={{ listaChats, setListaChats }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);