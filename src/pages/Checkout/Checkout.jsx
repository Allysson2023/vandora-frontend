import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { obterItensCarrinho } from './CartService';
import "./Checkout.css";

function Checkout() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  
  const [carrinho, setCarrinho] = useState([]);
  const [tipoPedido, setTipoPedido] = useState("entrega");
  const [lojaId, setLojaId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lojaConfig, setLojaConfig] = useState({ aceitaEntrega: true, aceitaRetirada: true });
  const [form, setForm] = useState({
    nome: "", endereco: "", numero: "", bairro: "", pagamento: "", cpf: "", observacao: ""
  });
  const [modalConfirmacao, setModalConfirmacao] = useState(false);
  const [descontoConfig, setDescontoConfig] = useState(null);

  // --- CÁLCULOS AUTOMÁTICOS ---
 const { totalProdutos, taxaServico, valorDesconto, totalFinal } = useMemo(() => {
    const subtotal = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    const taxa = subtotal * 0.03;
    
    let desconto = 0;
    
    // VAMOS VER O QUE TEMOS AQUI (F12 > Console)
    console.log("Calculando... Subtotal:", subtotal, "Config:", descontoConfig);

    if (descontoConfig && descontoConfig.desconto_ativo) {
        // Converte valores para número com segurança
        const minCompra = Number(descontoConfig.valor_minimo_compra || 0);
        const valorDesc = Number(descontoConfig.valor_desconto || 0);

        if (subtotal >= minCompra) {
            desconto = descontoConfig.tipo_desconto === 'porcentagem' 
                ? (subtotal * valorDesc) / 100 
                : valorDesc;
        }
    }
    
    return {
        totalProdutos: subtotal,
        taxaServico: taxa,
        valorDesconto: desconto,
        totalFinal: (subtotal - desconto) + taxa
    };
}, [carrinho, descontoConfig]);

  useEffect(() => {
    const carregarDados = async () => {
      const data = await obterItensCarrinho(token);
      if (!data || data.length === 0) return navigate("/carrinho");
      
      setCarrinho(data);
      const loja = data[0];
      const idL = loja.store_id || loja.loja_id || loja.id;
      
      setLojaId(idL); // Define o ID aqui
      setLojaConfig({
        aceitaEntrega: !!loja.aceita_entrega,
        aceitaRetirada: !!loja.aceita_retirada
      });

      // Busca desconto usando o idL (ID local)
      fetch(`${import.meta.env.VITE_API_URL}/api/stores/${idL}/public/desconto-config`, {
    headers: { Authorization: `Bearer ${token}` }
})
.then(res => res.json())
.then(data => {
    // Agora, como não tem mais o erro 403, o 'data' virá com o objeto corretamente
    if (data && data.desconto_ativo !== undefined) {
        setDescontoConfig(data);
    }
});
    };
    carregarDados();
  }, [token]);
useEffect(() => {
    console.log("Configuração de desconto carregada:", descontoConfig);
}, [descontoConfig]);
  const confirmarEnvioDoPedido = () => setModalConfirmacao(true);

  const isFormValid = () => {
    if (!form.nome || !form.pagamento) return false;
    if (tipoPedido === "entrega") return form.endereco && form.numero && form.bairro;
    if (tipoPedido === "retirada") return form.cpf;
    return true;
  };

  const finalizarCompra = async () => {
    setLoading(true);
    const payload = {
        loja_id: Number(lojaId),
        produtos: carrinho.map(item => ({ produto_id: item.product_id, quantidade: item.quantidade, preco: item.preco })),
        tipoPedido,
        dadosEntrega: form,
        valor_desconto: valorDesconto,
        total_final: totalFinal
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pedidos`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/cart/clear`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
        navigate("/meus-pedidos", { replace: true });
      } else {
        alert("Erro ao finalizar pedido");
      }
    } catch (error) {
      alert("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pagina-checkout">

<button className="btn-sim" onClick={() => navigate('/')}>
    ← Voltar Inicial
</button>

      <h1>Finalizar Pedido</h1>
      
      <div className="checkout-container">
        {/* Lado Esquerdo: Formulários */}
        <div className="checkout-col-dados">
          <section className="sessao-checkout">
            <h3>Como deseja receber?</h3>
            <div className="btn-group-tipo">
              {lojaConfig.aceitaEntrega && (
                <button className={tipoPedido === "entrega" ? "active" : ""} onClick={() => setTipoPedido("entrega")}>Entrega</button>
              )}
              {lojaConfig.aceitaRetirada && (
                <button className={tipoPedido === "retirada" ? "active" : ""} onClick={() => setTipoPedido("retirada")}>Retirada na Loja</button>
              )}
            </div>
          </section>

          <section className="sessao-checkout">
            <h3>Dados Pessoais</h3>
            <input placeholder="Seu Nome Completo" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
            {tipoPedido === "retirada" && (
                <input placeholder="CPF para retirada" value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} />
            )}
          </section>

          {tipoPedido === "entrega" && (
            <section className="sessao-checkout">
              <h3>Endereço de Entrega</h3>
              
              <input placeholder="Rua / Logradouro" value={form.endereco} onChange={e => setForm({...form, endereco: e.target.value})} />
              <div className="numero-bairro">
                <input placeholder="Nº" value={form.numero} onChange={e => setForm({...form, numero: e.target.value})} />
                <input placeholder="Bairro" value={form.bairro} onChange={e => setForm({...form, bairro: e.target.value})} />
              </div>

<h3>Observações</h3>
  <textarea 
    placeholder="Ex: Sem cebola, portão verde..." 
    value={form.observacao} 
    onChange={e => setForm({...form, observacao: e.target.value})} 
  />

            </section>
            
          )}

          <section className="sessao-checkout">
            <h3>Pagamento</h3>
            <select value={form.pagamento} onChange={e => setForm({...form, pagamento: e.target.value})}>
              <option value="">Selecione...</option>
              <option value="pix">Pix</option>
              <option value="cartao">Cartão Debito/Credito</option>
              <option value="dinheiro">Dinheiro</option>
            </select>
          </section>
        </div>

        {/* Lado Direito: Resumo */}
        <div className="checkout-col-resumo">

 <div className="card-resumo">
    <h3>Resumo do Pedido</h3>
    
    {carrinho.map(item => (
        <div key={item.product_id} className="item-resumo">
            <span>{item.quantidade}x {item.nome}</span>
            <span>R$ {(item.preco * item.quantidade).toFixed(2)}</span>
        </div>
    ))}

    <hr />

    <div className="linha-total">
        <span>Subtotal:</span>
        <span>R$ {totalProdutos.toFixed(2)}</span>
    </div>
    <div className="linha-total">
        <span>Taxa de Serviço (3%):</span>
        <span>R$ {taxaServico.toFixed(2)}</span>
    </div>
    <div className="linha-total">
        <span>Frete:</span>
        <span>Grátis</span>
    </div>

<div className="linha-total">
    <span>Desconto da Loja:</span>
    <span style={{ color: '#22c55e', fontWeight: 'bold' }}>
        - R$ {valorDesconto.toFixed(2)}
    </span>
</div>

    <div className="linha-total total-destaque">
        <span>Total a Pagar:</span>
        <span>R$ {totalFinal.toFixed(2)}</span>
    </div>

    <button 
        className="btn-confirmar-final" 
        disabled={loading || !isFormValid()} 
        onClick={confirmarEnvioDoPedido}
    >
        {loading ? "Processando..." : "Confirmar Pedido"}
    </button>
</div>
        </div>
      </div>

      {/* O MODAL DE CONFIRMAÇÃO */}
{modalConfirmacao && (
  <div className="modal-overlay">
    <div className="modal-confirmacao">
      <h2>Confirmar Pedido</h2>
      <p>Deseja enviar seu pedido para a loja?</p>
      <div className="btn-modal-group">
        <button onClick={() => setModalConfirmacao(false)}>Cancelar</button>
        <button 
          className="btn-sim" 
          disabled={loading} 
          onClick={() => {
              setModalConfirmacao(false);
              finalizarCompra(); // Chama a função que já existia
          }}
        >
          {loading ? "Enviando..." : "Sim, enviar"}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default Checkout;