import { asc, inArray } from "drizzle-orm";
import type { Metadata } from "next";
import { FerramentasTeamAdmin } from "@/components/admin/FerramentasTeamAdmin";
import { GestaoPageHeader } from "@/components/admin/GestaoPageHeader";
import { PageTransition } from "@/components/ui/page-transition";
import { db } from "@/lib/db";
import { portalTool } from "@/lib/db/schema";
import {
  canManageTeam,
  getAllElinsaTeams,
  isMissingPortalToolIconColumnError,
  requireOrgAdminOrTeamLeader,
} from "@/lib/organization/access";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ferramentas das equipes",
};

export default async function FerramentasTeamAdminPage() {
  const context = await requireOrgAdminOrTeamLeader();
  const allTeams = await getAllElinsaTeams();
  const manageableTeams = allTeams.filter((item) =>
    canManageTeam(context, item.name),
  );
  const teamIds = manageableTeams.map((item) => item.id);
  const tools = teamIds.length ? await listManageableTools(teamIds) : [];

  const toolsByTeam = new Map<string, typeof tools>();
  for (const item of tools) {
    const current = toolsByTeam.get(item.teamId) ?? [];
    current.push(item);
    toolsByTeam.set(item.teamId, current);
  }

  return (
    <PageTransition>
      <div className="mx-auto w-full max-w-6xl px-4 pb-12">
        <GestaoPageHeader
          active="ferramentas"
          title="Ferramentas"
          description="Configure os cards de acesso exibidos no portal interno de cada equipe."
          isOrgAdmin={context.isOrgAdmin}
        />

        <FerramentasTeamAdmin
          teams={manageableTeams.map((item) => ({
            ...item,
            tools: toolsByTeam.get(item.id) ?? [],
          }))}
        />
      </div>
    </PageTransition>
  );
}

async function listManageableTools(teamIds: string[]) {
  try {
    return await db
      .select({
        id: portalTool.id,
        teamId: portalTool.teamId,
        slug: portalTool.slug,
        label: portalTool.label,
        description: portalTool.description,
        href: portalTool.href,
        icon: portalTool.icon,
        isActive: portalTool.isActive,
      })
      .from(portalTool)
      .where(inArray(portalTool.teamId, teamIds))
      .orderBy(asc(portalTool.label));
  } catch (error) {
    if (!isMissingPortalToolIconColumnError(error)) {
      throw error;
    }

    const tools = await db
      .select({
        id: portalTool.id,
        teamId: portalTool.teamId,
        slug: portalTool.slug,
        label: portalTool.label,
        description: portalTool.description,
        href: portalTool.href,
        isActive: portalTool.isActive,
      })
      .from(portalTool)
      .where(inArray(portalTool.teamId, teamIds))
      .orderBy(asc(portalTool.label));

    return tools.map((tool) => ({ ...tool, icon: null }));
  }
}
