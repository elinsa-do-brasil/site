import { UnpublishButton } from "@payloadcms/ui";
import type { UnpublishButtonServerProps } from "payload";
import { canPublish } from "../../lib/payload/rbac.ts";

// Par do RolePublishButton (role-publish-button.tsx) — mesma ideia para o botão de despublicar.
export function RoleUnpublishButton({ user }: UnpublishButtonServerProps) {
  return canPublish(user) ? <UnpublishButton /> : null;
}
