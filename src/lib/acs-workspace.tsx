import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { queryOptions, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { preferenciasPadrao, prazoMorador, type Workspace, type Morador, type Familia } from './acs-model';

export const workspaceOptions = (userId: string) => queryOptions({
 queryKey: ['acs-workspace', userId],
 queryFn: async (): Promise<Workspace> => {
  const [p,w] = await Promise.all([supabase.from('profiles').select('*').eq('id',userId).single(),supabase.from('acs_workspaces').select('*').eq('user_id',userId).single()]);
  if(p.error || w.error) throw new Error('Não foi possível carregar sua conta. Tente novamente.');
  return { perfil:p.data, moradores:w.data.moradores as unknown as Workspace['moradores'], familias:w.data.familias as unknown as Workspace['familias'], registros:w.data.visitas as unknown as Workspace['registros'], preferencias:{...preferenciasPadrao,...w.data.preferencias as object}, notificacoesLidas:w.data.notificacoes_lidas as string[], cadastros:w.data.cadastros as unknown as Workspace['cadastros'] };
 },
 staleTime: 0,
});
type Conta = Workspace & { visitas: Morador[]; refresh: () => Promise<void>; salvar: (kind: string,payload: unknown)=>Promise<void>; cadastrar: (morador: Morador,familia: Familia)=>Promise<void> };
const Context = createContext<Conta | null>(null);
export function WorkspaceProvider({ userId, children }: { userId: string; children: ReactNode }) {
 const { data } = useSuspenseQuery(workspaceOptions(userId));
 const queryClient = useQueryClient();
 const refresh = async () => { await queryClient.invalidateQueries({queryKey:['acs-workspace',userId]}); };
 const salvar = async (kind: string,payload: unknown) => {
  const {error} = await supabase.rpc('save_acs_information',{kind,payload:payload as Json});
  if(error) throw new Error(error.message);
  await refresh();
 };
 useEffect(()=>{
  document.documentElement.classList.toggle('dark', data.preferencias.modoEscuro);
  document.documentElement.style.fontSize = data.preferencias.tamanhoTexto === 'Grande' ? '18px' : data.preferencias.tamanhoTexto === 'Pequeno' ? '14px' : '16px';
  return ()=>{document.documentElement.classList.remove('dark');document.documentElement.style.fontSize='';};
 },[data.preferencias]);
 return <Context.Provider value={{...data,visitas:data.moradores.map(m=>({...m,...prazoMorador(m)})),refresh,salvar,cadastrar:async (morador,familia)=>salvar('morador',{morador,familia})}}>{children}</Context.Provider>;
}
export function useACS() { const c=useContext(Context); if(!c) throw new Error('Abra sua conta para acessar os acompanhamentos.'); return c; }
