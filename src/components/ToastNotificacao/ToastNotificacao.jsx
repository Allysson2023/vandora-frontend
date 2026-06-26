import { useEffect, useState } from "react";
import "./ToastNotificacao.css";

function ToastNotificacao({ mensagem, onClose }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Diminui o progresso gradualmente
    const interval = setInterval(() => {
      setProgress((prev) => prev - 1);
    }, 300);

    const timer = setTimeout(onClose, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <div className="toast-notificacao">
      <p>🔔 <strong>Nova atualização!</strong></p>
      <p>{mensagem}</p>
      <button onClick={onClose}>×</button>
      {/* Barra de progresso visual */}
      <div style={{
        height: '4px',
        width: `${progress}%`,
        backgroundColor: '#28a745',
        marginTop: '10px',
        borderRadius: '2px',
        transition: 'width 0.3s linear'
      }} />
    </div>
  );
}
export default ToastNotificacao;