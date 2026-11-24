import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlarmClock,
  ArrowLeft,
  Baby,
  BedDouble,
  Filter,
  HeartPulse,
  Stethoscope,
  TriangleAlert,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/alertas")({
  head: () => ({
    meta: [
      { title: "ACS+ | Alertas & Pendências" },
      {
        name: "description",
        content:
          "Moradores com visitas em atraso há mais de 30 dias, ordenados por prioridade clínica, com filtro por microárea.",
      },
      { property: "og:title", content: "ACS+ | Alertas & Pendências" },
      {
        property: "og:description",
        content: "Moradores com visitas em atraso, ordenados por prioridade clínica.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AlertasPage,
});

type Alerta = {
  nome: string;
  endereco: string;
  microarea: "MA-01" | "MA-02" | "MA-03";
  condicao: "Gestante" | "Acamado" | "Hipertenso" | "Diabético" | "Idoso" | "Tuberculose";
  diasAtraso: number;
  prioridade: 1 | 2 | 3;
};

const alertas: Alerta[] = [
  { nome: "Maria José da Silva", endereco: "Rua das Palmeiras, 42", microarea: "MA-01", condicao: "Gestante", diasAtraso: 41, prioridade: 1 },
  { nome: "Raimundo Nonato Costa", endereco: "Beco da Ladeira, 9", microarea: "MA-03", condicao: "Tuberculose", diasAtraso: 38, prioridade: 1 },
  { nome: "Cicera Maria Almeida", endereco: "Rua Nova Esperança, 150", microarea: "MA-02", condicao: "Acamado", diasAtraso: 36, prioridade: 1 },
  { nome: "Francisca Oliveira Lima", endereco: "Rua do Campo, 77", microarea: "MA-01", condicao: "Diabético", diasAtraso: 33, prioridade: 2 },
  { nome: "José Pereira dos Santos", endereco: "Tv. São José, 18", microarea: "MA-01", condicao: "Hipertenso", diasAtraso: 31, prioridade: 2 },
  { nome: "Sebastião Ferreira Melo", endereco: "Av. Central, 410", microarea: "MA-02", condicao: "Idoso", diasAtraso: 45, prioridade: 2 },
  { nome: "Luzia Fernandes Rocha", endereco: "Rua das Flores, 23", microarea: "MA-03", condicao: "Gestante", diasAtraso: 32, prioridade: 1 },
  { nome: "Antônio Cardoso Neto", endereco: "Tv. São José, 90", microarea: "MA-01", condicao: "Diabético", diasAtraso: 47, prioridade: 2 },
];

const condicaoIcone: Record<Alerta["condicao"], typeof Baby> = {
  Gestante: Baby,
  Acamado: BedDouble,
  Hipertenso: HeartPulse,
  Diabético: HeartPulse,
  Idoso: HeartPulse,
  Tuberculose: TriangleAlert,
};

const prioridadeLabel: Record<Alerta["prioridade"], string> = {
  1: "Alta",
  2: "Média",
  3: "Baixa",
};

function AlertasPage() {
  const [microarea, setMicroarea] = useState<string>("todas");

  const filtrados = alertas
    .filter((a) => microarea === "todas" || a.microarea === microarea)
    .sort((a, b) => a.prioridade - b.prioridade || b.diasAtraso - a.diasAtraso);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-8">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-primary">
          <HeartPulse className="h-6 w-6" /> ACS+
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-sm font-semibold">Alertas & Pendências</h1>
        <Link
          to="/"
          className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao Dashboard
        </Link>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
        <div className="flex flex-col gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlarmClock className="mt-0.5 h-6 w-6 text-destructive" />
            <div>
              <h2 className="font-semibold text-foreground">
                {filtrados.length} moradores com visita em atraso há mais de 30 dias
              </h2>
              <p className="text-sm text-muted-foreground">
                Ordenados por prioridade clínica — gestantes e acamados no topo.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={microarea}
              onChange={(e) => setMicroarea(e.target.value)}
              className="h-10 rounded-lg border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              aria-label="Filtrar por microárea"
            >
              <option value="todas">Todas as microáreas</option>
              <option value="MA-01">MA-01</option>
              <option value="MA-02">MA-02</option>
              <option value="MA-03">MA-03</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filtrados.map((a) => {
            const Icone = condicaoIcone[a.condicao];
            return (
              <div
                key={a.nome}
                className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                    a.prioridade === 1 ? "bg-destructive/15 text-destructive" : "bg-warning/40 text-warning-foreground"
                  }`}
                >
                  <Icone className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{a.nome}</p>
                  <p className="text-sm text-muted-foreground">
                    {a.endereco} · {a.microarea}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    {a.condicao}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      a.prioridade === 1
                        ? "bg-destructive/10 text-destructive"
                        : "bg-warning/40 text-warning-foreground"
                    }`}
                  >
                    Prioridade {prioridadeLabel[a.prioridade]} · {a.diasAtraso} dias
                  </span>
                  <button className="inline-flex items-center gap-1.5 rounded-lg bg-success px-3 py-1.5 text-xs font-semibold text-success-foreground hover:opacity-90">
                    <Stethoscope className="h-3.5 w-3.5" /> Registrar Visita
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
