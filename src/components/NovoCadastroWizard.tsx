import { useState } from "react";
import { Check, CheckCircle2, ChevronLeft, ChevronRight, UserPlus, X } from "lucide-react";
import { familias, visitas, type Morador } from "@/routes/index";

const inputCls =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring";
const labelCls = "mb-1.5 block text-sm font-medium text-foreground";

const etapas = ["Família e Domicílio", "Identificação do Morador", "Perfil de Saúde"];
const grupos = ["Gestante", "Hipertenso", "Diabético", "Idoso", "Acamado", "Tuberculose", "Hanseníase"];

function mascaraCpf(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}
function mascaraCns(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 15);
  return [d.slice(0, 3), d.slice(3, 7), d.slice(7, 11), d.slice(11, 15)].filter(Boolean).join(" ");
}
function cpfValido(cpf: string) {
  if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf)) return false;
  const d = cpf.replace(/\D/g, "");
  if (/^(\d)\1{10}$/.test(d)) return false;
  const calc = (n: number) => {
    let s = 0;
    for (let i = 0; i < n; i++) s += Number(d[i]) * (n + 1 - i);
    const r = (s * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === Number(d[9]) && calc(10) === Number(d[10]);
}
function idadeDe(data: string) {
  const n = new Date(data + "T00:00:00");
  if (isNaN(n.getTime())) return 0;
  const h = new Date();
  let i = h.getFullYear() - n.getFullYear();
  if (h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) i--;
  return Math.max(i, 0);
}

function Field({ label, children, erro }: { label: string; children: React.ReactNode; erro?: string | undefined }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
      {erro && <p className="mt-1 text-xs font-medium text-destructive">{erro}</p>}
    </div>
  );
}

export function NovoCadastroWizard({ onClose, onConcluido }: { onClose: () => void; onConcluido?: () => void }) {
  const [etapa, setEtapa] = useState(0);
  const [sucesso, setSucesso] = useState(false);
  const [erros, setErros] = useState<Partial<Record<"codigo"|"rua"|"numero"|"bairro"|"nome"|"nascimento"|"cpf"|"cns", string>>>({});
  const [f, setF] = useState({
    codigo: `FAM-${String(180 + Object.keys(familias).length).padStart(4, "0")}`,
    rua: "",
    numero: "",
    bairro: "",
    complemento: "",
    microarea: "MA-01",
    moradia: "Própria",
    agua: "Rede encanada",
    nome: "",
    nomeMae: "",
    nascimento: "",
    sexo: "Feminino",
    cpf: "",
    cns: "",
    parentesco: "Chefe de Família",
    grupos: [] as string[],
    vacina: "Em dia",
  });
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  const validar = () => {
    const e: Partial<Record<"codigo"|"rua"|"numero"|"bairro"|"nome"|"nascimento"|"cpf"|"cns", string>> = {};
    if (etapa === 0) {
      if (!f.codigo.trim()) e.codigo = "Informe o código da família.";
      if (!f.rua.trim()) e.rua = "Informe o logradouro.";
      if (!f.numero.trim()) e.numero = "Informe o número.";
      if (!f.bairro.trim()) e.bairro = "Informe o bairro.";
    }
    if (etapa === 1) {
      if (!f.nome.trim()) e.nome = "Informe o nome completo.";
      if (!f.nascimento) e.nascimento = "Informe a data de nascimento.";
      if (!f.cpf) e.cpf = "CPF é obrigatório.";
      else if (!cpfValido(f.cpf)) e.cpf = "CPF inválido. Use o formato 000.000.000-00 com um número válido.";
      if (f.cns && f.cns.replace(/\D/g, "").length !== 15) e.cns = "O CNS deve ter 15 dígitos.";
    }
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const proximo = () => validar() && setEtapa((s) => s + 1);

  const concluir = () => {
    const idade = idadeDe(f.nascimento);
    const condicoes = [...f.grupos];
    if (f.vacina === "Pendente") condicoes.push("Vacina pendente");
    const [a, m, d] = f.nascimento.split("-");
    const novo: Morador = {
      nome: f.nome.trim().toUpperCase(),
      motivo: "Primeira visita após cadastro",
      endereco: `${f.rua}, ${f.numero} · ${f.microarea}`,
      prazo: "Em 7 dias",
      prazoTone: "info",
      cpf: f.cpf,
      dataNascimento: `${d}/${m}/${a}`,
      idade,
      sexo: f.sexo,
      cartaoSus: f.cns || f.cpf,
      ...(f.cns ? { cns: f.cns } : {}),
      nomeMae: f.nomeMae || "Não informado",
      logradouro: f.rua + (f.complemento ? ` (${f.complemento})` : ""),
      numero: f.numero,
      bairro: f.bairro,
      microarea: f.microarea,
      condicoes: f.grupos,
      ultimaVisita: "Sem visitas",
      statusProximaVisita: "Primeira visita em até 7 dias",
    };
    visitas.push(novo);
    familias[novo.nome] = {
      codigo: f.codigo,
      responsavel: f.parentesco === "Chefe de Família" ? novo.nome : "A definir",
      integrantes: [{ nome: novo.nome, parentesco: f.parentesco, idade, condicoes: f.grupos }],
      historico: [
        {
          data: new Date().toLocaleDateString("pt-BR"),
          descricao: `Família cadastrada (${f.moradia}, água: ${f.agua}). Vacinação: ${f.vacina}.`,
        },
      ],
    };
    setSucesso(true);
    onConcluido?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-label="Novo Cadastro"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <UserPlus className="h-5 w-5 text-primary" /> Novo Cadastro de Família e Morador
          </h2>
          <button onClick={onClose} aria-label="Fechar" className="rounded-md p-1 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {sucesso ? (
          <div className="flex flex-col items-center gap-3 p-10 text-center">
            <CheckCircle2 className="h-14 w-14 text-success" />
            <p className="text-lg font-semibold">Cadastro realizado com sucesso!</p>
            <p className="text-sm text-muted-foreground">
              {f.nome.toUpperCase()} foi adicionado(a) à família {f.codigo} e à lista de moradores.
            </p>
            <button
              onClick={onClose}
              className="mt-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Fechar
            </button>
          </div>
        ) : (
          <>
            <div className="border-b p-5">
              <div className="mb-3 flex justify-between gap-2">
                {etapas.map((e, i) => (
                  <div key={e} className="flex flex-1 items-center gap-2">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        i < etapa
                          ? "bg-success text-success-foreground"
                          : i === etapa
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {i < etapa ? <Check className="h-4 w-4" /> : i + 1}
                    </span>
                    <span className={`hidden text-xs font-medium sm:block ${i === etapa ? "text-foreground" : "text-muted-foreground"}`}>
                      {e}
                    </span>
                  </div>
                ))}
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((etapa + 1) / 3) * 100}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Etapa {etapa + 1} de 3</p>
            </div>

            <div className="space-y-5 p-5">
              {etapa === 0 && (
                <>
                  <h3 className="font-semibold">Etapa 1: Dados da Família e Domicílio</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Código da Família" erro={erros.codigo}>
                      <input className={inputCls} value={f.codigo} onChange={(e) => set("codigo", e.target.value)} maxLength={20} />
                    </Field>
                    <Field label="Microárea">
                      <select className={inputCls} value={f.microarea} onChange={(e) => set("microarea", e.target.value)}>
                        <option value="MA-01">Microárea 01 - Jenipapo dos Vieiras/MA</option>
                        <option value="MA-02">Microárea 02 - Jenipapo dos Vieiras/MA</option>
                        <option value="MA-03">Microárea 03 - Jenipapo dos Vieiras/MA</option>
                      </select>
                    </Field>
                    <Field label="Rua / Avenida" erro={erros.rua}>
                      <input className={inputCls} value={f.rua} onChange={(e) => set("rua", e.target.value)} placeholder="Ex.: Rua das Palmeiras" maxLength={120} />
                    </Field>
                    <Field label="Número" erro={erros.numero}>
                      <input className={inputCls} value={f.numero} onChange={(e) => set("numero", e.target.value)} placeholder="Ex.: 42" maxLength={10} />
                    </Field>
                    <Field label="Bairro" erro={erros.bairro}>
                      <input className={inputCls} value={f.bairro} onChange={(e) => set("bairro", e.target.value)} placeholder="Ex.: Centro" maxLength={80} />
                    </Field>
                    <Field label="Complemento">
                      <input className={inputCls} value={f.complemento} onChange={(e) => set("complemento", e.target.value)} placeholder="Ex.: Casa B" maxLength={60} />
                    </Field>
                    <Field label="Condição de Moradia">
                      <select className={inputCls} value={f.moradia} onChange={(e) => set("moradia", e.target.value)}>
                        <option>Própria</option>
                        <option>Alugada</option>
                        <option>Cedida</option>
                      </select>
                    </Field>
                    <Field label="Tipo de Abastecimento de Água">
                      <select className={inputCls} value={f.agua} onChange={(e) => set("agua", e.target.value)}>
                        <option>Rede encanada</option>
                        <option>Poço / Nascente</option>
                        <option>Cisterna</option>
                        <option>Carro-pipa</option>
                        <option>Outro</option>
                      </select>
                    </Field>
                  </div>
                </>
              )}

              {etapa === 1 && (
                <>
                  <h3 className="font-semibold">Etapa 2: Identificação do Morador</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Nome Completo" erro={erros.nome}>
                      <input className={inputCls} value={f.nome} onChange={(e) => set("nome", e.target.value)} maxLength={120} />
                    </Field>
                    <Field label="Nome da Mãe">
                      <input className={inputCls} value={f.nomeMae} onChange={(e) => set("nomeMae", e.target.value)} maxLength={120} />
                    </Field>
                    <Field label="Data de Nascimento" erro={erros.nascimento}>
                      <input type="date" className={inputCls} value={f.nascimento} onChange={(e) => set("nascimento", e.target.value)} />
                    </Field>
                    <Field label="Sexo">
                      <select className={inputCls} value={f.sexo} onChange={(e) => set("sexo", e.target.value)}>
                        <option>Feminino</option>
                        <option>Masculino</option>
                      </select>
                    </Field>
                    <Field label="CPF (obrigatório)" erro={erros.cpf}>
                      <input
                        className={`${inputCls} ${erros.cpf ? "border-destructive" : ""}`}
                        value={f.cpf}
                        onChange={(e) => set("cpf", mascaraCpf(e.target.value))}
                        placeholder="000.000.000-00"
                        inputMode="numeric"
                      />
                    </Field>
                    <Field label="Cartão SUS / CNS (opcional)" erro={erros.cns}>
                      <input
                        className={inputCls}
                        value={f.cns}
                        onChange={(e) => set("cns", mascaraCns(e.target.value))}
                        placeholder="000 0000 0000 0000"
                        inputMode="numeric"
                      />
                    </Field>
                    <Field label="Parentesco com o Chefe de Família">
                      <select className={inputCls} value={f.parentesco} onChange={(e) => set("parentesco", e.target.value)}>
                        <option>Chefe de Família</option>
                        <option>Cônjuge</option>
                        <option>Filho(a)</option>
                        <option>Outro</option>
                      </select>
                    </Field>
                  </div>
                </>
              )}

              {etapa === 2 && (
                <>
                  <h3 className="font-semibold">Etapa 3: Perfil Epidemiológico e Saúde</h3>
                  <div>
                    <p className={labelCls}>Grupos prioritários (e-SUS)</p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {grupos.map((g) => (
                        <label key={g} className="flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm">
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={f.grupos.includes(g)}
                            onChange={(e) =>
                              setF((p) => ({
                                ...p,
                                grupos: e.target.checked ? [...p.grupos, g] : p.grupos.filter((x) => x !== g),
                              }))
                            }
                          />
                          {g}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className={labelCls}>Caderneta de Vacinação</p>
                    <div className="flex gap-3">
                      {["Em dia", "Pendente"].map((v) => (
                        <label key={v} className="flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm">
                          <input type="radio" name="vacina" checked={f.vacina === v} onChange={() => set("vacina", v)} />
                          {v}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-between border-t p-5">
              <button
                onClick={() => (etapa === 0 ? onClose() : setEtapa((s) => s - 1))}
                className="inline-flex items-center gap-1.5 rounded-lg border border-input px-4 py-2.5 text-sm font-medium hover:bg-muted"
              >
                <ChevronLeft className="h-4 w-4" /> {etapa === 0 ? "Cancelar" : "Voltar"}
              </button>
              {etapa < 2 ? (
                <button
                  onClick={proximo}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  Próximo <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={concluir}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-success px-5 py-2.5 text-sm font-semibold text-success-foreground hover:opacity-90"
                >
                  <Check className="h-4 w-4" /> Concluir Cadastro
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
