import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Eye, EyeOff, HeartPulse, LogIn, UserPlus } from "lucide-react";
import { criarConta, entrar } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Acessar | ACS+ Saúde da Família" },
      {
        name: "description",
        content:
          "Acesso das Agentes Comunitárias de Saúde de Jenipapo dos Vieiras/MA ao sistema ACS+.",
      },
      { property: "og:title", content: "Acessar | ACS+ Saúde da Família" },
      { property: "og:description", content: "Entre ou crie sua conta de agente no ACS+." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
  },
  component: LoginPage,
});

function mascaraCpf(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30";
const labelCls = "mb-1.5 block text-sm font-medium text-foreground";
const btnPrimary =
  "inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50";

function SenhaInput({
  id,
  value,
  onChange,
  autoFocus,
  novaSenha,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
  novaSenha?: boolean;
}) {
  const [ver, setVer] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={ver ? "text" : "password"}
        value={value}
        autoFocus={autoFocus}
        autoComplete={novaSenha ? "new-password" : "current-password"}
        minLength={novaSenha ? 6 : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} pr-11`}
        required
      />
      <button
        type="button"
        onClick={() => setVer((s) => !s)}
        aria-label={ver ? "Ocultar senha" : "Mostrar senha"}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
      >
        {ver ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<"login" | "cadastro">("login");
  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [identificador, setIdentificador] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [ubs, setUbs] = useState("UBS Vila Esperança");
  const [micro, setMicro] = useState("Microárea 01");
  const [novaSenha, setNovaSenha] = useState("");

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const executar = async (acao: () => Promise<void>) => {
    setErro("");
    setCarregando(true);
    try {
      await acao();
      navigate({ to: "/dashboard", replace: true });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível concluir. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  const onLogin = (e: FormEvent) => {
    e.preventDefault();
    if (etapa === 1) {
      if (identificador.trim()) {
        setErro("");
        setEtapa(2);
      }
      return;
    }
    if (senha) void executar(() => entrar(identificador, senha));
  };

  const onCadastro = (e: FormEvent) => {
    e.preventDefault();
    if (nome.trim() && email.includes("@") && cpf.length === 14 && novaSenha.length >= 6)
      void executar(() =>
        criarConta({ nome, email, cpf, ubs, microarea: micro, senha: novaSenha }),
      );
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted">
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl shadow-foreground/5">
          <div className="mb-7 flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
              <HeartPulse className="h-7 w-7" />
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">ACS+</p>
            <p className="text-sm text-muted-foreground">Saúde da Família</p>
          </div>

          {modo === "login" ? (
            <form onSubmit={onLogin} className="space-y-5">
              <h1 className="text-xl font-semibold text-foreground">Acessar</h1>
              {etapa === 1 ? (
                <div>
                  <label htmlFor="ident" className={labelCls}>
                    Digite seu e-mail
                  </label>
                  <input
                    id="ident"
                    value={identificador}
                    onChange={(e) => setIdentificador(e.target.value)}
                    placeholder="nome@exemplo.com"
                    className={inputCls}
                    autoComplete="username"
                    autoFocus
                    required
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setEtapa(1)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-3 w-3" /> {identificador}
                  </button>
                  <div>
                    <label htmlFor="senha" className={labelCls}>
                      Senha
                    </label>
                    <SenhaInput id="senha" value={senha} onChange={setSenha} autoFocus />
                  </div>
                </div>
              )}
              {erro && (
                <p
                  role="alert"
                  className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {erro}
                </p>
              )}
              <button type="submit" className={btnPrimary} disabled={carregando}>
                {etapa === 1 ? (
                  "Próximo"
                ) : carregando ? (
                  "Entrando..."
                ) : (
                  <>
                    <LogIn className="h-4 w-4" /> Entrar
                  </>
                )}
              </button>

              <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                <span className="h-px flex-1 bg-border" /> OU{" "}
                <span className="h-px flex-1 bg-border" />
              </div>

              <button
                type="button"
                onClick={() => {
                  setErro("");
                  setModo("cadastro");
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-accent"
              >
                <UserPlus className="h-4 w-4" /> Cadastrar
              </button>
            </form>
          ) : (
            <form onSubmit={onCadastro} className="space-y-4">
              <h1 className="text-xl font-semibold text-foreground">Criar Conta de Agente</h1>
              <div>
                <label htmlFor="nome" className={labelCls}>
                  Nome Completo
                </label>
                <input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label htmlFor="cpf" className={labelCls}>
                  CPF
                </label>
                <input
                  id="cpf"
                  inputMode="numeric"
                  autoComplete="off"
                  value={cpf}
                  onChange={(e) => setCpf(mascaraCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className={labelCls}>
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@exemplo.com"
                  className={inputCls}
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="ubs" className={labelCls}>
                    Unidade Básica de Saúde
                  </label>
                  <select
                    id="ubs"
                    value={ubs}
                    onChange={(e) => setUbs(e.target.value)}
                    className={inputCls}
                  >
                    <option>UBS Vila Esperança</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="micro" className={labelCls}>
                    Microárea
                  </label>
                  <select
                    id="micro"
                    value={micro}
                    onChange={(e) => setMicro(e.target.value)}
                    className={inputCls}
                  >
                    <option>Microárea 01</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="nova" className={labelCls}>
                  Criar Senha
                </label>
                <SenhaInput id="nova" value={novaSenha} onChange={setNovaSenha} novaSenha />
                <p className="mt-1 text-xs text-muted-foreground">Mínimo de 6 caracteres.</p>
              </div>
              {erro && (
                <p
                  role="alert"
                  className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {erro}
                </p>
              )}
              <button
                type="submit"
                className={btnPrimary}
                disabled={
                  carregando ||
                  !email.includes("@") ||
                  cpf.length !== 14 ||
                  novaSenha.length < 6 ||
                  !nome.trim()
                }
              >
                {carregando ? "Criando conta..." : "Concluir Cadastro"}
              </button>
              <p className="text-center text-sm text-muted-foreground">
                Já tenho conta /{" "}
                <button
                  type="button"
                  onClick={() => {
                    setErro("");
                    setModo("login");
                    setEtapa(1);
                  }}
                  className="font-semibold text-primary hover:underline"
                >
                  Entrar
                </button>
              </p>
            </form>
          )}
        </div>
      </main>
      <footer className="px-4 pb-6 text-center text-xs text-muted-foreground">
        Prefeitura Municipal de Jenipapo dos Vieiras/MA — Secretaria Municipal de Saúde
      </footer>
    </div>
  );
}
