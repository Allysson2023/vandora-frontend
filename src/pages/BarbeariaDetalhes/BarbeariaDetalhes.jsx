import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../../apiConfig";
import "./BarbeariaDetalhes.css";

function BarbeariaDetalhes() {
  const { slug } = useParams(); // Pegando o slug da URL em vez do id
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [barbearia, setBarbearia] = useState(null);
  const [servicos, setServicos] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados do Agendamento
  const [servicoSelecionado, setServicoSelecionado] = useState(null);
  const [dataSelecionada, setDataSelecionada] = useState("");
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [horarioEscolhido, setHorarioEscolhido] = useState("");

  useEffect(() => {
    // Buscando no backend usando o slug da barbearia
    fetch(`${API_URL}/api/barbearias/${slug}`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setBarbearia(data.barbearia);
        setServicos(data.servicos);
        setHorarios(data.horarios);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar barbearia:", err);
        setLoading(false);
      });
  }, [slug, token]);

  // Função para buscar horários livres no backend quando o cliente escolhe a data
  const handleBuscarHorariosLivres = (e) => {
    const data = e.target.value;
    setDataSelecionada(data);
    setHorarioEscolhido("");

    if (!data || !barbearia) return;

    // Usando o id interno da barbearia (ou o slug) para buscar os horários livres
    // fetch(`${API_URL}/api/barbearias/${barbearia.id}/horarios-disponiveis?data=${data}`, {
    //   headers: { "Authorization": `Bearer ${token}` }
    // })
    //   .then((res) => res.json())
    //   .then((data) => {
    //     setHorariosDisponiveis(data.horariosLivres || []);
    //   })
    //   .catch((err) => console.error("Erro ao buscar horários:", err));
  };

  if (loading) return <div className="loading-detalhes">Carregando barbearia...</div>;
  if (!barbearia) return <div className="erro-detalhes">Barbearia não encontrada.</div>;

  return (
    <div className="detalhes-page">
      <button className="btn-voltar" onClick={() => navigate("/barbearias")}>← Voltar para Lista</button>

      {/* Capa e Informações */}
      <div className="barbearia-banner" style={{ backgroundImage: `url(${barbearia.imagem_capa})` }}>
        <div className="banner-overlay">
          <h1>{barbearia.nome}</h1>
          <p>📍 {barbearia.endereco} | 📞 {barbearia.telefone || "Contato via app"}</p>
          <span className="badge-status-loja">Aberta para Agendamentos</span>
        </div>
      </div>

      <div className="detalhes-container">
        {/* Horários de Funcionamento da Semana */}
        <div className="secao-box">
          <h3>📅 Horários de Funcionamento</h3>
          <div className="grid-horarios-semana">
            {horarios.map((h) => (
              <div key={h.id} className={`dia-card ${h.ativo ? 'ativo' : 'fechado'}`}>
                <span className="dia-nome">{h.dia_semana.toUpperCase()}</span>
                <span className="dia-horas">
                  {h.ativo ? `${h.horario_abre.slice(0,5)} às ${h.horario_fecha.slice(0,5)}` : "Fechado"}
                </span>
                {h.tem_almoco && h.ativo && (
                  <span className="almoco-aviso">Almoço: {h.almoco_inicio.slice(0,5)} - {h.almoco_fim.slice(0,5)}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Escolha do Serviço / Corte */}
        <div className="secao-box">
          <h3>✂️ Escolha o Serviço</h3>
          <div className="servicos-grid">
            {servicos.map((s) => (
              <div 
                key={s.id} 
                className={`servico-card ${servicoSelecionado?.id === s.id ? 'selecionado' : ''}`}
                onClick={() => setServicoSelecionado(s)}
              >
                <div className="servico-info">
                  <h4>{s.nome_servico}</h4>
                  <p>{s.descricao_servico}</p>
                  <span className="duracao">⏱️ {s.duracao_minutos} min</span>
                </div>
                <div className="servico-preco">
                  {s.em_promocao ? (
                    <>
                      <span className="preco-antigo">R$ {s.preco}</span>
                      <span className="preco-novo">R$ {s.preco_promocional}</span>
                      <span className="tag-promo">Promoção</span>
                    </>
                  ) : (
                    <span className="preco-normal">R$ {s.preco}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seleção de Data e Horários Livres */}
        {servicoSelecionado && (
          <div className="secao-box agendamento-box">
            <h3>⏰ Escolha o Dia e Horário</h3>
            <div className="form-grupo">
              <label>Data do Corte:</label>
              <input 
                type="date" 
                value={dataSelecionada} 
                onChange={handleBuscarHorariosLivres} 
                min={new Date().toISOString().split("T")[0]} 
              />
            </div>

            {dataSelecionada && (
              <div className="horarios-livres-container">
                <p>Horários disponíveis para este dia:</p>
                {horariosDisponiveis.length === 0 ? (
                  <p className="aviso-sem-vagas">Nenhum horário disponível ou barbearia fechada nesta data.</p>
                ) : (
                  <div className="grid-horarios-livres">
                    {horariosDisponiveis.map((hora, index) => (
                      <button
                        key={index}
                        className={`btn-horario ${horarioEscolhido === hora ? 'escolhido' : ''}`}
                        onClick={() => setHorarioEscolhido(hora)}
                      >
                        {hora}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {horarioEscolhido && (
              <button className="btn-confirmar-agendamento">
                Confirmar Agendamento de {servicoSelecionado.nome_servico} às {horarioEscolhido} 🚀
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BarbeariaDetalhes;