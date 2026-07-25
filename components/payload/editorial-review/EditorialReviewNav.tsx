import type { ServerProps } from "payload";
import { formatAdminURL } from "payload/shared";
import { canPublish } from "../../../lib/payload/rbac.ts";
import { EditorialReviewNavClient } from "./EditorialReviewNavClient.tsx";

export function EditorialReviewNav({ payload, user }: ServerProps) {
  if (!canPublish(user)) {
    return null;
  }

  const href = formatAdminURL({
    adminRoute: payload.config.routes.admin,
    path: "/pendencias-editoriais",
  });

  return <EditorialReviewNavClient href={href} />;
}
