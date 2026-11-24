import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ClipboardList, HeartPulse, Search, Stethoscope } from "lucide-react";
import { useMemo, useState } from "react";
import { DetalhesMoradorModal, RegistrarVisitaModal, visitas, type Morador } from "@/components/ACSPanel";
import { ExportarRelatorioButton } from "@/components/RelatorioPdfModal";

export const Route = createFileRoute("/_authenticated/visitas")({
  head: () => ({
    meta: [
      { title: "ACS+ | Histórico de Visitas Domiciliares" },
      {
        name: "description",
        content:
          "Histórico completo das visitas domiciliares realizadas pela Agente Comunitária de Saúde em Jenipapo dos Vieiras/MA, com motivo, desfecho e observações.",
      },
      { property: "og:title", content: "ACS+ | Histórico de Visitas Domiciliares" },
      {
        property: "og:description",
        content: "Registro de visitas domiciliares com morador, motivo, desfecho e ACS responsável.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VisitasPage,
});

type RegistroVisita = {
  id: number;
  data: string;
  moradorNome: string;
  motivo: string;
  desfecho: "Realizada" | "Recusada" | "Ausente";
  observacoes: string;
  acs: string;
};

const ACS_NOME = "Iracélia Felício";

const registros: RegistroVisita[] = [
  {
    id: 1,
    data: "12/07/2026",
    moradorNome: "INGLYD MARIA ALVES RESPLANDES MIRANDA",
    motivo: "Acompanhamento pré-natal — Gestante",
    desfecho: "Realizada",
    observacoes:
      "Gestante de 28 semanas, sem queixas. Orientada sobre sinais de alerta e reforçada a importância das consultas de pré-natal na UBS Vila Esperança.",
    acs: ACS_NOME,
  },
  {
    id: 2,
    data: "05/09/2026",
    moradorNome: "MARIANO VIEIRA NEPOMUCENO JÚNIOR",
    motivo: "Acompanhamento de hipertensão arterial",
    desfecho: "Realizada",
    observacoes:
      "PA aferida: 138x88 mmHg. Em uso regular de losartana. Orientado sobre redução de sal e atividade física leve.",
    acs: ACS_NOME,
  },
  {
    id: 3,
    data: "28/08/2026",
    moradorNome: "Ana Beatriz Ribeiro",
    motivo: "Puericultura — acompanhamento de criança menor de 2 anos",
    desfecho: "Realizada",
    observacoes:
      "Criança com desenvolvimento adequado para a idade. Caderneta de vacinação em dia. Mãe orientada sobre aleitamento e introdução alimentar.",
    acs: ACS_NOME,
  },
  {
    id: 4,
    data: "20/08/2026",
    moradorNome: "José Ferreira Lima",
    motivo: "Busca ativa — Diabético sem retorno à UBS",
    desfecho: "Ausente",
    observacoes:
      "Morador ausente no horário combinado. Vizinhos informaram que trabalha fora durante o dia. Nova tentativa agendada para o período da tarde.",
    acs: ACS_NOME,
  },
  {
    id: 5,
    data: "15/08/2026",
    moradorNome: "Maria José dos Santos",
    motivo: "Acompanhamento de idosa acamada",
    desfecho: "Realizada",
    observacoes:
      "Idosa acamada, cuidada pela filha. Sem lesões de pele. Orientada a família sobre mudanças de decúbito e hidratação.",
    acs: ACS_NOME,
  },
  {
    id: 6,
    data: "08/08/2026",
    moradorNome: "Carlos Eduardo Matos",
    motivo: "Vacinação — atualização de caderneta",
    desfecho: "Recusada",
    observacoes:
      "Morador recusou a dose de reforço no momento. Foram esclarecidas dúvidas sobre segurança da vacina e deixado o convite para a UBS.",
    acs: ACS_NOME,
  },
  {
    id: 7,
    data: "01/08/2026",
    moradorNome: "INGLYD MARIA ALVES RESPLANDES MIRANDA",
    motivo: "Acompanhamento pré-natal — Gestante",
    desfecho: "Realizada",
    observacoes:
      "Verificada a caderneta da gestante. Exames do 2º trimestre em dia. Próxima consulta de pré-natal agendada.",
    acs: ACS_NOME,
  },
  {
    id: 8,
    data: "25/07/2026",
    moradorNome: "MARIANO VIEIRA NEPOMUCENO JÚNIOR",
    motivo: "Acompanhamento de hipertensão arterial",
    desfecho: "Realizada",
    observacoes:
      "PA aferida: 142x90 mmHg. Reforçada adesão ao tratamento e entregue nova receita para renovação na farmácia da UBS.",
    acs: ACS_NOME,
  },
];

const desfechoClasses: Record<RegistroVisita["desfecho"], string> = {
  Realizada: "border-success/30 bg-success/10 text-success",
  Recusada: "border-warning/30 bg-warning/10 text-warning",
  Ausente: "border-destructive/30 bg-destructive/10 text-destructive",
};

function VisitasPage() {
  const [busca, setBusca] = useState("");
  const [selecionada, setSelecionada] = useState<RegistroVisita | null>(null);
  const [moradorDetalhe, setMoradorDetalhe] = useState<Morador | null>(null);
  const [visitaPara, setVisitaPara] = useState<Morador | null>(null);

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return registros;
    return registros.filter(
      (r) =>
        r.moradorNome.toLowerCase().includes(termo) ||
        r.motivo.toLowerCase().includes(termo) ||
        r.desfecho.toLowerCase().includes(termo) ||
        r.data.includes(termo),
    );
  }, [busca]);

  const moradorDaVisita = (nome: string) => visitas.find((m) => m.nome === nome);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-8">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-primary">
          <HeartPulse className="h-6 w-6" /> ACS+
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-sm font-semibold">Visitas Domiciliares</h1>
        <Link
          to="/"
          className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao Dashboard
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <ClipboardList className="h-6 w-6 text-primary" /> Histórico de Visitas Domiciliares
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Clique em qualquer visita da tabela para ver os detalhes completos do registro.
            </p>
          </div>
          <ExportarRelatorioButton registros={registros} className="bg-primary text-primary-foreground" />
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por morador, motivo, data..."
              className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Data da Visita</th>
                <th className="px-4 py-3 font-medium">Morador Visitado</th>
                <th className="px-4 py-3 font-medium">Motivo</th>
                <th className="px-4 py-3 font-medium">Desfecho</th>
                <th className="px-4 py-3 font-medium">ACS Responsável</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setSelecionada(r)}
                  className="cursor-pointer border-b last:border-0 hover:bg-muted/40"
                >
                  <td className="px-4 py-3 font-medium">{r.data}</td>
                  <td className="px-4 py-3">{r.moradorNome}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.motivo}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${desfechoClasses[r.desfecho]}`}
                    >
                      {r.desfecho}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.acs}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {lista.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">Nenhuma visita encontrada.</p>
          )}
        </div>
      </main>

      {selecionada && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelecionada(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <Stethoscope className="h-5 w-5 text-primary" /> Detalhes da Visita
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Registro #{selecionada.id} · {selecionada.data}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelecionada(null)}
                className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted"
              >
                Fechar
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm">
              <div className="rounded-lg border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Morador Visitado</p>
                {moradorDaVisita(selecionada.moradorNome) ? (
                  <button
                    type="button"
                    onClick={() => {
                      const m = moradorDaVisita(selecionada.moradorNome)!;
                      setSelecionada(null);
                      setMoradorDetalhe(m);
                    }}
                    className="mt-1 font-semibold text-primary underline-offset-2 hover:underline"
                  >
                    {selecionada.moradorNome}
                  </button>
                ) : (
                  <p className="mt-1 font-semibold">{selecionada.moradorNome}</p>
                )}
                {moradorDaVisita(selecionada.moradorNome) && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    CPF {moradorDaVisita(selecionada.moradorNome)!.cpf} · Cartão SUS{" "}
                    {moradorDaVisita(selecionada.moradorNome)!.cns ?? "Identificado via CPF"}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Data da Visita</p>
                  <p className="mt-1 font-medium">{selecionada.data}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Desfecho</p>
                  <span
                    className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${desfechoClasses[selecionada.desfecho]}`}
                  >
                    {selecionada.desfecho}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Motivo Detalhado</p>
                <p className="mt-1">{selecionada.motivo}</p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Observações do Atendimento
                </p>
                <p className="mt-1 text-muted-foreground">{selecionada.observacoes}</p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">ACS Responsável</p>
                <p className="mt-1 font-medium">{selecionada.acs}</p>
              </div>
            </div>

            {moradorDaVisita(selecionada.moradorNome) && (
              <button
                type="button"
                onClick={() => {
                  const m = moradorDaVisita(selecionada.moradorNome)!;
                  setSelecionada(null);
                  setVisitaPara(m);
                }}
                className="mt-5 w-full rounded-lg bg-success px-4 py-2.5 text-sm font-semibold text-success-foreground hover:opacity-90"
              >
                Registrar Nova Visita para este Morador
              </button>
            )}
          </div>
        </div>
      )}

      {moradorDetalhe && (
        <DetalhesMoradorModal
          morador={moradorDetalhe}
          onClose={() => setMoradorDetalhe(null)}
          onRegistrarVisita={(m) => {
            setMoradorDetalhe(null);
            setVisitaPara(m as Morador);
          }}
        />
      )}
      {visitaPara && (
        <RegistrarVisitaModal
          morador={{ nome: visitaPara.nome, motivo: visitaPara.motivo }}
          onClose={() => setVisitaPara(null)}
        />
      )}
    </div>
  );
}
