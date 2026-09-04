import { UnpublishButton } from "@payloadcms/ui";
import type { UnpublishButtonServerProps } from "payload";
import { canPublish } from "../../lib/payload/rbac.ts";

export function RoleUnpublishButton({ user }: UnpublishButtonServerProps) {
  return canPublish(user) ? <UnpublishButton /> : null;
}
