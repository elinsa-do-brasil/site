import { PublishButton } from "@payloadcms/ui";
import type { PublishButtonServerProps } from "payload";
import { canPublish } from "../../lib/payload/rbac.ts";

export function RolePublishButton({ user }: PublishButtonServerProps) {
  return canPublish(user) ? <PublishButton /> : null;
}
