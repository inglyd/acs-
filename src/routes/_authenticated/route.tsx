import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { WorkspaceProvider, workspaceOptions } from "@/lib/acs-workspace";
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/login" });
    return { userId: data.user.id };
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(workspaceOptions(context.userId));
  },
  component: ProtectedAccount,
});
function ProtectedAccount() {
  const { userId } = Route.useRouteContext();
  return (
    <WorkspaceProvider key={userId} userId={userId}>
      <Outlet />
    </WorkspaceProvider>
  );
}
