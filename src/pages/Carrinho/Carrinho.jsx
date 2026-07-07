import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Carrinho.css";
import { obterItensCarrinho } from './CartService';
import { API_URL } from "../../apiConfig";

function Carrinho() {
  const navigate = useNavigate();
  const [carrinho, setCarrinho] = useState([]);
  const [modalLimpar, setModalLimpar] = useState(false);
  const [modalExcluir, setModalExcluir] = useState(false);
  const [produtoExcluir, setProdutoExcluir] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const carregarCarrinho = async () => {
      try {
        const data = await obterItensCarrinho(token);
        setCarrinho(data);
      } catch (err) {
        console.error("Erro ao carregar:", err);
      }
    };
    if (token) carregarCarrinho();
  }, [token]);

  const total = carrinho.reduce((acc, item) => acc + (Number(item.preco) * item.quantidade), 0);
  const possuiProdutoIndisponivel = carrinho.some(item => item.estoque <= 0);

  const aumentar = async (id) => {
    // Adicione o /api/ antes do cart
    const response = await fetch(`${API_URL}/api/cart/increase/${id}`, { 
        method: "PUT", 
        headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json" // Boa prática adicionar
        } 
    });
    
    if (response.ok) {
        setCarrinho(prev => prev.map(item => 
            item.product_id === id ? { ...item, quantidade: item.quantidade + 1 } : item
        ));
    } else {
        alert("Erro ao aumentar quantidade");
    }
  };

  const diminuir = async (id) => {
    const res = await fetch(`${API_URL}/api/cart/decrease/${id}`, { 
        method: "PUT", headers: { Authorization: `Bearer ${token}` } 
    });
    if (res.ok) setCarrinho(prev => prev.map(item => item.product_id === id ? { ...item, quantidade: item.quantidade - 1 } : item).filter(item => item.quantidade > 0));
  };

  const confirmarRemocao = async () => {
    await fetch(`${API_URL}/api/cart/delete/${produtoExcluir}`, { 
        method: "DELETE", headers: { Authorization: `Bearer ${token}` } 
    });
    setCarrinho(prev => prev.filter(item => item.product_id !== produtoExcluir));
    setModalExcluir(false);
  };

  const limparCarrinho = async () => {
  try {
    const res = await fetch(`${API_URL}/api/cart/clear`, { 
        method: "DELETE", 
        headers: { Authorization: `Bearer ${token}` } 
    });
    
    if (!res.ok) throw new Error("Falha ao limpar");
    console.log("Tentando acessar:", `${API_URL}/api/cart/clear`);
    
    setCarrinho([]);
  } catch (error) {
    console.error("Erro na requisição:", error);
    alert("Não foi possível limpar o carrinho. Tente novamente.");
  }
};

  return (
    <div className="pagina-carrinho">
      <div className="topo-carrinho">
        <button className="btn-voltar" onClick={() => navigate(-1)}>← Voltar</button>
        <h1>Meu Carrinho</h1>
      </div>

      {carrinho.length === 0 ? (
        <div className="cart-vazio">
          <h2>Seu carrinho está vazio</h2>
        </div>
      ) : (
        <>
          <div className="lista-carrinho">
            <button className="btn-limpar" onClick={() => setModalLimpar(true)}>🧹 Limpar Carrinho</button>

            {carrinho.map((item) => (
              <div key={item.product_id} className={`card-carrinho ${item.estoque <= 0 ? "indisponivel-card" : ""}`}>
                <img src={item.imagem} alt={item.nome} />
                <div className="info-carrinho">
                  <h3>{item.nome}</h3>
                  <p>{item.estoque <= 0 ? "Indisponível" : `Estoque: ${item.estoque}`}</p>
                  <span>R$ {item.preco}</span>
                </div>
                <div className="actions">
                  <button onClick={() => diminuir(item.product_id)} disabled={item.quantidade <= 1}>-</button>
                  <span>{item.quantidade}</span>
                  <button onClick={() => aumentar(item.product_id)} disabled={item.quantidade >= item.estoque || item.estoque <= 0}>+</button>
                  <button className="btn-delete" onClick={() => { setProdutoExcluir(item.product_id); setModalExcluir(true); }}>🗑</button>
                </div>
              </div>
            ))}
          </div>

          <div className="footer-carrinho">
            <h2>Subtotal: R$ {total.toFixed(2)}</h2>
            <button className="btn-finalizar" disabled={possuiProdutoIndisponivel} onClick={() => navigate("/checkout")}>
              {possuiProdutoIndisponivel ? "Produto indisponível" : "Ir para Checkout"}
            </button>
          </div>
        </>
      )}

      {/* --- MODAIS --- */}
      {modalExcluir && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Excluir Item</h2>
            <p>Deseja remover este produto?</p>
            <button onClick={() => setModalExcluir(false)}>Cancelar</button>
            <button onClick={confirmarRemocao}>Excluir</button>
          </div>
        </div>
      )}
 
      {modalLimpar && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Limpar Carrinho</h2>
            <p>Deseja remover todos?</p>
            <button onClick={() => setModalLimpar(false)}>Cancelar</button>
            <button onClick={() => { limparCarrinho(); setModalLimpar(false); }}>Sim</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Carrinho;