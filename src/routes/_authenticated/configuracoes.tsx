import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bell,
  CloudUpload,
  KeyRound,
  LifeBuoy,
  Moon,
  Settings as SettingsIcon,
  Type,
  UserCircle2,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({
    meta: [
      { title: "ACS+ | Configurações do Sistema" },
      {
        name: "description",
        content:
          "Configurações do ACS+: perfil da Agente Comunitária de Saúde, preferências visuais, notificações, sincronização offline e versão do sistema.",
      },
      { property: "og:title", content: "ACS+ | Configurações do Sistema" },
      {
        property: "og:description",
        content: "Perfil do agente, preferências visuais, notificações e sincronização de dados do ACS+.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConfiguracoesPage,
});

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-muted-foreground/30"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function ConfiguracoesPage() {
  const [modoEscuro, setModoEscuro] = useState(false);
  const [tamanhoTexto, setTamanhoTexto] = useState<"Pequeno" | "Padrão" | "Grande">("Padrão");
  const [alertaAtraso, setAlertaAtraso] = useState(true);
  const [alertaVacina, setAlertaVacina] = useState(true);
  const [sincronizando, setSincronizando] = useState(false);
  const [ultimaSync, setUltimaSync] = useState("23/09/2026 às 08:45");
  const [alterarSenhaAberto, setAlterarSenhaAberto] = useState(false);
  const [senhaSalva, setSenhaSalva] = useState(false);
  const [salvo, setSalvo] = useState(false);

  const sincronizar = () => {
    setSincronizando(true);
    setTimeout(() => {
      setSincronizando(false);
      setUltimaSync("23/09/2026 às 09:27");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Dashboard
        </Link>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <SettingsIcon className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Configurações do Sistema</h1>
            <p className="text-sm text-muted-foreground">
              Perfil, preferências, notificações e sincronização do ACS+.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {/* Perfil do Agente */}
          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <UserCircle2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Perfil do Agente</h2>
            </div>
            <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                IF
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-foreground">Iracélia Felício</p>
                <p className="text-sm text-muted-foreground">Agente Comunitária de Saúde</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-secondary px-3 py-1 font-medium text-secondary-foreground">
                    UBS Vila Esperança
                  </span>
                  <span className="rounded-full bg-accent px-3 py-1 font-medium text-accent-foreground">
                    Microárea 01
                  </span>
                  <span className="rounded-full bg-secondary px-3 py-1 font-medium text-secondary-foreground">
                    Jenipapo dos Vieiras/MA
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAlterarSenhaAberto(true);
                  setSenhaSalva(false);
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-input px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <KeyRound className="h-4 w-4" />
                Alterar senha
              </button>
            </div>

            {alterarSenhaAberto && (
              <form
                className="mt-5 space-y-3 rounded-lg border bg-muted/40 p-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSenhaSalva(true);
                  setTimeout(() => setAlterarSenhaAberto(false), 1500);
                }}
              >
                {senhaSalva ? (
                  <p className="rounded-lg bg-success/15 px-4 py-3 text-sm font-medium text-success">
                    Senha alterada com sucesso!
                  </p>
                ) : (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        type="password"
                        required
                        placeholder="Senha atual"
                        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="Nova senha"
                        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setAlterarSenhaAberto(false)}
                        className="rounded-lg border border-input px-4 py-2 text-sm font-medium hover:bg-muted"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                      >
                        Confirmar nova senha
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}
          </section>

          {/* Preferências Visuais */}
          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Preferências Visuais</h2>
            </div>
            <div className="mt-3 divide-y divide-border">
              <Toggle
                checked={modoEscuro}
                onChange={setModoEscuro}
                label="Modo Escuro"
                description="Reduz o brilho da tela para uso noturno em campo."
              />
              <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Tamanho do texto</p>
                    <p className="text-xs text-muted-foreground">Ajusta a legibilidade do painel.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {(["Pequeno", "Padrão", "Grande"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTamanhoTexto(t)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                        tamanhoTexto === t
                          ? "bg-primary text-primary-foreground"
                          : "border border-input text-foreground hover:bg-muted"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Notificações */}
          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Notificações</h2>
            </div>
            <div className="mt-3 divide-y divide-border">
              <Toggle
                checked={alertaAtraso}
                onChange={setAlertaAtraso}
                label="Alertas de visitas atrasadas"
                description="Avisos sobre visitas fora do prazo na microárea."
              />
              <Toggle
                checked={alertaVacina}
                onChange={setAlertaVacina}
                label="Vacinas pendentes"
                description="Lembretes de imunização em atraso dos moradores."
              />
            </div>
          </section>

          {/* Sincronização */}
          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <CloudUpload className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Sincronização</h2>
            </div>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Envio de dados offline</p>
                <p className="text-xs text-muted-foreground">
                  Registros coletados sem internet são enviados ao sistema assim que houver conexão.
                </p>
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  {sincronizando ? "Sincronizando dados..." : `Última sincronização: ${ultimaSync}`}
                </p>
              </div>
              <button
                type="button"
                onClick={sincronizar}
                disabled={sincronizando}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                <CloudUpload className="h-4 w-4" />
                {sincronizando ? "Sincronizando..." : "Sincronizar Agora"}
              </button>
            </div>
          </section>

          {/* Suporte e Versão */}
          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Suporte e Versão</h2>
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">
              ACS+ v1.0.0 — Sistema de Gestão de Saúde da Família
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Prefeitura Municipal de Jenipapo dos Vieiras/MA · Secretaria Municipal de Saúde.
            </p>
          </section>

          {/* Salvar */}
          <div className="flex items-center justify-end gap-3 pb-8">
            {salvo && (
              <p className="rounded-lg bg-success/15 px-4 py-2 text-sm font-medium text-success">
                Alterações salvas com sucesso!
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                setSalvo(true);
                setTimeout(() => setSalvo(false), 2500);
              }}
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Salvar alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
