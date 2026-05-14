import { asc, inArray } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { FerramentasTeamAdmin } from "@/components/admin/FerramentasTeamAdmin";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { portalTool } from "@/lib/db/schema";
import {
  canManageTeam,
  getAllElinsaTeams,
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
  const tools = teamIds.length
    ? await db
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
        .orderBy(asc(portalTool.label))
    : [];

  const toolsByTeam = new Map<string, typeof tools>();
  for (const item of tools) {
    const current = toolsByTeam.get(item.teamId) ?? [];
    current.push(item);
    toolsByTeam.set(item.teamId, current);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4">
      <div className="mb-8 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Ferramentas das equipes
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Configure os cards de ferramentas exibidos no portal interno.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/portal">Voltar ao portal</Link>
        </Button>
      </div>

      <FerramentasTeamAdmin
        teams={manageableTeams.map((item) => ({
          ...item,
          tools: toolsByTeam.get(item.id) ?? [],
        }))}
      />
    </div>
  );
}
