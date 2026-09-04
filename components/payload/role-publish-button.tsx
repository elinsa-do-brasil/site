import { PublishButton } from "@payloadcms/ui";
import type { PublishButtonServerProps } from "payload";
import { canPublish } from "../../lib/payload/rbac.ts";

// Payload não tem permissão nativa por cargo para o botão de publicar — envolve o PublishButton oficial e só o renderiza se canPublish(user), escondendo-o por completo (não só desabilitando) para editor/recruiter. Registrado via components.edit.PublishButton em collections/Editorial.ts e Vagas.ts.
export function RolePublishButton({ user }: PublishButtonServerProps) {
  return canPublish(user) ? <PublishButton /> : null;
}
