const KEY = "acs-sessao";

export function isAutenticado() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "ativa";
}

export function entrar() {
  window.localStorage.setItem(KEY, "ativa");
}

export function sair() {
  window.localStorage.removeItem(KEY);
}
