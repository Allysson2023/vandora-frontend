import { useEffect } from "react";
import "./ToastNotificacao.css"; // Crie um CSS simples para posicionar no canto

function ToastNotificacao({ mensagem, onClose }) {
  useEffect(() => {
    // Fecha automaticamente após 5 segundos
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="toast-notificacao">
      <p>🔔 <strong>Nova atualização!</strong></p>
      <p>{mensagem}</p>
      <button onClick={onClose}>X</button>
    </div>
  );
}
export default ToastNotificacao;