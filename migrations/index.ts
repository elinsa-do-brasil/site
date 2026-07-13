import * as migration_20260508_182400_adiciona_vagas from "./20260508_182400_adiciona_vagas";
import * as migration_20260713_194650_separar_media_galeria from "./20260713_194650_separar_media_galeria";

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
];
