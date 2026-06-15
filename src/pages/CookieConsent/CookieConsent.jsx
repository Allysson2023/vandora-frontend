import { useState, useEffect } from "react";
import "./CookieConsent.css";

function CookieConsent() {
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    const aceitouEm = localStorage.getItem("cookieConsentDate");
    const agora = new Date().getTime();
    const umaSemanaEmMs = 7 * 24 * 60 * 60 * 1000;

    // Se não aceitou ou se já passou 1 semana
    if (!aceitouEm || agora - aceitouEm > umaSemanaEmMs) {
      setMostrar(true);
    }
  }, []);

  const aceitar = () => {
    localStorage.setItem("cookieConsentDate", new Date().getTime());
    setMostrar(false);
  };

  if (!mostrar) return null;

  return (
    <div className="cookie-banner">
      <p>
        Utilizamos cookies para melhorar sua experiência. Ao continuar, você concorda com nossa política de privacidade.
      </p>
      <button onClick={aceitar}>Aceitar</button>
    </div>
  );
}

export default CookieConsent;