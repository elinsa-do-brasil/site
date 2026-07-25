import * as migration_20260508_182400_adiciona_vagas from "./20260508_182400_adiciona_vagas";
import * as migration_20260713_194650_separar_media_galeria from "./20260713_194650_separar_media_galeria";
import * as migration_20260725_120000_payload_fixed_role_rbac from "./20260725_120000_payload_fixed_role_rbac";

export const migrations = [
  {
    up: migration_20260508_182400_adiciona_vagas.up,
    down: migration_20260508_182400_adiciona_vagas.down,
    name: "20260508_182400_adiciona_vagas",
  },
  {
    up: migration_20260713_194650_separar_media_galeria.up,
    down: migration_20260713_194650_separar_media_galeria.down,
    name: "20260713_194650_separar_media_galeria",
  },
  {
    up: migration_20260725_120000_payload_fixed_role_rbac.up,
    down: migration_20260725_120000_payload_fixed_role_rbac.down,
    name: "20260725_120000_payload_fixed_role_rbac",
  },
];
