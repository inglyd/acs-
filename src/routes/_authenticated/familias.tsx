import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, HeartPulse, MapPin, Search, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { condicaoBadgeClasses, type Morador } from "@/components/ACSPanel";
import { useACS } from "@/lib/acs-workspace";

export const Route = createFileRoute("/_authenticated/familias")({
  head: () => ({
    meta: [
      { title: "ACS+ | Famílias Acompanhadas" },
      {
        name: "description",
        content:
          "Lista das famílias acompanhadas pela Agente Comunitária de Saúde em Jenipapo dos Vieiras/MA, com integrantes, condições de saúde e histórico.",
      },
      { property: "og:title", content: "ACS+ | Famílias Acompanhadas" },
      {
        property: "og:description",
        content: "Famílias acompanhadas, integrantes, condições de saúde e histórico de visitas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FamiliasPage,
});

function FamiliaModal({ morador, onClose }: { morador: Morador; onClose: () => void }) {
  const { familias } = useACS();
  const familia = familias[morador.nome];
  if (!familia) return null;
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
            <h2 className="text-lg font-semibold">Detalhes da Família</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {familia.codigo} · {familia.responsavel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className="mt-6 space-y-5 text-sm">
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
              Dados da Família
            </h3>
            <div className="grid grid-cols-2 gap-3 rounded-lg border bg-background p-4">
              <div>
                <p className="text-xs text-muted-foreground">Código da Família</p>
                <p className="font-medium">{familia.codigo}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Responsável Familiar</p>
                <p className="font-medium">{familia.responsavel}</p>
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
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
              Integrantes ({familia.integrantes.length})
            </h3>
            <ul className="space-y-2">
              {familia.integrantes.map((i) => (
                <li
                  key={i.nome}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-background px-3 py-2"
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
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
              Histórico da Família
            </h3>
            <ul className="space-y-1.5 rounded-lg border bg-background p-4">
              {familia.historico.map((h) => (
                <li key={h.data} className="flex gap-2">
                  <span className="shrink-0 font-medium text-primary">{h.data}</span>
                  <span className="text-muted-foreground">{h.descricao}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-4 py-2.5 text-sm font-semibold hover:bg-muted"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

function FamiliasPage() {
  const { familias, visitas } = useACS();
  const [busca, setBusca] = useState("");
  const [selecionada, setSelecionada] = useState<Morador | null>(null);

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return visitas
      .filter((m) => familias[m.nome])
      .filter((m) => {
        if (!termo) return true;
        const f = familias[m.nome]!;
        return (
          f.codigo.toLowerCase().includes(termo) ||
          f.responsavel.toLowerCase().includes(termo) ||
          m.microarea.toLowerCase().includes(termo) ||
          f.integrantes.some((i) => i.nome.toLowerCase().includes(termo))
        );
      });
  }, [busca, familias, visitas]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-8">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-primary">
          <HeartPulse className="h-6 w-6" /> ACS+
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-sm font-semibold">Famílias</h1>
        <Link
          to="/dashboard"
          className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao Dashboard
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold">
              <UsersRound className="h-6 w-6 text-primary" /> Famílias Acompanhadas
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Clique no nome da família para ver responsável, integrantes, condições de saúde e
              histórico.
            </p>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar família, responsável, microárea..."
              className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {lista.map((m) => {
            const f = familias[m.nome]!;
            return (
              <li key={f.codigo}>
                <button
                  type="button"
                  onClick={() => setSelecionada(m)}
                  className="w-full rounded-xl border bg-card p-5 text-left transition hover:border-primary hover:shadow-md"
                >
                  <p className="text-xs font-medium text-muted-foreground">{f.codigo}</p>
                  <p className="mt-1 font-semibold text-primary underline-offset-2 group-hover:underline">
                    Família {f.responsavel}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {m.logradouro}, {m.numero} · {m.microarea}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {f.integrantes.length} integrante{f.integrantes.length > 1 ? "s" : ""}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {Array.from(new Set(f.integrantes.flatMap((i) => i.condicoes))).map((c) => (
                      <span
                        key={c}
                        className={`rounded-full border px-2 py-0.5 text-xs font-medium ${condicaoBadgeClasses(c)}`}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {lista.length === 0 && (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            Nenhuma família encontrada.
          </p>
        )}
      </main>

      {selecionada && <FamiliaModal morador={selecionada} onClose={() => setSelecionada(null)} />}
    </div>
  );
}
