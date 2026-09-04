// Hooks de coleção que aplicam lib/payload/rbac.ts em momentos que o objeto `access` do Payload não cobre sozinho (ex.: travar em "só rascunho" durante a validação, bloquear restaurar versão/lixeira). Ligados em collections/*.ts.
import type {
  CollectionBeforeOperationHook,
  CollectionBeforeValidateHook,
  PayloadRequest,
} from "payload";
import { APIError } from "payload";
import {
  canPublish,
  canWriteCollection,
  getWritableCollections,
  isPayloadUser,
  type RBACCollectionSlug,
} from "./rbac.ts";

function forbidden(message: string): never {
  throw new APIError(message, 403, undefined, true);
}

function isDraftRequest(req: PayloadRequest): boolean {
  const queryDraft =
    req.query && typeof req.query === "object" ? req.query.draft : undefined;
  const searchParamDraft = req.searchParams?.get("draft");

  return (
    queryDraft === true || queryDraft === "true" || searchParamDraft === "true"
  );
}

export function createDraftOnlyWorkflowHook(
  collection: Extract<RBACCollectionSlug, "blog" | "imprensa" | "vagas">,
): CollectionBeforeValidateHook {
  return ({ data, operation, originalDoc, req }) => {
    if (!req.user) {
      // Trusted Local API calls intentionally retain Payload's default
      // overrideAccess behavior. Delegated calls must pass overrideAccess: false.
      return data;
    }

    if (!canWriteCollection(req.user, collection)) {
      forbidden("Você não tem permissão para editar esta coleção.");
    }

    if (canPublish(req.user)) {
      return data;
    }

    if (!isDraftRequest(req) || data?._status !== "draft") {
      forbidden("Esta função pode salvar apenas rascunhos.");
    }

    // Restaurar da lixeira é tratado como update comum (deletedAt volta a null) — sem essa checagem, quem só pode salvar rascunho conseguiria restaurar itens excluídos.
    if (
      operation === "update" &&
      originalDoc?.deletedAt &&
      data &&
      Object.hasOwn(data, "deletedAt") &&
      !data.deletedAt
    ) {
      forbidden("Esta função não pode restaurar itens da lixeira.");
    }

    return data;
  };
}

// Restaurar uma versão antiga pode reintroduzir conteúdo publicado — só quem tem permissão de publicar pode fazer isso, mesmo que o autor original tenha escrito aquela versão.
export const preventAuthorVersionRestore: CollectionBeforeOperationHook = (
  args,
) => {
  if (
    args.operation === "restoreVersion" &&
    args.req.user &&
    !canPublish(args.req.user)
  ) {
    forbidden("Esta função não pode restaurar versões.");
  }
};

export function createTrashRestoreGuard(
  collection: Extract<RBACCollectionSlug, "media" | "galeria">,
): CollectionBeforeValidateHook {
  return ({ data, operation, originalDoc, req }) => {
    if (
      req.user &&
      canWriteCollection(req.user, collection) &&
      !canPublish(req.user) &&
      operation === "update" &&
      originalDoc?.deletedAt &&
      data &&
      Object.hasOwn(data, "deletedAt") &&
      !data.deletedAt
    ) {
      forbidden("Esta função não pode restaurar itens da lixeira.");
    }

    return data;
  };
}

function normalizeFolderTypes(data: unknown): string[] | undefined {
  if (!data || typeof data !== "object" || !("folderType" in data)) {
    return undefined;
  }

  const folderType = (data as { folderType?: unknown }).folderType;
  if (!Array.isArray(folderType)) {
    return [];
  }

  return folderType.filter(
    (value): value is string => typeof value === "string",
  );
}

// Uma pasta (folder) do Payload pode agrupar documentos de várias collections; isso só é permitido se o usuário puder escrever em TODAS as collections marcadas na pasta (folderType), não só em alguma delas.
export function canUseFolderTypes(
  req: Pick<PayloadRequest, "user">,
  data: unknown,
): boolean {
  const allowed = getWritableCollections(req.user);
  const folderTypes = normalizeFolderTypes(data);

  return Boolean(
    isPayloadUser(req.user) &&
      folderTypes?.length &&
      folderTypes.every((slug) => allowed.includes(slug as RBACCollectionSlug)),
  );
}

export const validateFolderTypes: CollectionBeforeValidateHook = ({
  data,
  req,
}) => {
  if (!req.user || canPublish(req.user)) {
    return data;
  }

  const folderTypes = normalizeFolderTypes(data);
  if (folderTypes !== undefined && !canUseFolderTypes(req, data)) {
    forbidden("A função atual não pode usar esta pasta.");
  }

  return data;
};
