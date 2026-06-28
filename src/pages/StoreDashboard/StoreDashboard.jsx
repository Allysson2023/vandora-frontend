import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./StoreDashboard.css";
import { formatarDataBR } from "../../utils/dateUtils";
import { API_URL } from "../../apiConfig";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid
} from "recharts";

import socket from "../../socket";






function StoreDashboard() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [resumo, setResumo] = useState(null);
  const [pedidosPorDia, setPedidosPorDia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [atividades, setAtividades] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  const [modalDescontoAberta, setModalDescontoAberta] = useState(false);
const [config, setConfig] = useState({
    desconto_ativo: false,
    valor_minimo_compra: 0,
    tipo_desconto: 'porcentagem',
    valor_desconto: 0
});

const [desabilitado, setDesabilitado] = useState(false);

useEffect(() => {
    if (modalDescontoAberta) {
        fetch(`${API_URL}/api/stores/${id}/desconto-config`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
        .then(res => res.json())
        .then(data => {
            if (data) {
                setConfig({
                    desconto_ativo: Boolean(data.desconto_ativo),
                    valor_minimo_compra: data.valor_minimo_compra || 0,
                    tipo_desconto: data.tipo_desconto || 'porcentagem',
                    valor_desconto: data.valor_desconto || 0
                });
            }
        })
        .catch(err => console.error("Erro ao carregar descontos:", err));
    }
}, [modalDescontoAberta, id]);

  useEffect(() => {
  if (!user) {
    navigate("/login");
    return;
  }

  if (user.tipo === "cliente") {
    navigate("/");
    return;
  }

  // só depois que carregar resumo você valida loja
}, [user, id]);



  // =========================
  // 📦 CARREGAR DASHBOARD
  // =========================
  const carregarDashboard = async () => {

    
    
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
  `${API_URL}/api/stores/${id}/dashboard`,
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);

if (!response.ok) {
  console.log("Erro HTTP:", response.status);
  setLoading(false);
  return;
}

const data = await response.json();
console.log(data);
      setResumo(data);

      setPedidosPorDia(data.pedidosPorDia || []);

      setLoading(false);

    } catch (err) {

      console.log(err);

      setLoading(false);

    }

  };

  // =========================
  // 🚀 LOAD INICIAL
  // =========================
  useEffect(() => {
    
    carregarDashboard();

  }, [id]);

  // =========================
  // 🔥 SOCKET TEMPO REAL
  // =========================
  useEffect(() => {

  socket.emit("join_loja", id);

  // 🔥 Atualiza dashboard em tempo real
  const handleUpdate = async (data) => {

    if (data.lojaId === Number(id)) {

      await carregarDashboard();

    }

  };

  // 🔥 Pedido finalizado
  const handlePedidoFinalizado = async (data) => {

    if (data.lojaId === Number(id)) {

      await carregarDashboard();

    }

  };

  socket.on(
    "dashboard_update",
    handleUpdate
  );

  socket.on(
    "pedido_finalizado",
    handlePedidoFinalizado
  );

  return () => {

    socket.off(
      "dashboard_update",
      handleUpdate
    );

    socket.off(
      "pedido_finalizado",
      handlePedidoFinalizado
    );

  };

}, [id]);

useEffect(() => {

  const handleNovaAtividade = (atividade) => {

    setAtividades(prev => [
      atividade,
      ...prev
    ]);

  };

  socket.on(
    "nova_atividade",
    handleNovaAtividade
  );

  return () => {

    socket.off(
      "nova_atividade",
      handleNovaAtividade
    );

  };

}, []);



  // =========================
  // ⏳ LOADING
  // =========================
  if (loading) {

    return (
      <div className="dashboard-loading">
        <p>Carregando dashboard...</p>
      </div>
    );

  }

  // =========================
  // ❌ ERRO
  // =========================
  if (!resumo) {

    return (
      <div className="dashboard-loading">
        <p>Erro ao carregar dados.</p>
      </div>
    );

  } 

  const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#0f172a',
        padding: '12px',
        borderRadius: '12px',
        border: '1px solid #334155',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)'
      }}>
        <p style={{ color: '#94a3b8', fontSize: '12px' }}>{label}</p>
        <p style={{ color: '#fff', fontWeight: 'bold' }}>
          {payload[0].value} unidades
        </p>
      </div>
    );
  }
  return null;
};






  return (

    <div className="dashboard-containerr">
      <button className="btn-voltardas"
       onClick={() => navigate(-1)}>
          ⬅ 
        </button>

      {/* HEADER */}
      <div className="dashboard-header">

        <div>

          <h1 className="dashboard-title">
            📊 Dashboard da Loja
          </h1>

          <p className="dashboard-subtitle">
            Acompanhe vendas, pedidos e desempenho da loja
          </p>

        </div>

      </div>


      <div className="sd-card">

  <h3 className="sd-cardTitle">
    🎯 Meta do mês
  </h3>

  <div className="sd-metaBox">

    <div className="sd-metaBar">

      <div
        className="sd-metaProgress"
        style={{
          width: `${
            resumo.metaMensal > 0
              ? Math.min(
                  (Number(resumo.faturamentoMes) /
                    Number(resumo.metaMensal)) *
                    100,
                  100
                )
              : 0
          }%`
        }}
      />

    </div>

    <p className="sd-metaText">

      {Number(resumo.faturamentoMes || 0).toLocaleString(
        "pt-BR",
        {
          style: "currency",
          currency: "BRL"
        }
      )}

      {" de "}

      {Number(resumo.metaMensal || 0).toLocaleString(
        "pt-BR",
        {
          style: "currency",
          currency: "BRL"
        }
      )}

    </p>

  </div>

</div>

      {/* AÇÕES */}
      <div className="quick-actions">
 
 <div className="quick-card" onClick={() => setModalDescontoAberta(true)}>
    <span>🏷️</span>
    <h3>Descontos</h3>
</div>

 
 
        <div
  className="quick-card"
  onClick={() => navigate(`/loja/${id}/chats`)}
>
  <span>💬</span>
  <h3>Conversas</h3>
 
  {resumo.chatsNaoLidos > 0 && (
    <div className="badge-chat">
      {resumo.chatsNaoLidos}
    </div>
  )}
</div>

        <div
          className="quick-card"
          onClick={() => navigate("/cadastrar-produto")}
        >
          <span>➕</span>
          <h3>Novo Produto</h3>
        </div>

        <div 
          className="quick-card"
          onClick={() => navigate(`/store/${id}/admin/produtos`)}
        >
          <span>📦</span>
          <h3>Produtos</h3>
        </div>

        <div
          className="quick-card"
          onClick={() => navigate(`/store/${id}/pedidos`)}
        >
          <span>🛒</span>
          <h3>Pedidos</h3>
        </div>

        <div
  className="quick-card"
  onClick={() => navigate(`/store/${id}/avaliacoes`)}
>
  <span>⭐</span>
  <h3>Avaliações</h3>
</div>

        <div
          className="quick-card"
          onClick={() => navigate(`/editar-loja/${id}`)}
        >
          <span>🏪</span>
          <h3>Editar Loja</h3>
        </div>
<div
  className="quick-card"
  onClick={() => navigate(`/store/${id}/mais-vendidos`)}
>
  <span>🔥</span>
  <h3>Mais Vendidos</h3>
</div>

<div
  className="quick-card"
  onClick={() => navigate(`/store/${id}/estoque`)}
>
  <span>⚠️</span>
  <h3>Estoque</h3>
</div>

<div
  className="quick-card"
  onClick={() => navigate(`/store/${id}/financeiro`)}
>
  <span>💰</span>
  <h3>Financeiro</h3>
</div>



<div
  className="quick-card"
  //onClick={() => navigate(`/store/${id}/clientes`)}
>
  <span>👥</span>
  <h3>Clientes</h3>
</div>

        
        
        <div
          className="quick-card"
          //onClick={() => navigate("/atualizar-perfil")}
        >
          <span>👤</span>
          <h3>Perfil</h3>
        </div>

      </div>

      


      {/* GRÁFICO VENDAS */}
      <div className="sdChartsGrid">
      
      {/* PRODUTOS MAIS VENDIDOS */}
<div className="sdChartCard">

  <div className="section-header">
    <h2>🔥 Produtos Mais Vendidos</h2>
  </div>

  <div className="sdChartBody">

    <ResponsiveContainer width="100%" height={300}>

      <BarChart
        data={resumo.topProdutos || []}
        margin={{
          top: 10,
          right: 20,
          left: 0,
          bottom: 0
        }}
      >

        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

       <XAxis
  dataKey="nome"
  tick={{
    fill: "#94a3b8",
    fontSize: 12
  }}
/>

<YAxis
  tick={{
    fill: "#94a3b8",
    fontSize: 12
  }}
/>

        <Tooltip content={<CustomTooltip />} />

        <Bar
  dataKey="quantidade"
  fill="#22c55e"
  radius={[10, 10, 0, 0]}
  animationDuration={1000}
/>

      </BarChart>

    </ResponsiveContainer>

  </div>

</div>


{/* PRODUTOS MENOS VENDIDOS */}
<div className="sdChartCard">

  <div className="section-header">
    <h2>⚠️ Produtos Menos Vendidos</h2>
  </div>

  <div className="sdChartBody">

    <ResponsiveContainer width="100%" height={300}>

      <BarChart
        data={resumo.menosVendidos || []}
        margin={{
          top: 10,
          right: 20,
          left: 0,
          bottom: 0
        }}
      >

        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

        <XAxis
  dataKey="nome"
  tick={{
    fill: "#94a3b8",
    fontSize: 12
  }}
/>

<YAxis
  tick={{
    fill: "#94a3b8",
    fontSize: 12
  }}
/>

        <Tooltip content={<CustomTooltip />} />

        <Bar
  dataKey="quantidade"
  fill="#ef4444"
  radius={[10, 10, 0, 0]}
  animationDuration={1000}
/>

      </BarChart>

    </ResponsiveContainer>

  </div>

</div>



      <div className="sdChartCard">

        <div className="section-header">
          <h2>📈 Vendas dos últimos 7 dias</h2>
        </div>

        <div className="sdChartBody">

          <ResponsiveContainer width="100%" height={300}>

            <LineChart
              data={resumo.vendasPorDia || []}
              margin={{
                top: 10,
                right: 20,
                left: 0,
                bottom: 0
              }}
            >

              <XAxis
  dataKey="data"
  tick={{
    fill: "#94a3b8",
    fontSize: 12
  }}
/>

              <YAxis
  tick={{
    fill: "#94a3b8",
    fontSize: 12
  }}
/>

              <Tooltip content={<CustomTooltip />} />

              <Line
  type="monotone"
  dataKey="total"
  stroke="#6366f1"
  strokeWidth={4}
  dot={{ r: 6 }}
  activeDot={{ r: 8 }}
  animationDuration={1000}
/>

            </LineChart>

          </ResponsiveContainer>

        </div>

      
      </div>

      {/* GRÁFICO PEDIDOS */}
      <div className="sdChartCard">

        <div className="section-header">
          <h2>🛒 Pedidos por dia (tempo real)</h2>
        </div>

        <div className="sdChartBody">

          <ResponsiveContainer width="100%" height={300}>

            <LineChart
              data={pedidosPorDia}
              margin={{
                top: 10,
                right: 20,
                left: 0,
                bottom: 0
              }}
            >

             <XAxis
  dataKey="data"
  tick={{
    fill: "#94a3b8",
    fontSize: 12
  }}
/>

<YAxis
  tick={{
    fill: "#94a3b8",
    fontSize: 12
  }}
/>

              <Tooltip content={<CustomTooltip />} />

              <Line
  type="monotone"
  dataKey="total"
  stroke="#10b981"
  strokeWidth={4}
  dot={{ r: 6 }}
  activeDot={{ r: 8 }}
  animationDuration={1000}
/>

            </LineChart>

          </ResponsiveContainer>

        </div>

      </div>
      </div>

      <div className="section">

  <h2>🛒 Último pedido</h2>

  {!resumo.ultimoPedido ? (

    <p>Nenhum pedido ainda.</p>

  ) : (

    <div className="ultimo-pedido-box">

      <p>
        <strong>ID:</strong> {resumo.ultimoPedido.id}
      </p>

      <p>
  <strong>Total (com taxa):</strong>{" "}
  {Number(resumo.ultimoPedido.total_final).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  })}
</p>

      <p>
        <strong>Status:</strong> {resumo.ultimoPedido.status}
      </p>

    </div>

  )}

</div>

{modalDescontoAberta && (
    <div className="modal-overlay">
        <div className="modal-content">
            <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>🏷️ Configurar Desconto</h2>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input 
                    type="checkbox" 
                    checked={config.desconto_ativo} 
                    onChange={e => setConfig({...config, desconto_ativo: e.target.checked})} 
                />
                <strong>Ativar desconto automático</strong>
            </label>

            <div className="input-group">
                <label>Valor Mínimo para liberar (R$)</label>
                <input 
                    type="number" 
                    placeholder="Ex: 100.00" 
                    value={config.valor_minimo_compra}
                    onChange={e => setConfig({...config, valor_minimo_compra: e.target.value})} 
                />
            </div>

            <div className="input-group">
                <label>Tipo de Desconto</label>
                <select 
                    value={config.tipo_desconto} 
                    onChange={e => setConfig({...config, tipo_desconto: e.target.value})}
                >
                    <option value="porcentagem">Porcentagem (%)</option>
                    <option value="fixo">Valor Fixo (R$)</option>
                </select>
            </div>

            <div className="input-group">
                <label>Valor do desconto</label>
                <input 
                    type="number" 
                    placeholder={config.tipo_desconto === 'porcentagem' ? "Ex: 10" : "Ex: 20.00"}
                    value={config.valor_desconto}
                    onChange={e => setConfig({...config, valor_desconto: e.target.value})} 
                />
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                <button 
                    className="btn-cancelar" 
                    onClick={() => setModalDescontoAberta(false)}
                >
                    Cancelar
                </button>
                <button 
                    className="btn-salvar"
                    onClick={async () => {
                        const res = await fetch(`${API_URL}/api/stores/${id}/desconto-config`, {
                            method: 'PUT',
                            headers: { 
                                'Content-Type': 'application/json', 
                                Authorization: `Bearer ${localStorage.getItem("token")}` 
                            },
                            body: JSON.stringify(config)
                        });
                        if (res.ok) {
                            alert("✅ Configurações salvas com sucesso!");
                            setModalDescontoAberta(false);
                        }
                    }}
                >
                    Salvar Alterações
                </button>
            </div>
        </div>
    </div>
)}

      

    </div>

  );

}

export default StoreDashboard;