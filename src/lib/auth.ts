import type { QueryClient } from "@tanstack/react-query";
import { isAuthWeakPasswordError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const soDigitos = (valor: string) => valor.replace(/\D/g, "");

export function emailDeAcesso(identificador: string) {
  const valor = identificador.trim().toLowerCase();
  if (!valor.includes("@")) throw new Error("Entre com o e-mail que você cadastrou.");
  return valor;
}

export async function entrar(identificador: string, senha: string) {
  let email: string;
  try {
    email = emailDeAcesso(identificador);
  } catch (e) {
    throw e instanceof Error ? e : new Error("E-mail inválido.");
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) throw new Error(traduzirErro(error));
}

function traduzirSenhaFraca(reasons: string[]) {
  if (reasons.includes("pwned"))
    return "Essa senha é muito comum e já apareceu em vazamentos de dados. Escolha outra, menos previsível.";
  if (reasons.includes("characters"))
    return "A senha precisa misturar letras maiúsculas, minúsculas, números e símbolos (ex.: @, #, !).";
  if (reasons.includes("length")) return "A senha é curta demais. Use mais caracteres.";
  return "Senha fraca demais. Use letras, números e símbolos.";
}

function traduzirErro(erro: { message: string }) {
  if (isAuthWeakPasswordError(erro)) return traduzirSenhaFraca(erro.reasons);
  const mensagem = erro.message;
  const m = mensagem.toLowerCase();
  if (m.includes("invalid login")) return "E-mail ou senha incorretos.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Já existe uma conta com este e-mail.";
  if (m.includes("database error")) return "Este CPF já está cadastrado em outra conta.";
  if (m.includes("domain has no mail server") || m.includes("invalid email"))
    return "E-mail inválido. Confira o endereço digitado.";
  if (m.includes("password") && m.includes("least"))
    return "A senha precisa ter pelo menos 6 caracteres.";
  if (m.includes("rate limit")) return "Muitas tentativas. Aguarde alguns minutos e tente de novo.";
  if (m.includes("failed to fetch") || m.includes("network"))
    return "Sem conexão com o servidor. Verifique a internet e tente novamente.";
  //return "Não foi possível concluir. Tente novamente.";

  console.error("[auth]", erro);
  return `Não foi possível concluir: ${erro.message}`;
}

export type NovaConta = {
  nome: string;
  email: string;
  cpf: string;
  ubs: string;
  microarea: string;
  senha: string;
};

export async function criarConta({ nome, email, cpf, ubs, microarea, senha }: NovaConta) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password: senha,
    options: { data: { nome: nome.trim(), cpf: soDigitos(cpf), ubs, microarea } },
  });
  if (error) throw new Error(traduzirErro(error));
  if (!data.session) {
    throw new Error(
      "Conta criada, mas o servidor exige confirmação de e-mail. Desative “Confirm email” no Supabase ou confirme pelo link enviado ao seu e-mail.",
    );
  }
}

export async function sair(queryClient?: QueryClient) {
  await supabase.auth.signOut();
  // Limpa o cache para que os dados de uma conta nunca apareçam na próxima.
  queryClient?.clear();
}

export async function alterarSenha(senhaAtual: string, novaSenha: string) {
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email;
  if (!email) throw new Error("Sessão expirada. Entre novamente.");
  const conferida = await supabase.auth.signInWithPassword({ email, password: senhaAtual });
  if (conferida.error) throw new Error("A senha atual está incorreta.");
  const { error } = await supabase.auth.updateUser({ password: novaSenha });
  if (error) throw new Error(traduzirErro(error));
}
