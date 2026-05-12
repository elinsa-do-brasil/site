import * as migration20260508_182400_adicionaVagas from "./20260508_182400_adiciona_vagas";

export const migrations = [
  {
    down: migration20260508_182400_adicionaVagas.down,
    name: "20260508_182400_adiciona_vagas",
    up: migration20260508_182400_adicionaVagas.up,
  },
];
