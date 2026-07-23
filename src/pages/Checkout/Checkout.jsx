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
  const [lojaDadosPix, setLojaDadosPix] = useState(null); // Guarda os dados completos da loja (Pix, banco, etc)

  const [modalExplicacao, setModalExplicacao] = useState(true);
  
  const [form, setForm] = useState({
    nome: "", endereco: "", numero: "", bairro: "", pagamento: "", cpf: "", observacao: ""
  });
  
  const [modalConfirmacao, setModalConfirmacao] = useState(false);
  const [descontoConfig, setDescontoConfig] = useState(null);
  
  // Novos estados para o frete por bairro
  const [bairrosDisponiveis, setBairrosDisponiveis] = useState([]);
  const [valorFrete, setValorFrete] = useState(0);

  const [showModalPix, setShowModalPix] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // --- FUNÇÃO DE COPIAR CHAVE PIX (Movida para o lugar correto) ---
  const copiarChavePix = (chave) => {
    if (!chave) {
      alert("A loja não cadastrou uma chave Pix.");
      return;
    }
    navigator.clipboard.writeText(chave);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000); // Some o aviso de copiado após 3 segundos
  };

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

      fetch(`${API_URL}/api/stores/${idL}/public`)
        .then(res => res.json())
        .then(storeData => {
          setLojaDadosPix(storeData);
        })
        .catch(err => console.error("Erro ao buscar dados do Pix da loja:", err));

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
            setBairrosDisponiveis(bairrosData);
        }
      })
      .catch(err => console.error("Erro ao carregar bairros de entrega:", err));
    };

    carregarDados();
  }, [token]);

  const handleBairroChange = (e) => {
    const nomeBairroSelecionado = e.target.value;
    setForm({ ...form, bairro: nomeBairroSelecionado });

    const bairroEncontrado = bairrosDisponiveis.find(b => b.bairro_nome === nomeBairroSelecionado);
    
    if (bairroEncontrado) {
        const precoFrete = Number(bairroEncontrado.valor_entrega) || 0;
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
                <select value={form.bairro} onChange={handleBairroChange}>
                    <option value="">Selecione o Bairro...</option>
                    {bairrosDisponiveis.map(b => (
                        <option key={b.bairro_id} value={b.bairro_nome}>
                            {b.bairro_nome} {b.valor_entrega !== null ? `(Frete: R$ ${Number(b.valor_entrega).toFixed(2)})` : "(Não entrega)"}
                        </option>
                    ))}
                </select>

                <input placeholder="Rua / Av." value={form.endereco} onChange={e => setForm({...form, endereco: e.target.value})} />
                <input placeholder="Nº" value={form.numero} onChange={e => setForm({...form, numero: e.target.value})} />
              </div>

              <h3>Observações</h3>
              <textarea 
                placeholder="Ex: Observaçoes..." 
                value={form.observacao} 
                onChange={e => setForm({...form, observacao: e.target.value})} 
              />
            </section>
          )}

          <section className="sessao-checkout">
            <h3>Pagamento</h3>
            <select 
  value={form.pagamento} 
  onChange={e => {
    const valor = e.target.value;
    setForm({...form, pagamento: valor});
    if (valor === "pix") {
      setShowModalPix(true);
    }
  }}
>
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

      {/* MODAL DE EXPLICAÇÃO DO CÁLCULO */}
      {modalExplicacao && (
        <div className="modal-overlay">
          <div className="modal-conteudo">
            <h2>📦 Como o total é calculado?</h2>
            <p>O valor final do seu pedido é composto de forma transparente:</p>
            <ul>
              <li><strong>Subtotal dos Produtos:</strong> A soma dos itens que você escolheu no carrinho.</li>
              <li><strong>Taxa de Serviço (3%):</strong> Um pequeno percentual aplicado sobre os produtos.</li>
              <li><strong>Frete:</strong> Definido automaticamente conforme o bairro de Fortaleza que você selecionar para a entrega.</li>
              <li><strong>Descontos:</strong> Caso a loja ofereça alguma promoção ou desconto por valor mínimo, ele é subtraído do total.</li>
            </ul>
            <p style={{ fontSize: "13px", color: "#777", marginBottom: "20px" }}>
              Você pode conferir todos esses valores detalhados no resumo ao lado antes de confirmar o pedido.
            </p>
            <button 
              className="btn-fechar-modal" 
              onClick={() => setModalExplicacao(false)}
            >
              Entendido, continuar
            </button>
          </div>
        </div>
      )}

      {/* MODAL DO PIX */}
      {showModalPix && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '450px', textAlign: 'left', background: 'white', padding: '20px', borderRadius: '8px' }}>
            
            <div style={{ background: '#fff3cd', border: '1px solid #ffeeba', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#856404', lineHeight: '1.4' }}>
                ⚠️ <b>Atenção:</b> Antes de efetuar o pagamento, verifique se os dados do Pix (Titular e Banco) conferem com a loja e se o <b>valor está correto</b>.
              </p>
            </div>

            <h2 style={{ fontSize: '20px', marginBottom: '10px', textAlign: 'center' }}>Pagamento via Pix</h2>
            
            <div style={{ textAlign: 'center', background: '#f8f9fa', padding: '10px', borderRadius: '6px', marginBottom: '15px' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>Valor a pagar:</span>
              <h3 style={{ margin: '5px 0 0 0', color: '#28a745', fontSize: '22px' }}>
                R$ {totalFinal.toFixed(2)}
              </h3>
            </div>

            <div style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
              <p><b>Banco:</b> {lojaDadosPix?.pix_banco || "Não informado"}</p>
              <p><b>Titular:</b> {lojaDadosPix?.pix_nome || "Não informado"}</p>
              <p><b>Tipo de Chave:</b> {lojaDadosPix?.tipo_chave_pix || "Chave"}</p>
              <p style={{ wordBreak: 'break-all' }}><b>Chave Pix:</b> {lojaDadosPix?.chave_pix || "Chave não cadastrada"}</p>
            </div>

            <p style={{ fontSize: '12px', color: '#666', marginBottom: '20px' }}>
              💡 <i>Após efetuar o pagamento, envie o comprovante no chat da loja para darmos continuidade ao seu pedido.</i>
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                type="button"
                className="btn-cancel" 
                onClick={() => {
                  setShowModalPix(false);
                }}
                style={{ padding: '10px 15px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Sair
              </button>

              <button 
                type="button"
                onClick={() => copiarChavePix(lojaDadosPix?.chave_pix)}
                style={{ padding: '10px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {copiado ? "Copiado! ✓" : "📋 Copiar Chave Pix"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Checkout;