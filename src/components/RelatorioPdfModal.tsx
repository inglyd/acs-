import { useMemo, useState } from "react";
import { FileText, Printer, X } from "lucide-react";
import { useACS } from "@/lib/acs-workspace";
import { resumo } from "@/lib/acs-model";

export type RegistroRelatorio = {
  data: string;
  moradorNome: string;
  motivo: string;
  desfecho: string;
};

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

export function ExportarRelatorioButton({ className = "" }: { className?: string }) {
  const [aberto, setAberto] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm hover:opacity-90 ${className}`}
      >
        <Printer className="h-4 w-4" /> Exportar Relatório PDF
      </button>
      {aberto && <RelatorioPdfModal onClose={() => setAberto(false)} />}
    </>
  );
}

function RelatorioPdfModal({ onClose }: { onClose: () => void }) {
  const conta = useACS();
  const { perfil, registros, visitas } = conta;
  const ACS = perfil.nome;
  const LOTACAO = `${perfil.microarea} - ${perfil.ubs} - Jenipapo dos Vieiras/MA`;
  const TOTAL_FAMILIAS = resumo(conta).familias;
  const [mes, setMes] = useState(() => new Date().getMonth());
  const [ano, setAno] = useState(() => new Date().getFullYear());

  const dados = useMemo(() => {
    const doMes = registros.filter((r) => {
      const [, m, a] = r.data.split("/");
      return Number(m) === mes + 1 && Number(a) === ano;
    });
    const realizadas = doMes.filter((r) => r.desfecho === "Realizada").length;
    const contar = (c: string) => visitas.filter((v) => v.condicoes.includes(c)).length;
    const criancas = visitas.filter((v) => v.idade < 10).length;
    const grupos = [
      { nome: "Gestantes", total: contar("Gestante") },
      { nome: "Hipertensos", total: contar("Hipertenso") },
      { nome: "Diabéticos", total: contar("Diabético") },
      { nome: "Crianças / Vacinação", total: criancas },
    ];
    const totalVisitas = doMes.length;
    const totalRealizadas = realizadas;
    return { doMes, grupos, totalVisitas, totalRealizadas };
  }, [registros, visitas, mes, ano]);

  const imprimir = () => {
    const ref = `${MESES[mes]}/${ano}`;
    const linhas = dados.doMes.length
      ? dados.doMes
          .map(
            (r) =>
              `<tr><td>${esc(r.data)}</td><td>${esc(r.moradorNome)}</td><td>${esc(r.motivo)}</td><td>${esc(r.desfecho)}</td></tr>`,
          )
          .join("")
      : `<tr><td colspan="4" class="vazio">Nenhuma visita registrada neste período.</td></tr>`;
    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório de Produção - ${ref}</title>
<style>
@page{size:A4;margin:16mm}
*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#0f172a;font-size:12px;margin:0}
.cab{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #1d4ed8;padding-bottom:10px;margin-bottom:16px}
.cab h1{margin:0;font-size:20px;color:#1d4ed8}.cab p{margin:2px 0;color:#475569}
h2{font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:#1d4ed8;border-bottom:1px solid #cbd5e1;padding-bottom:4px;margin:18px 0 8px}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.box{border:1px solid #cbd5e1;border-radius:6px;padding:8px 10px}.box b{display:block;font-size:18px;color:#0f172a}.box span{color:#475569;font-size:11px}
table{width:100%;border-collapse:collapse;margin-top:4px}th,td{border:1px solid #cbd5e1;padding:6px;text-align:left;vertical-align:top}
th{background:#eff6ff;font-size:11px;text-transform:uppercase}.vazio{text-align:center;color:#64748b}
.ass{display:flex;gap:40px;margin-top:50px}.ass div{flex:1;border-top:1px solid #0f172a;text-align:center;padding-top:4px;font-size:11px}
.rod{margin-top:24px;font-size:10px;color:#64748b;text-align:center}
</style></head><body>
<div class="cab"><div><h1>ACS+ · Relatório de Produção Mensal</h1><p>Ficha de Produção / Acompanhamento — e-SUS APS</p></div>
<div style="text-align:right"><p><strong>Competência:</strong> ${ref}</p><p>Emitido em ${new Date().toLocaleDateString("pt-BR")}</p></div></div>
<h2>Identificação do Agente</h2>
<div class="grid"><div class="box"><span>Agente Comunitária de Saúde</span><b style="font-size:14px">${esc(ACS)}</b></div>
<div class="box"><span>Lotação</span><b style="font-size:14px">${esc(LOTACAO)}</b></div></div>
<h2>Produção do Mês</h2>
<div class="grid"><div class="box"><span>Total de Famílias Acompanhadas</span><b>${TOTAL_FAMILIAS}</b></div>
<div class="box"><span>Total de Visitas Realizadas no Mês</span><b>${dados.totalRealizadas}</b></div></div>
<h2>Cobertura de Grupos Prioritários</h2>
<table><thead><tr><th>Grupo</th><th>Acompanhados</th></tr></thead><tbody>
${dados.grupos.map((g) => `<tr><td>${g.nome}</td><td>${g.total}</td></tr>`).join("")}</tbody></table>
<h2>Visitas Domiciliares Registradas</h2>
<table><thead><tr><th>Data</th><th>Morador</th><th>Motivo</th><th>Desfecho</th></tr></thead><tbody>${linhas}</tbody></table>
<div class="ass"><div>${esc(ACS)}<br>Agente Comunitária de Saúde</div><div>Enfermeiro(a) Supervisor(a)<br>${esc(perfil.ubs)}</div></div>
<p class="rod">Documento gerado pelo ACS+ v1.0.0 — Sistema de Gestão de Saúde da Família · Jenipapo dos Vieiras/MA</p>
<script>window.onload=function(){window.print()}</script></body></html>`;
    const w = window.open("", "_blank");
    if (!w) {
      alert("Permita pop-ups para gerar o relatório.");
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  const selectCls =
    "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Gerar Relatório de Produção Mensal"
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-xl border bg-card text-foreground shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <FileText className="h-5 w-5 text-primary" /> Gerar Relatório de Produção Mensal
          </h2>
          <button onClick={onClose} aria-label="Fechar" className="rounded-md p-1 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 p-5 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block font-medium">Mês de referência</label>
              <select
                className={selectCls}
                value={mes}
                onChange={(e) => setMes(Number(e.target.value))}
              >
                {MESES.map((m, i) => (
                  <option key={m} value={i}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block font-medium">Ano</label>
              <select
                className={selectCls}
                value={ano}
                onChange={(e) => setAno(Number(e.target.value))}
              >
                {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - 1 + i).map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Identificação do Agente
            </p>
            <p className="mt-1 font-semibold">{ACS}</p>
            <p className="text-muted-foreground">{LOTACAO}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Famílias Acompanhadas</p>
              <p className="text-2xl font-bold text-primary">{TOTAL_FAMILIAS}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">
                Visitas Realizadas ({MESES[mes]}/{ano})
              </p>
              <p className="text-2xl font-bold text-success">{dados.totalRealizadas}</p>
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Cobertura de Grupos Prioritários
            </p>
            <ul className="grid grid-cols-2 gap-2">
              {dados.grupos.map((g) => (
                <li key={g.nome} className="flex justify-between rounded-md bg-muted/50 px-3 py-2">
                  <span>{g.nome}</span>
                  <span className="font-semibold">{g.total}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t p-5">
          <button
            onClick={onClose}
            className="rounded-lg border border-input px-4 py-2.5 text-sm font-medium hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            onClick={imprimir}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Printer className="h-4 w-4" /> Imprimir / Salvar em PDF
          </button>
        </div>
      </div>
    </div>
  );
}
