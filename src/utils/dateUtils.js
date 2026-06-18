// Exemplo de função para usar em qualquer lugar
export const formatarDataBR = (dataIso) => {
    if (!dataIso) return "";
    const data = new Date(dataIso);
    
    // O ajuste do fuso horário é feito aqui, no navegador do usuário
    data.setHours(data.getHours() - 3);
    
    return data.toLocaleString("pt-BR", {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};