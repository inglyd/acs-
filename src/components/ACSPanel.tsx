import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { sair } from "@/lib/auth";
import { useACS } from "@/lib/acs-workspace";
import { iniciais, resumo, type Morador, type MoradorVisita } from "@/lib/acs-model";
export type { Morador, MoradorVisita, Familia, Integrante } from "@/lib/acs-model";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Activity,
  AlertTriangle,
  Bell,
  CalendarClock,
  Check,
  CheckCheck,
  ClipboardList,
  HeartPulse,
  Home,
  Info,
  MapPin,
  Search,
  Settings,
  UserPlus,
  Users,
  UsersRound,
  ChevronRight,
  ChevronDown,
  LogOut,
  Stethoscope,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NovoCadastroWizard } from "@/components/NovoCadastroWizard";
import { ExportarRelatorioButton } from "@/components/RelatorioPdfModal";

const navItems = [
  { title: "Dashboard", icon: Home, to: "/dashboard" },
  { title: "Cadastros", icon: MapPin, to: "/cadastros" },
  { title: "Famílias", icon: UsersRound, to: "/familias" },
  { title: "Moradores", icon: Users, to: "/moradores" },
  { title: "Visitas Domiciliares", icon: ClipboardList, to: "/visitas" },
  { title: "Alertas & Pendências", icon: AlertTriangle, badge: 14, to: "/alertas" },
  { title: "Configurações", icon: Settings, to: "/configuracoes" },
] as const;

const inputCls =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring";

export function RegistrarVisitaModal({
  morador,
  onClose,
}: {
  morador: MoradorVisita | null;
  onClose: () => void;
}) {
  const { visitas, salvar } = useACS();
  const [salvo, setSalvo] = useState(false);
  const [enviando, setEnviando] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">Registrar Visita Domiciliar</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {morador ? `${morador.nome} · ${morador.motivo}` : "Selecione o morador visitado"}
        </p>

        {salvo ? (
          <div className="mt-6 rounded-lg bg-success/15 px-4 py-3 text-sm font-medium text-success">
            Visita registrada com sucesso!
          </div>
        ) : (
          <form
            className="mt-5 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const nome = morador?.nome ?? String(f.get("morador") ?? "");
              if (!nome || enviando) return;
              setEnviando(true);
              try {
                const [a,m,d] = String(f.get("data")).split("-");
                await salvar("visita", { data: `${d}/${m}/${a}`, moradorNome: nome, motivo: String(f.get("motivo")), desfecho: String(f.get("desfecho")), observacoes: String(f.get("observacoes")) });
                setSalvo(true);
                setTimeout(onClose, 1200);
              } catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível salvar a visita."); }
              finally { setEnviando(false); }
            }}
          >
            {!morador && (
              <div>
                <label className="mb-1.5 block text-sm font-medium">Morador</label>
                <select name="morador" required className={inputCls}>
                  {visitas.map((v) => (
                    <option key={v.nome}>{v.nome}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium">Data da Visita</label>
              <input name="data" type="date" required className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Motivo</label>
              <select name="motivo" className={inputCls}>
                <option>Acompanhamento</option>
                <option>Busca Ativa</option>
                <option>Vacinação</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Desfecho</label>
              <select name="desfecho" className={inputCls}>
                <option>Realizada</option>
                <option>Recusada</option>
                <option>Ausente</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Observações do Atendimento</label>
              <textarea name="observacoes"
                rows={3}
                placeholder="Ex.: PA aferida, orientações reforçadas..."
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="submit" disabled={enviando || visitas.length === 0}
                className="flex-1 rounded-lg bg-success px-4 py-2.5 text-sm font-semibold text-success-foreground hover:opacity-90"
              >
                {enviando ? "Salvando..." : "Salvar Visita"}
              </Button>
              <Button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-input px-4 py-2.5 text-sm font-medium hover:bg-muted"
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function condicaoBadgeClasses(condicao: string) {
  const c = condicao.toLowerCase();
  if (c.includes("gestante")) return "bg-chart-3/15 text-chart-3 border-chart-3/20";
  if (c.includes("hipertenso")) return "bg-destructive/10 text-destructive border-destructive/20";
  if (c.includes("diabético") || c.includes("diabetico")) return "bg-primary/10 text-primary border-primary/20";
  if (c.includes("idoso")) return "bg-warning/30 text-warning-foreground border-warning/40";
  if (c.includes("puericultura")) return "bg-success/15 text-success border-success/20";
  if (c.includes("tuberculose")) return "bg-muted text-muted-foreground border-input";
  return "bg-muted text-muted-foreground border-input";
}

function calcularIdade(dataNascimento: string) {
  const [dia, mes, ano] = dataNascimento.split('/').map(Number);
  if (!ano || !mes || !dia) return 0;
  const nascimento = new Date(ano, mes - 1, dia);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--;
  return idade;
}

export function DetalhesMoradorModal({
  morador,
  onClose,
  onRegistrarVisita,
}: {
  morador: Morador;
  onClose: () => void;
  onRegistrarVisita: (m: MoradorVisita) => void;
}) {
  const { familias } = useACS();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">Detalhes do Morador</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{morador.nome}</p>
          </div>
          <Button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
            aria-label="Fechar"
          >
            ×
          </Button>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">Identificação do SUS</h3>
            <div className="space-y-3 rounded-lg border bg-background p-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">CPF · Identificador Principal do Cartão SUS</p>
                <p className="mt-0.5 text-lg font-bold text-primary">{morador.cpf}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Número do Cartão SUS (CNS)</p>
                <p className="mt-0.5 font-medium">{morador.cns ?? "Identificado via CPF"}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">Dados Pessoais</h3>
            <div className="grid grid-cols-2 gap-3 rounded-lg border bg-background p-4 text-sm">
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Nome Completo</p>
                <p className="font-medium">{morador.nome}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Data de Nascimento</p>
                <p className="font-medium">
                  {morador.dataNascimento}{" "}
                  <span className="text-muted-foreground">({calcularIdade(morador.dataNascimento)} anos)</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sexo</p>
                <p className="font-medium">{morador.sexo}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Nome da Mãe</p>
                <p className="font-medium">{morador.nomeMae}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">Endereço & Microárea</h3>
            <div className="rounded-lg border bg-background p-4 text-sm">
              <p className="font-medium">
                {morador.logradouro}, {morador.numero}
              </p>
              <p className="text-muted-foreground">{morador.bairro}</p>
              <div className="mt-2 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                {morador.microarea}
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">Condições de Saúde</h3>
            <div className="flex flex-wrap gap-2">
              {morador.condicoes.map((c) => (
                <span
                  key={c}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium ${condicaoBadgeClasses(c)}`}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">Histórico Recente</h3>
            <div className="grid grid-cols-2 gap-3 rounded-lg border bg-background p-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Última Visita Realizada</p>
                <p className="font-medium">{morador.ultimaVisita}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status da Próxima Visita</p>
                <p className="font-medium">{morador.statusProximaVisita}</p>
              </div>
            </div>
          </div>

          {familias[morador.nome] && (
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">Família</h3>
              <div className="space-y-4 rounded-lg border bg-background p-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Código da Família</p>
                    <p className="font-medium">{familias[morador.nome]?.codigo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Responsável Familiar</p>
                    <p className="font-medium">{familias[morador.nome]?.responsavel}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Endereço</p>
                    <p className="font-medium">
                      {morador.logradouro}, {morador.numero} — {morador.bairro}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Microárea</p>
                    <p className="font-medium">{morador.microarea}</p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Integrantes ({familias[morador.nome]?.integrantes.length})
                  </p>
                  <ul className="space-y-2">
                    {familias[morador.nome]?.integrantes.map((i) => (
                      <li
                        key={i.nome}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2"
                      >
                        <div>
                          <p className="font-medium">{i.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {i.parentesco} · {i.idade} anos
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {i.condicoes.length === 0 ? (
                            <span className="rounded-full border border-input bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              Sem condição prioritária
                            </span>
                          ) : (
                            i.condicoes.map((c) => (
                              <span
                                key={c}
                                className={`rounded-full border px-2 py-0.5 text-xs font-medium ${condicaoBadgeClasses(c)}`}
                              >
                                {c}
                              </span>
                            ))
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Histórico da Família</p>
                  <ul className="space-y-1.5">
                    {familias[morador.nome]?.historico.map((h) => (
                      <li key={h.data} className="flex gap-2">
                        <span className="shrink-0 font-medium text-primary">{h.data}</span>
                        <span className="text-muted-foreground">{h.descricao}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>


        <div className="mt-6 flex gap-3">
          <Button
            type="button"
            onClick={() => {
              onClose();
              onRegistrarVisita({ nome: morador.nome, motivo: morador.motivo });
            }}
            className="flex-1 rounded-lg bg-success px-4 py-2.5 text-sm font-semibold text-success-foreground hover:opacity-90"
          >
            Registrar Visita para este Morador
          </Button>
          <Button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-input px-4 py-2.5 text-sm font-medium hover:bg-muted"
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}

const kpis = [
  { title: "Total de Famílias", value: 176, icon: UsersRound, tone: "primary" },
  { title: "Moradores Acompanhados", value: 344, icon: Users, tone: "success" },
  { title: "Visitas Realizadas no Mês", value: 29, icon: ClipboardList, tone: "chart3" },
  { title: "Visitas em Atraso", value: 14, icon: AlertTriangle, tone: "destructive", highlight: true },
] as const;

type Notificacao = {
  id: string;
  categoria: "urgente" | "prazo" | "info";
  titulo: string;
  descricao: string;
  morador?: string;
  microarea?: string;
  lida: boolean;
};

function categoriaNotificacao(categoria: Notificacao["categoria"]) {
  switch (categoria) {
    case "urgente":
      return {
        icon: AlertTriangle,
        badge: "bg-destructive/10 text-destructive border-destructive/20",
        dot: "bg-destructive",
        label: "Urgente",
      };
    case "prazo":
      return {
        icon: ClockIcon,
        badge: "bg-warning/30 text-warning-foreground border-warning/40",
        dot: "bg-warning",
        label: "Prazo",
      };
    default:
      return {
        icon: Info,
        badge: "bg-primary/10 text-primary border-primary/20",
        dot: "bg-primary",
        label: "Info",
      };
  }
}

function ClockIcon(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IndicadorConexao() {
  const [online, setOnline] = useState(true);
  const [tooltipAberto, setTooltipAberto] = useState(false);

  return (
    <div
      className="relative hidden sm:block"
      onMouseEnter={() => setTooltipAberto(true)}
      onMouseLeave={() => setTooltipAberto(false)}
    >
      <Button
        type="button"
        aria-label={online ? "Conexão online" : "Conexão offline"}
        aria-describedby="indicador-conexao-tooltip"
        onClick={() => {
          setOnline((v) => !v);
          setTooltipAberto(true);
          window.setTimeout(() => setTooltipAberto(false), 4000);
        }}
        className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors ${
          online
            ? "border-success/30 bg-success/10 text-success hover:bg-success/15"
            : "border-warning/40 bg-warning/15 text-warning-foreground hover:bg-warning/20"
        }`}
      >
        {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
        <span
          className={`h-1.5 w-1.5 rounded-full ${online ? "animate-pulse bg-success" : "bg-warning"}`}
        />
        <span className="hidden md:inline">{online ? "Online" : "Modo Offline"}</span>
        <span className="md:hidden">{online ? "On" : "Off"}</span>
      </Button>
      {tooltipAberto && (
        <div
          id="indicador-conexao-tooltip"
          role="tooltip"
          className="absolute right-0 top-full z-30 mt-2 w-72 rounded-lg border bg-popover p-3 text-xs leading-relaxed text-popover-foreground shadow-md"
        >
          <p className="font-semibold">{online ? "Conectado" : "Modo Offline"}</p>
          <p className="mt-1 text-muted-foreground">
            {online
              ? "Acompanhamentos salvos na sua conta ACS+."
              : "Sem conexão: aguarde a internet voltar antes de salvar cadastros ou visitas."}
          </p>
        </div>
      )}
    </div>
  );
}

function NotificacoesPopover({
  notificacoes,
  onLerTodas,
  onToggleLida,
  onVerDetalhes,
  onRegistrarVisita,
  onClose,
}: {
  notificacoes: Notificacao[];
  onLerTodas: () => void;
  onToggleLida: (id: string) => void;
  onVerDetalhes: (morador: Morador) => void;
  onRegistrarVisita: (morador: Morador) => void;
  onClose: () => void;
}) {
  const { visitas } = useACS();
  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  return (
    <div
      className="fixed inset-0 z-40 md:absolute md:inset-auto md:right-0 md:top-full md:mt-2 md:h-auto md:w-96 md:bg-transparent"
      onClick={onClose}
    >
      <div
        className="absolute right-0 top-16 w-full max-w-sm rounded-xl border bg-card p-0 shadow-xl md:static md:w-full md:max-w-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h3 className="font-semibold">Notificações de Alertas</h3>
            <p className="text-xs text-muted-foreground">
              {naoLidas === 0 ? "Todas lidas" : `${naoLidas} não ${naoLidas === 1 ? "lida" : "lidas"}`}
            </p>
          </div>
          <Button
            type="button"
            onClick={onLerTodas}
            disabled={naoLidas === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-input px-2.5 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Marcar todas como lidas
          </Button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto md:max-h-96">
          {notificacoes.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhuma notificação no momento.</div>
          ) : (
            <ul className="divide-y">
              {notificacoes.map((n) => {
                const { icon: Icon, badge, dot } = categoriaNotificacao(n.categoria);
                const morador = n.morador ? visitas.find((v) => v.nome === n.morador) : undefined;
                return (
                  <li
                    key={n.id}
                    className={`flex gap-3 px-4 py-3 ${n.lida ? "bg-muted/30" : "bg-card"}`}
                  >
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${badge}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold">{n.titulo}</p>
                        {!n.lida && <span className={`h-2 w-2 rounded-full ${dot}`} />}
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">{n.descricao}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {morador ? (
                          <>
                            <Button
                              type="button"
                              onClick={() => onVerDetalhes(morador)}
                              className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20"
                            >
                              Ver Detalhes
                            </Button>
                            <Button
                              type="button"
                              onClick={() => onRegistrarVisita(morador)}
                              className="inline-flex items-center gap-1 rounded-md bg-success/15 px-2 py-1 text-xs font-semibold text-success hover:bg-success/25"
                            >
                              Registrar Visita
                            </Button>
                          </>
                        ) : n.microarea ? (
                          <Link
                            to="/cadastros"
                            onClick={onClose}
                            className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20"
                          >
                            Ver Cadastros
                          </Link>
                        ) : null}
                        <Button
                          type="button"
                          onClick={() => onToggleLida(n.id)}
                          className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                          title={n.lida ? "Marcar como não lida" : "Marcar como lida"}
                        >
                          <Check className={`h-3.5 w-3.5 ${n.lida ? "text-muted-foreground" : "text-primary"}`} />
                          {n.lida ? "Não lida" : "Lida"}
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function prazoClasses(tone: string) {
  switch (tone) {
    case "destructive":
      return "bg-destructive/10 text-destructive";
    case "warning":
      return "bg-warning/40 text-warning-foreground";
    default:
      return "bg-success/15 text-success";
  }
}

function MenuPerfil({ onSair }: { onSair: () => void }) {
  const { perfil } = useACS();
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const fecharFora = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    };
    const fecharEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    document.addEventListener("mousedown", fecharFora);
    document.addEventListener("keydown", fecharEsc);
    return () => {
      document.removeEventListener("mousedown", fecharFora);
      document.removeEventListener("keydown", fecharEsc);
    };
  }, [aberto]);

  return (
    <div className="relative" ref={ref}>
      <Button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-label={`Menu do perfil de ${perfil.nome}`}
        className={`flex items-center gap-2 rounded-full p-1 transition hover:bg-muted sm:pr-3 ${
          aberto ? "bg-muted" : ""
        }`}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {iniciais(perfil.nome)}
        </span>
        <span className="hidden text-left lg:block">
          <span className="block text-sm font-medium leading-tight">{perfil.nome}</span>
          <span className="block text-xs leading-tight text-muted-foreground">ACS · {perfil.microarea}</span>
        </span>
        <ChevronDown
          className={`hidden h-4 w-4 text-muted-foreground transition lg:block ${aberto ? "rotate-180" : ""}`}
        />
      </Button>
      {aberto && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-xl border bg-card shadow-xl"
        >
          <div className="flex items-center gap-3 border-b border-border p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {iniciais(perfil.nome)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight">{perfil.nome}</p>
              <p className="truncate text-xs leading-tight text-muted-foreground">
                ACS · {perfil.ubs}
              </p>
            </div>
          </div>
          <div className="p-1.5">
            <Button
              type="button"
              role="menuitem"
              onClick={() => {
                setAberto(false);
                onSair();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" /> Sair
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const conta = useACS();
  const { perfil, visitas, salvar, notificacoesLidas } = conta;
  const numeros = resumo(conta);
  const valores = [numeros.familias, numeros.moradores, numeros.visitas, numeros.atrasadas];
  const notificacoes: Notificacao[] = visitas.filter(m => (conta.preferencias.alertaAtraso && m.prazoTone === "destructive") || (conta.preferencias.alertaVacina && m.condicoes.includes("Vacina pendente"))).map(m => ({ id: m.cpf, categoria: m.prazoTone === "destructive" ? "urgente" : "prazo", titulo: m.prazoTone === "destructive" ? "Visita atrasada" : "Vacina pendente", descricao: `${m.nome} · ${m.motivo}`, morador: m.nome, lida: notificacoesLidas.includes(m.cpf) }));
  const atualizarLidas = (ids: string[]) => { void salvar("notificacoes",ids).catch(()=>toast.error("Não foi possível atualizar as notificações.")); };
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [visitaAberta, setVisitaAberta] = useState<MoradorVisita | null>(null);
  const [modalAberta, setModalAberta] = useState(false);
  const [detalhesMorador, setDetalhesMorador] = useState<Morador | null>(null);
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
  const [wizardAberto, setWizardAberto] = useState(false);
  const [, setVersao] = useState(0);
  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <HeartPulse className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight text-sidebar-accent-foreground">ACS+</p>
            <p className="text-[11px] text-sidebar-foreground/70">Saúde da Família</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {navItems.map((item) => {
            const active = activeNav === item.title;
            const cls = `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            }`;
            const inner = (
              <>
                <item.icon className="h-4.5 w-4.5 shrink-0" />
                <span className="flex-1 text-left">{item.title}</span>
                {"badge" in item && item.badge && (
                  <span className="rounded-full bg-destructive px-2 py-0.5 text-[11px] font-semibold text-destructive-foreground">
                    {numeros.atrasadas}
                  </span>
                )}
              </>
            );
            return (
              <Link key={item.title} to={item.to} onClick={() => setActiveNav(item.title)} className={cls}>
                {inner}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-sidebar-accent/50 px-3 py-2 text-xs text-sidebar-foreground/80">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            Jenipapo dos Vieiras/MA
          </div>
          <Button className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-sidebar-accent/50">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
              {iniciais(perfil.nome)}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-sidebar-accent-foreground">{perfil.nome}</p>
              <p className="text-[11px] text-sidebar-foreground/70">Agente Comunitária</p>
            </div>
            <ChevronRight className="h-4 w-4 text-sidebar-foreground/60" />
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-h-screen flex-1 flex-col md:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-8">
          <div className="flex md:hidden items-center gap-2 font-bold text-primary">
            <HeartPulse className="h-6 w-6" /> ACS+
          </div>
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Buscar morador, CPF, família..."
              className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="relative">
              <Button
                type="button"
                onClick={() => setNotificacoesAbertas((v) => !v)}
                className={`relative rounded-lg p-2 hover:bg-muted ${notificacoesAbertas ? "bg-muted text-foreground" : "text-muted-foreground"}`}
                aria-label="Notificações"
                aria-expanded={notificacoesAbertas}
              >
                <Bell className="h-5 w-5" />
                {notificacoes.some((n) => !n.lida) && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                    {notificacoes.filter((n) => !n.lida).length}
                  </span>
                )}
              </Button>
              {notificacoesAbertas && (
                <NotificacoesPopover
                  notificacoes={notificacoes}
                  onClose={() => setNotificacoesAbertas(false)}
                  onLerTodas={() => atualizarLidas(notificacoes.map(n=>n.id))}
                  onToggleLida={(id) =>
                    atualizarLidas(notificacoesLidas.includes(id) ? notificacoesLidas.filter(x=>x!==id) : [...notificacoesLidas,id])
                  }
                  onVerDetalhes={(m) => {
                    setNotificacoesAbertas(false);
                    setDetalhesMorador(m);
                  }}
                  onRegistrarVisita={(m) => {
                    setNotificacoesAbertas(false);
                    setVisitaAberta({ nome: m.nome, motivo: m.motivo });
                    setModalAberta(true);
                  }}
                />
              )}
            </div>
            <IndicadorConexao />
            <MenuPerfil
              onSair={async () => {
                await sair(router.options.context.queryClient);
                navigate({ to: "/login", replace: true });
              }}
            />
          </div>
        </header>

        <main className="flex-1 space-y-6 p-4 md:p-8">
          {/* Boas-vindas */}
          <section className="flex flex-col gap-4 rounded-xl bg-primary p-6 text-primary-foreground md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm capitalize opacity-80">{hoje}</p>
              <h1 className="mt-1 text-2xl font-bold">Olá, {perfil.nome.split(" ")[0]}! Bom dia de trabalho.</h1>
              <p className="mt-1 text-sm opacity-80">
                {perfil.microarea} · {perfil.ubs} · {numeros.familias} famílias sob seu acompanhamento.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setWizardAberto(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-card px-4 py-2.5 text-sm font-semibold text-primary shadow-sm hover:opacity-90"
              >
                <UserPlus className="h-4 w-4" /> Novo Cadastro
              </Button>
              {wizardAberto && (
                <NovoCadastroWizard onClose={() => setWizardAberto(false)} onConcluido={() => setVersao((v) => v + 1)} />
              )}
              <Button
                onClick={() => {
                  setVisitaAberta(null);
                  setModalAberta(true);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-success px-4 py-2.5 text-sm font-semibold text-success-foreground shadow-sm hover:opacity-90"
              >
                <Stethoscope className="h-4 w-4" /> Registrar Visita
              </Button>
              <ExportarRelatorioButton className="border border-primary-foreground/40 bg-primary-foreground/10 text-primary-foreground" />
            </div>
          </section>

          {/* KPIs */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi, index) => (
              <div
                key={kpi.title}
                className={`rounded-xl border bg-card p-5 shadow-sm ${
                  "highlight" in kpi && kpi.highlight ? "border-destructive/40 bg-destructive/5" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      kpi.tone === "success"
                        ? "bg-success/15 text-success"
                        : kpi.tone === "destructive"
                          ? "bg-destructive/15 text-destructive"
                          : kpi.tone === "chart3"
                            ? "bg-chart-3/15 text-chart-3"
                            : "bg-primary/10 text-primary"
                    }`}
                  >
                    <kpi.icon className="h-5 w-5" />
                  </div>
                </div>
                <p className={`mt-2 text-3xl font-bold ${"highlight" in kpi && kpi.highlight ? "text-destructive" : ""}`}>
                  {valores[index]}
                </p>
                {"highlight" in kpi && kpi.highlight ? (
                  <p className="mt-1 text-xs font-medium text-destructive">Requer atenção imediata</p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {kpi.title === "Visitas Realizadas no Mês" ? "Meta: 60 visitas" : perfil.microarea}
                  </p>
                )}
              </div>
            ))}
          </section>

          {/* Centro */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Metas */}
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Metas de Visitas do Mês</h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{new Date().toLocaleDateString("pt-BR",{month:"long",year:"numeric"})}</p>

              <div className="mt-6 space-y-5">
                <div>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-medium">Visitas domiciliares</span>
                    <span className="text-muted-foreground">{numeros.visitas} / 60</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100,numeros.visitas/60*100)}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{Math.round(numeros.visitas/60*100)}% da meta mensal</p>
                </div>
                <div>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-medium">Gestantes visitadas</span>
                    <span className="text-muted-foreground">{numeros.gestantesVisitadas} / {numeros.gestantes}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-success" style={{ width: `${numeros.gestantes ? numeros.gestantesVisitadas/numeros.gestantes*100 : 0}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{numeros.gestantes ? Math.round(numeros.gestantesVisitadas/numeros.gestantes*100) : 0}% da meta</p>
                </div>
                <div>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-medium">Hipertensos/Diabéticos</span>
                    <span className="text-muted-foreground">{numeros.cronicosVisitados} / {numeros.cronicos}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-warning" style={{ width: `${numeros.cronicos ? numeros.cronicosVisitados/numeros.cronicos*100 : 0}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{numeros.cronicos ? Math.round(numeros.cronicosVisitados/numeros.cronicos*100) : 0}% da meta</p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 rounded-lg bg-warning/30 px-3 py-2.5 text-xs font-medium text-warning-foreground">
                <CalendarClock className="h-4 w-4 shrink-0" />
                {numeros.atrasadas} visitas vencidas — priorize os alertas ao lado.
              </div>
            </div>

            {/* Tabela */}
            <div className="rounded-xl border bg-card shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <h2 className="font-semibold">Próximas Visitas e Alertas Prioritários</h2>
                <Link to="/dashboard" className="text-sm font-medium text-primary hover:underline">
                  Ver todas
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-6 py-3 font-medium">Morador</th>
                      <th className="px-4 py-3 font-medium">Endereço / Microárea</th>
                      <th className="px-4 py-3 font-medium">Motivo</th>
                      <th className="px-4 py-3 font-medium">Prazo</th>
                      <th className="px-6 py-3 font-medium text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitas.map((v) => (
                      <tr key={v.nome} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="px-6 py-3.5">
                          <Button
                            type="button"
                            onClick={() => setDetalhesMorador(v)}
                            className="text-left font-medium text-primary hover:underline"
                          >
                            {v.nome}
                          </Button>
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground">{v.endereco}</td>
                        <td className="px-4 py-3.5">
                          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                            {v.motivo}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${prazoClasses(v.prazoTone)}`}>
                            {v.prazo}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <Button
                            onClick={() => {
                              setVisitaAberta({ nome: v.nome, motivo: v.motivo });
                              setModalAberta(true);
                            }}
                            className="rounded-lg bg-success px-3 py-1.5 text-xs font-semibold text-success-foreground hover:opacity-90"
                          >
                            Registrar Visita
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>

      {detalhesMorador && (
        <DetalhesMoradorModal
          morador={detalhesMorador}
          onClose={() => setDetalhesMorador(null)}
          onRegistrarVisita={(m) => {
            setDetalhesMorador(null);
            setVisitaAberta(m);
            setModalAberta(true);
          }}
        />
      )}

      {modalAberta && (
        <RegistrarVisitaModal morador={visitaAberta} onClose={() => setModalAberta(false)} />
      )}
    </div>
  );
}
export const familias: Record<string, import("@/lib/acs-model").Familia> = {};
export const visitas: import("@/lib/acs-model").Morador[] = [];
