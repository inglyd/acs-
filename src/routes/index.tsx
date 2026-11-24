import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ACS+ | Painel da Agente Comunitária de Saúde" },
      {
        name: "description",
        content:
          "Acompanhe famílias, moradores, visitas domiciliares e alertas da sua microárea em Jenipapo dos Vieiras/MA com o ACS+.",
      },
      { property: "og:title", content: "ACS+ | Painel da Agente Comunitária de Saúde" },
      {
        property: "og:description",
        content:
          "Acompanhamento de Agentes Comunitárias de Saúde em Jenipapo dos Vieiras/MA: famílias, visitas e alertas em um só painel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  ssr: false,
  beforeLoad: async () => { const { data } = await supabase.auth.getUser(); throw redirect({to: data.user ? "/dashboard" : "/login"}); },
  component: () => null,
});

export const familias: Record<string, import("@/lib/acs-model").Familia> = {};
export const visitas: import("@/lib/acs-model").Morador[] = [];
