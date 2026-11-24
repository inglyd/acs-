import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/components/ACSPanel";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | ACS+ Jenipapo dos Vieiras" },
      { name: "description", content: "Painel da agente comunitária com indicadores, metas e visitas prioritárias da microárea." },
      { property: "og:title", content: "Dashboard | ACS+ Jenipapo dos Vieiras" },
      { property: "og:description", content: "Indicadores, metas e visitas prioritárias da microárea." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardProtegido,
});

function DashboardProtegido() { return <DashboardPage />; }
