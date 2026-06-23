export const formatarDataBR = (dataIso) => {
    if (!dataIso) return "";
    
    // Cria o objeto de data a partir da string
    const data = new Date(dataIso);
    
    // Formata usando o fuso horário específico de Brasília, 
    // sem precisar subtrair horas manualmente
    return new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
    }).format(data);
};