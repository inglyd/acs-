export type MoradorVisita = { nome: string; motivo: string };
export type Morador = MoradorVisita & {
  endereco: string; prazo: string; prazoTone: string; cpf: string;
  dataNascimento: string; idade: number; sexo: string; cartaoSus: string;
  cns?: string; nomeMae: string; logradouro: string; numero: string;
  bairro: string; microarea: string; condicoes: string[]; ultimaVisita: string;
  statusProximaVisita: string; proximaVisita?: string;
};
export type Integrante = { nome: string; parentesco: string; idade: number; condicoes: string[] };
export type Familia = { codigo: string; responsavel: string; integrantes: Integrante[]; historico: { data: string; descricao: string }[] };
export type RegistroVisita = { id: string; data: string; moradorNome: string; motivo: string; desfecho: 'Realizada' | 'Recusada' | 'Ausente'; observacoes: string; acs: string };
export type Perfil = { id: string; nome: string; cpf: string; ubs: string; microarea: string };
export type Preferencias = { modoEscuro: boolean; tamanhoTexto: 'Pequeno' | 'Padrão' | 'Grande'; alertaAtraso: boolean; alertaVacina: boolean };
export const preferenciasPadrao: Preferencias = { modoEscuro: false, tamanhoTexto: 'Padrão', alertaAtraso: true, alertaVacina: true };
export type Workspace = { perfil: Perfil; moradores: Morador[]; familias: Record<string, Familia>; registros: RegistroVisita[]; preferencias: Preferencias; notificacoesLidas: string[]; cadastros: { aba: string; campos: Record<string, string | boolean> }[] };
export function iniciais(nome: string) {
 const partes = nome.trim().split(/\s+/).filter(Boolean);
 return ((partes[0]?.[0] ?? 'A') + (partes.length > 1 ? partes.at(-1)?.[0] ?? '' : '')).toUpperCase();
}
export function dataBr(data: string) {
 const [d,m,a] = data.split('/').map(Number);
 return d && m && a ? new Date(a,m-1,d) : null;
}
export function prazoMorador(m: Morador, hoje = new Date()) {
 const ultima = dataBr(m.ultimaVisita);
 const prevista = ultima ? new Date(ultima.getFullYear(),ultima.getMonth(),ultima.getDate()+30) : m.proximaVisita ? new Date(m.proximaVisita+'T00:00:00') : null;
 if (!prevista) return { diasAtraso: 0, prazo: 'A agendar', prazoTone: 'info' };
 const inicio = new Date(hoje.getFullYear(),hoje.getMonth(),hoje.getDate());
 const dias = Math.round((inicio.getTime()-prevista.getTime())/86400000);
 return { diasAtraso: Math.max(0,dias), prazo: dias > 0 ? 'Atrasada' : dias === 0 ? 'Vence hoje' : `Em ${-dias} dias`, prazoTone: dias > 0 ? 'destructive' : dias === 0 ? 'warning' : 'success' };
}
export function resumo(workspace: Pick<Workspace,'moradores'|'familias'|'registros'>, hoje = new Date()) {
 const mes = workspace.registros.filter(r => { const d = dataBr(r.data); return d?.getMonth() === hoje.getMonth() && d?.getFullYear() === hoje.getFullYear() && r.desfecho === 'Realizada'; });
 const visitados = new Set(mes.map(r=>r.moradorNome));
 const gestantes = workspace.moradores.filter(m=>m.condicoes.includes('Gestante'));
 const cronicos = workspace.moradores.filter(m=>m.condicoes.some(c=>['Hipertenso','Diabético'].includes(c)));
 return { familias: new Set(Object.values(workspace.familias).map(f=>f.codigo)).size, moradores: workspace.moradores.length, visitas: mes.length, atrasadas: workspace.moradores.filter(m=>prazoMorador(m,hoje).diasAtraso>0).length, gestantes: gestantes.length, gestantesVisitadas: gestantes.filter(m=>visitados.has(m.nome)).length, cronicos: cronicos.length, cronicosVisitados: cronicos.filter(m=>visitados.has(m.nome)).length };
}
