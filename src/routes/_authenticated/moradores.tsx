import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, HeartPulse, MapPin, Search, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  DetalhesMoradorModal,
  RegistrarVisitaModal,
  condicaoBadgeClasses,
  type Morador,
  type MoradorVisita,
} from "@/components/ACSPanel";
import { useACS } from "@/lib/acs-workspace";

export const Route = createFileRoute("/_authenticated/moradores")({
  head: () => ({
    meta: [
      { title: "ACS+ | Moradores Registrados" },
      {
        name: "description",
        content:
          "Listagem completa dos moradores acompanhados pela Agente Comunitária de Saúde em Jenipapo dos Vieiras/MA, com CPF/Cartão SUS, microárea, condições de saúde e histórico de visitas.",
      },
      { property: "og:title", content: "ACS+ | Moradores Registrados" },
      {
        property: "og:description",
        content:
          "Lista de moradores com identificação SUS, vínculo familiar, condições de saúde e histórico.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { busca: string } => ({
    busca: typeof search["busca"] === "string" ? search["busca"] : "",
  }),
  component: MoradoresPage,
});

function MoradoresPage() {
  const { familias, visitas } = useACS();
  const { busca: buscaInicial } = Route.useSearch();
  const [busca, setBusca] = useState(buscaInicial);
  useEffect(() => setBusca(buscaInicial), [buscaInicial]);
  const [selecionado, setSelecionado] = useState<Morador | null>(null);
  const [visitaPara, setVisitaPara] = useState<MoradorVisita | null>(null);

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return visitas;
    return visitas.filter(
      (m) =>
        m.nome.toLowerCase().includes(termo) ||
        m.cpf.includes(termo) ||
        m.microarea.toLowerCase().includes(termo) ||
        m.bairro.toLowerCase().includes(termo) ||
        m.condicoes.some((c) => c.toLowerCase().includes(termo)),
    );
  }, [busca, visitas]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-8">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-primary">
          <HeartPulse className="h-6 w-6" /> ACS+
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-sm font-semibold">Moradores</h1>
        <Link
          to="/dashboard"
          className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao Dashboard
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <Users className="h-6 w-6 text-primary" /> Moradores Registrados
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Clique no nome do morador para ver identificação, vínculo familiar, condições de saúde
              e histórico de visitas.
            </p>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, CPF, microárea..."
              className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Morador</th>
                <th className="px-4 py-3 font-medium">CPF</th>
                <th className="px-4 py-3 font-medium">Endereço / Microárea</th>
                <th className="px-4 py-3 font-medium">Condições</th>
                <th className="px-4 py-3 font-medium">Última Visita</th>
                <th className="px-4 py-3 font-medium">Ação</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((m) => (
                <tr key={m.cpf} className="border-b last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setSelecionado(m)}
                      className="font-medium text-primary underline-offset-2 hover:underline"
                    >
                      {m.nome}
                    </button>
                    {familias[m.nome] && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Família {familias[m.nome]!.responsavel} · {familias[m.nome]!.codigo}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{m.cpf}</td>
                  <td className="px-4 py-3">
                    <p className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {m.logradouro}, {m.numero} · {m.bairro}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{m.microarea}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {m.condicoes.length === 0 ? (
                        <span className="rounded-full border border-input bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          Sem condição prioritária
                        </span>
                      ) : (
                        m.condicoes.map((c) => (
                          <span
                            key={c}
                            className={`rounded-full border px-2 py-0.5 text-xs font-medium ${condicaoBadgeClasses(c)}`}
                          >
                            {c}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{m.ultimaVisita}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setVisitaPara({ nome: m.nome, motivo: m.motivo })}
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
                    >
                      Registrar Visita
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {lista.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              Nenhum morador encontrado.
            </p>
          )}
        </div>
      </main>

      {selecionado && (
        <DetalhesMoradorModal
          morador={selecionado}
          onClose={() => setSelecionado(null)}
          onRegistrarVisita={(m) => {
            setSelecionado(null);
            setVisitaPara(m);
          }}
        />
      )}
      {visitaPara && (
        <RegistrarVisitaModal morador={visitaPara} onClose={() => setVisitaPara(null)} />
      )}
    </div>
  );
}
