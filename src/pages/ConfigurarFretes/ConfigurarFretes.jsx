import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../../apiConfig";

function ConfigurarFretes() {
    const { id } = useParams(); // Pega o ID da loja que está na URL
    const navigate = useNavigate();
    
    const [bairros, setBairros] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [mensagem, setMensagem] = useState("");

    const token = localStorage.getItem("token");

    // 1. Buscar os bairros e preços da loja usando o ID da URL
    useEffect(() => {
        fetch(`${API_URL}/api/loja/${id}/bairros-frete`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                setBairros(data);
            }
            setCarregando(false);
        })
        .catch(err => {
            console.error("Erro ao carregar bairros:", err);
            setCarregando(false);
        });
    }, [id, token]);

    const handleValorChange = (bairroId, novoValor) => {
        setBairros(prev =>
            prev.map(item =>
                item.bairro_id === bairroId ? { ...item, valor_entrega: novoValor } : item
            )
        );
    };

    // 2. Salvar os fretes enviando para a rota com o ID da loja
    const salvarFretes = async () => {
        setSalvando(true);
        setMensagem("");

        const fretesParaSalvar = bairros.map(item => ({
            bairro: item.bairro_nome,
            valor_entrega: parseFloat(item.valor_entrega) || 0
        }));

        try {
            const response = await fetch(`${API_URL}/api/loja/${id}/bairros-frete`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ fretes: fretesParaSalvar })
            });

            const resultado = await response.json();

            if (response.ok) {
                setMensagem("Fretes atualizados com sucesso!");
            } else {
                setMensagem(resultado.error || "Erro ao salvar fretes.");
            }
        } catch (err) {
            console.error("Erro ao salvar:", err);
            setMensagem("Erro de conexão ao salvar.");
        } finally {
            setSalvando(false);
        }
    };

    if (carregando) {
        return <div style={{ padding: "20px", textAlign: "center" }}>Carregando bairros e taxas...</div>;
    }

    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
            <h2>Configurar Taxas de Entrega por Bairro</h2>
            <p>Defina o valor do frete para cada bairro que sua loja atende em Fortaleza.</p>

            {mensagem && (
                <div style={{ padding: "10px", margin: "10px 0", backgroundColor: "#d4edda", color: "#155724", borderRadius: "5px" }}>
                    {mensagem}
                </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                <button 
                    onClick={() => navigate(-1)}
                    style={{ padding: "10px 15px", backgroundColor: "#6c757d", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}
                >
                    Voltar
                </button>
                <button 
                    onClick={salvarFretes}
                    disabled={salvando}
                    style={{ padding: "10px 20px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
                >
                    {salvando ? "Salvando..." : "Salvar Alterações"}
                </button>
            </div>

            <div style={{ border: "1px solid #ddd", borderRadius: "5px", maxHeight: "500px", overflowY: "auto", background: "#fff" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ background: "#f8f9fa", borderBottom: "1px solid #ddd", textAlign: "left" }}>
                            <th style={{ padding: "12px" }}>Bairro</th>
                            <th style={{ padding: "12px", width: "180px" }}>Valor da Entrega (R$)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bairros.map(item => (
                            <tr key={item.bairro_id} style={{ borderBottom: "1px solid #eee" }}>
                                <td style={{ padding: "10px 12px" }}>{item.bairro_nome}</td>
                                <td style={{ padding: "10px 12px" }}>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={item.valor_entrega}
                                        onChange={(e) => handleValorChange(item.bairro_id, e.target.value)}
                                        style={{ width: "100%", padding: "6px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ConfigurarFretes;