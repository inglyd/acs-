import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartPulse, Home, MapPin, Plus, Users, UsersRound, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { NovoCadastroWizard } from "@/components/NovoCadastroWizard";
import { useACS } from "@/lib/acs-workspace";

export const Route = createFileRoute("/_authenticated/cadastros")({
  head: () => ({
    meta: [
      { title: "ACS+ | Cadastros" },
      {
        name: "description",
        content:
          "Cadastro territorial, familiar e individual dos moradores da microárea em Jenipapo dos Vieiras/MA.",
      },
      { property: "og:title", content: "ACS+ | Cadastros" },
      {
        property: "og:description",
        content: "Cadastro territorial, familiar e individual dos moradores da microárea.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CadastrosPage,
});

type Aba = "territorial" | "familiar" | "individual";

const abas: { id: Aba; label: string; icon: typeof MapPin; desc: string }[] = [
  {
    id: "territorial",
    label: "Cadastro Territorial",
    icon: MapPin,
    desc: "Logradouros e áreas da microárea",
  },
  {
    id: "familiar",
    label: "Cadastro Familiar",
    icon: UsersRound,
    desc: "Famílias e responsáveis de cada domicílio",
  },
  {
    id: "individual",
    label: "Cadastro Individual",
    icon: Users,
    desc: "Moradores e condições de saúde",
  },
];

const condicoes = ["Gestante", "Hipertenso", "Diabético", "Acamado", "Idoso", "Tuberculose"];

const inputCls =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring";
const labelCls = "mb-1.5 block text-sm font-medium text-foreground";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

/** Lê os campos do formulário usando o rótulo visível de cada campo como chave. */
function coletarCampos(form: HTMLFormElement) {
  const campos: Record<string, string | boolean> = {};
  for (const el of Array.from(form.elements)) {
    if (!(
      el instanceof HTMLInputElement ||
      el instanceof HTMLSelectElement ||
      el instanceof HTMLTextAreaElement
    ))
      continue;
    const rotulo =
      el.closest("label")?.textContent?.trim() ||
      el.closest("div")?.querySelector("label")?.textContent?.trim() ||
      el.getAttribute("placeholder") ||
      "";
    if (!rotulo) continue;
    if (el instanceof HTMLInputElement && el.type === "checkbox") campos[rotulo] = el.checked;
    else if (el.value.trim() !== "") campos[rotulo] = el.value.trim();
  }
  return campos;
}

function CadastrosPage() {
  const { salvar: salvarNaConta } = useACS();
  const [salvando, setSalvando] = useState(false);
  const [aba, setAba] = useState<Aba>("territorial");
  const [salvo, setSalvo] = useState(false);
  const [wizard, setWizard] = useState(false);

  const salvar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setSalvando(true);
    try {
      await salvarNaConta("cadastro", { aba, campos: coletarCampos(form) });
      form.reset();
      setSalvo(true);
      setTimeout(() => setSalvo(false), 3000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar o cadastro.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-8">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-primary">
          <HeartPulse className="h-6 w-6" /> ACS+
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-sm font-semibold">Cadastros</h1>
        <Link
          to="/dashboard"
          className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao Dashboard
        </Link>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setWizard(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Novo Cadastro
          </button>
        </div>
        {wizard && <NovoCadastroWizard onClose={() => setWizard(false)} />}
        {/* Abas */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {abas.map((a) => (
            <button
              key={a.id}
              onClick={() => setAba(a.id)}
              className={`rounded-xl border p-4 text-left transition-colors ${
                aba === a.id
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "bg-card hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <a.icon
                  className={`h-5 w-5 ${aba === a.id ? "text-primary" : "text-muted-foreground"}`}
                />
                <span className="text-sm font-semibold">{a.label}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{a.desc}</p>
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => void salvar(e)}
          className="rounded-xl border bg-card p-6 shadow-sm md:p-8"
        >
          {aba === "territorial" && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">Cadastro Territorial / Logradouro</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Tipo de Logradouro">
                  <select className={inputCls}>
                    <option>Rua</option>
                    <option>Avenida</option>
                    <option>Travessa</option>
                    <option>Beco</option>
                    <option>Estrada</option>
                  </select>
                </Field>
                <Field label="Nome do Logradouro">
                  <input className={inputCls} placeholder="Ex.: Rua das Palmeiras" required />
                </Field>
                <Field label="Microárea">
                  <select className={inputCls}>
                    <option>MA-01</option>
                    <option>MA-02</option>
                    <option>MA-03</option>
                  </select>
                </Field>
                <Field label="Bairro / Localidade">
                  <input className={inputCls} placeholder="Ex.: Centro" />
                </Field>
                <Field label="Número de Domicílios Estimado">
                  <input className={inputCls} type="number" min={0} placeholder="0" />
                </Field>
                <Field label="Ponto de Referência">
                  <input className={inputCls} placeholder="Ex.: Próximo à igreja" />
                </Field>
              </div>
            </div>
          )}

          {aba === "familiar" && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">Cadastro Familiar</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Responsável pela Casa">
                  <input className={inputCls} placeholder="Nome completo" required />
                </Field>
                <Field label="CPF do Responsável">
                  <input className={inputCls} placeholder="000.000.000-00" />
                </Field>
                <Field label="Logradouro">
                  <select className={inputCls}>
                    <option>Rua das Palmeiras</option>
                    <option>Tv. São José</option>
                    <option>Av. Central</option>
                    <option>Rua do Campo</option>
                  </select>
                </Field>
                <Field label="Número / Complemento">
                  <input className={inputCls} placeholder="Ex.: 42, Casa B" />
                </Field>
                <Field label="Nº de Moradores">
                  <input className={inputCls} type="number" min={1} placeholder="1" />
                </Field>
                <Field label="Renda Familiar (faixa)">
                  <select className={inputCls}>
                    <option>Até 1 salário mínimo</option>
                    <option>1 a 2 salários</option>
                    <option>Acima de 2 salários</option>
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {["Água encanada", "Energia elétrica", "Coleta de lixo", "Saneamento"].map(
                  (item) => (
                    <label
                      key={item}
                      className="flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm"
                    >
                      <input type="checkbox" className="h-4 w-4 accent-[oklch(0.55_0.14_250)]" />
                      {item}
                    </label>
                  ),
                )}
              </div>
            </div>
          )}

          {aba === "individual" && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">Cadastro Individual do Morador</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Nome Completo">
                  <input className={inputCls} placeholder="Nome completo" required />
                </Field>
                <Field label="CPF">
                  <input className={inputCls} placeholder="000.000.000-00" />
                </Field>
                <Field label="Data de Nascimento">
                  <input className={inputCls} type="date" />
                </Field>
                <Field label="Família / Domicílio">
                  <select className={inputCls}>
                    <option>Família Silva — Rua das Palmeiras, 42</option>
                    <option>Família Santos — Tv. São José, 18</option>
                    <option>Família Ribeiro — Av. Central, 305</option>
                  </select>
                </Field>
              </div>
              <div>
                <p className={labelCls}>Condições de Saúde Prioritárias</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {condicoes.map((c) => (
                    <label
                      key={c}
                      className="flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm"
                    >
                      <input type="checkbox" className="h-4 w-4 accent-[oklch(0.6_0.15_160)]" />
                      {c}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center gap-3 border-t pt-6">
            <button
              type="submit"
              disabled={salvando}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 disabled:opacity-50 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> {salvando ? "Salvando..." : "Salvar Cadastro"}
            </button>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg border border-input px-5 py-2.5 text-sm font-medium hover:bg-muted"
            >
              <Home className="h-4 w-4" /> Cancelar
            </Link>
            {salvo && (
              <span className="rounded-lg bg-success/15 px-3 py-2 text-sm font-medium text-success">
                Cadastro salvo com sucesso!
              </span>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
