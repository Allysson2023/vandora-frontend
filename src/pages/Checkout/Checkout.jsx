import { useEffect, useState } from "react";
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

  // --- CÁLCULOS (Apenas uma declaração) ---
  const TAXA_SERVICO_PERCENTUAL = 0.03;
  const totalProdutos = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  const taxaServico = totalProdutos * TAXA_SERVICO_PERCENTUAL;
  const valorFrete = 0; // Se o frete for fixo
  const totalFinal = totalProdutos + taxaServico + valorFrete;

  const confirmarEnvioDoPedido = () => setModalConfirmacao(true);

  const isFormValid = () => {
    if (!form.nome || !form.pagamento) return false;
    if (tipoPedido === "entrega") return form.endereco && form.numero && form.bairro;
    if (tipoPedido === "retirada") return form.cpf;
    return true;
  };

  useEffect(() => {
    const carregarDados = async () => {
      const data = await obterItensCarrinho(token);
      if (!data || data.length === 0) return navigate("/carrinho");
      
      setCarrinho(data);
      const loja = data[0];
      setLojaId(loja.store_id || loja.loja_id || loja.id);
      setLojaConfig({
        aceitaEntrega: !!loja.aceita_entrega,
        aceitaRetirada: !!loja.aceita_retirada
      });
    };
    carregarDados();
  }, [token]);

  const finalizarCompra = async () => {
    setLoading(true);
    const payload = {
        loja_id: Number(lojaId),
        produtos: carrinho.map(item => ({ produto_id: item.product_id, quantidade: item.quantidade, preco: item.preco })),
        tipoPedido,
        dadosEntrega: form
    };

    try {
      const response = await fetch("http://localhost:5000/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await fetch("http://localhost:5000/api/cart/clear", { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
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