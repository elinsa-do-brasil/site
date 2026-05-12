import * as migration20260508_182400_adicionaVagas from "./20260508_182400_adiciona_vagas";
import * as migration20260512_083900_denunciasComite from "./20260512_083900_denuncias_comite";

export const migrations = [
  {
    down: migration20260508_182400_adicionaVagas.down,
    name: "20260508_182400_adiciona_vagas",
    up: migration20260508_182400_adicionaVagas.up,
  },
  {
    down: migration20260512_083900_denunciasComite.down,
    name: "20260512_083900_denuncias_comite",
    up: migration20260512_083900_denunciasComite.up,
  },
];
