export const formatarDataBR = (dataIso) => {
    if (!dataIso) return "";

    // 1. Converte para string caso seja um objeto
    const dataStr = dataIso.toString();
    
    // 2. Se for formato "2026-06-23T01:29:49.000Z", o split precisa ser diferente
    if (dataStr.includes('T')) {
        const data = new Date(dataStr);
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false,
            timeZone: 'America/Sao_Paulo'
        }).format(data);
    }

    // 3. Se for formato "2026-06-23 01:29:49" (o seu formato do banco)
    const [dataParte, horaParte] = dataStr.split(' ');
    const [ano, mes, dia] = dataParte.split('-');
    const [hora, minuto] = horaParte.split(':');

    return `${dia}/${mes}/${ano}, ${hora}:${minuto}`;
};