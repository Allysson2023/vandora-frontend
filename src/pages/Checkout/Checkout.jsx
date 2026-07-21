import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { obterItensCarrinho } from './CartServiceCheckout';
import "./Checkout.css";
import { API_URL } from "../../apiConfig";

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
  
  // Novos estados para o frete por bairro
  const [bairrosDisponiveis, setBairrosDisponiveis] = useState([]);
  const [valorFrete, setValorFrete] = useState(0);

  // --- CÁLCULOS AUTOMÁTICOS ---
  const { totalProdutos, taxaServico, valorDesconto, totalFinal } = useMemo(() => {
    const subtotal = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    const taxa = subtotal * 0.03;
    
    let desconto = 0;
    
    if (descontoConfig && descontoConfig.desconto_ativo) {
        const minCompra = Number(descontoConfig.valor_minimo_compra || 0);
        const valorDesc = Number(descontoConfig.valor_desconto || 0);

        if (subtotal >= minCompra) {
            desconto = descontoConfig.tipo_desconto === 'porcentagem' 
                ? (subtotal * valorDesc) / 100 
                : valorDesc;
        } 
    }

    // Se for retirada na loja, o frete é 0. Se for entrega, soma o valorFrete selecionado.
    const freteAtual = tipoPedido === "retirada" ? 0 : Number(valorFrete);
    
    return {
        totalProdutos: subtotal,
        taxaServico: taxa,
        valorDesconto: desconto,
        totalFinal: (subtotal - desconto) + taxa + freteAtual
    };
  }, [carrinho, descontoConfig, valorFrete, tipoPedido]);

  useEffect(() => {
    const carregarDados = async () => {
      const data = await obterItensCarrinho(token);
      if (!data || data.length === 0) return navigate("/carrinho");
      
      setCarrinho(data);
      const loja = data[0];
      const idL = loja.store_id || loja.loja_id || loja.id;
      
      setLojaId(idL);
      setLojaConfig({
        aceitaEntrega: !!loja.aceita_entrega,
        aceitaRetirada: !!loja.aceita_retirada
      });

      // 1. Busca configuração de desconto
      fetch(`${API_URL}/api/stores/${idL}/public/desconto-config`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data && data.desconto_ativo !== undefined) {
            setDescontoConfig(data);
        }
      });

      // 2. Busca a lista de bairros e fretes configurados por essa loja
      fetch(`${API_URL}/api/stores/${idL}/public/bairros-frete`)
      .then(res => res.json())
      .then(bairrosData => {
        if (Array.isArray(bairrosData)) {
          const bairrosFormatados = bairrosData.map(b => ({
                ...b,
                valor_entrega: b.valor_entrega !== null && b.valor_entrega !== undefined ? Number(b.valor_entrega) : 0
            }));
            setBairrosDisponiveis(bairrosData);
        }
      })
      .catch(err => console.error("Erro ao carregar bairros de entrega:", err));
    };

    carregarDados();
  }, [token]);

  // Função chamada quando o cliente seleciona um bairro no <select>
  const handleBairroChange = (e) => {
    const nomeBairroSelecionado = e.target.value;
    setForm({ ...form, bairro: nomeBairroSelecionado });

    // Encontra o bairro selecionado na lista para pegar o valor da entrega
    const bairroEncontrado = bairrosDisponiveis.find(b => b.bairro_nome === nomeBairroSelecionado);
    
    if (bairroEncontrado) {
        // Pega o valor já tratado como número
        const precoFrete = Number(bairroEncontrado.valor_entrega) || 0;
        console.log("Definindo frete para:", nomeBairroSelecionado, "Valor:", precoFrete);
        setValorFrete(precoFrete);
    } else {
        setValorFrete(0);
    }
  };

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
        dadosEntrega: {
            ...form,
            valor_frete: tipoPedido === "entrega" ? valorFrete : 0
        },
        valor_desconto: valorDesconto,
        total_final: totalFinal
    };

    try { 
      const response = await fetch(`${API_URL}/api/pedidos`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await fetch(`${API_URL}/api/cart/clear`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
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
              
              
              <div className="numero-bairro">
                
                {/* SELECT DOS BAIRROS DE FORTALEZA */}
                <select value={form.bairro} onChange={handleBairroChange}>
                    <option value="">Selecione o Bairro...</option>
                    {bairrosDisponiveis.map(b => (
                        <option key={b.bairro_id} value={b.bairro_nome}>
                            {b.bairro_nome} {b.valor_entrega !== null ? `(Frete: R$ ${Number(b.valor_entrega).toFixed(2)})` : "(Não entrega)"}
                        </option>
                    ))}
                </select>

              <input placeholder="Rua / Logradouro" value={form.endereco} onChange={e => setForm({...form, endereco: e.target.value})} />
              
                    <input placeholder="Nº" value={form.numero} onChange={e => setForm({...form, numero: e.target.value})} />
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
            
            {tipoPedido === "entrega" && (
                <div className="linha-total">
                    <span>Frete:</span>
                    <span>{valorFrete > 0 ? `R$ ${valorFrete.toFixed(2)}` : "Grátis / Não definido"}</span>
                </div>
            )}

            {valorDesconto > 0 && (
                <div className="linha-total">
                    <span>Desconto da Loja:</span>
                    <span style={{ color: '#22c55e', fontWeight: 'bold' }}>
                        - R$ {valorDesconto.toFixed(2)}
                    </span>
                </div>
            )}

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
                    finalizarCompra();
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