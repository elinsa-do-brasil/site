import {
  ExportListMenuItem,
  ImportListMenuItem,
} from "@payloadcms/plugin-import-export/rsc";
import type { ServerProps } from "payload";
import { canManageAdminTools } from "../../lib/payload/rbac.ts";

type RoleImportExportMenuItemsProps = ServerProps & {
  collectionSlug: string;
  exportCollectionSlug: string;
  importCollectionSlug: string;
};

export function RoleImportExportMenuItems({
  collectionSlug,
  exportCollectionSlug,
  importCollectionSlug,
  user,
}: RoleImportExportMenuItemsProps) {
  if (!canManageAdminTools(user)) {
    return null;
  }

  return (
    <>
      <ExportListMenuItem
        collectionSlug={collectionSlug}
        exportCollectionSlug={exportCollectionSlug}
      />
      <ImportListMenuItem
        collectionSlug={collectionSlug}
        importCollectionSlug={importCollectionSlug}
      />
    </>
  );
}
