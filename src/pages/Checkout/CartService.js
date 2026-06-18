const API_URL = `${import.meta.env.VITE_API_URL}/api`;

export const obterItensCarrinho = async (token) => {
    const response = await fetch(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.json();
};

export const calcularFrete = async (cepCliente) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/calcular-frete`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json" 
    },
    // Certifique-se de que cepCliente é a string do CEP
    body: JSON.stringify({ cepCliente: cepCliente }) 
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error("Erro do servidor:", data);
    throw new Error(data.message || "Erro ao calcular frete");
  }
  
  return data;
};