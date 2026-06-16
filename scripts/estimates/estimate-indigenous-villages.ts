import * as XLSX from 'xlsx';
import path from 'node:path';

type Municipio = {
  cidade: string;
  codigoIBGE: number;
};

const municipios: Municipio[] = [
  { cidade: 'Almeirim', codigoIBGE: 1500503 },
  { cidade: 'Altamira', codigoIBGE: 1500602 },
  { cidade: 'Anapu', codigoIBGE: 1500859 },
  { cidade: 'Brasil Novo', codigoIBGE: 1501725 },
  { cidade: 'Gurupa', codigoIBGE: 1503101 },
  { cidade: 'Medicilândia', codigoIBGE: 1504455 },
  { cidade: 'Pacajá', codigoIBGE: 1505486 },
  { cidade: 'Placas', codigoIBGE: 1505650 },
  { cidade: 'Porto de Moz', codigoIBGE: 1505908 },
  { cidade: 'Senador José Porfírio', codigoIBGE: 1507805 },
  { cidade: 'Uruará', codigoIBGE: 1508159 },
  { cidade: 'Vitória do Xingu', codigoIBGE: 1508357 },
  { cidade: 'Abaetetuba', codigoIBGE: 1500107 },
  { cidade: 'Baião', codigoIBGE: 1501204 },
  { cidade: 'Barcarena', codigoIBGE: 1501303 },
  { cidade: 'Cametá', codigoIBGE: 1502103 },
  { cidade: 'Igarapé-Miri', codigoIBGE: 1503309 },
  { cidade: 'Limoeiro do Ajuru', codigoIBGE: 1504000 },
  { cidade: 'Mocajuba', codigoIBGE: 1504604 },
  { cidade: 'Moju', codigoIBGE: 1504703 },
  { cidade: 'Tailândia', codigoIBGE: 1507953 },
  { cidade: 'Acará', codigoIBGE: 1500206 },
  { cidade: 'Aurora do Pará', codigoIBGE: 1500958 },
  { cidade: 'Bujaru', codigoIBGE: 1501907 },
  { cidade: 'Concórdia do Pará', codigoIBGE: 1502756 },
  { cidade: 'Ipixuna do Pará', codigoIBGE: 1503457 },
  { cidade: 'Mãe do Rio', codigoIBGE: 1504059 },
  { cidade: 'Paragominas', codigoIBGE: 1505502 },
  { cidade: 'São Domingos do Capim', codigoIBGE: 1507201 },
  { cidade: 'São Miguel do Guamá', codigoIBGE: 1507607 },
  { cidade: 'Tomé-Açu', codigoIBGE: 1508001 },
  { cidade: 'Ulianopólis', codigoIBGE: 1508126 },
  { cidade: 'Aveiro', codigoIBGE: 1501006 },
  { cidade: 'Itaituba', codigoIBGE: 1503606 },
  { cidade: 'Jacareacanga', codigoIBGE: 1503754 },
  { cidade: 'Novo Progresso', codigoIBGE: 1505031 },
  { cidade: 'Rurópolis', codigoIBGE: 1506195 },
  { cidade: 'Trairão', codigoIBGE: 1508050 },
  { cidade: 'Alenquer', codigoIBGE: 1500404 },
  { cidade: 'Curuá', codigoIBGE: 1502855 },
  { cidade: 'Faro', codigoIBGE: 1503002 },
  { cidade: 'Juruti', codigoIBGE: 1503903 },
  { cidade: 'Monte Alegre', codigoIBGE: 1504802 },
  { cidade: 'Óbidos', codigoIBGE: 1505106 },
  { cidade: 'Oriximiná', codigoIBGE: 1505304 },
  { cidade: 'Prainha', codigoIBGE: 1506005 },
  { cidade: 'Terra Santa', codigoIBGE: 1507979 },
  { cidade: 'Belterra', codigoIBGE: 1501451 },
  { cidade: 'Mojui dos Campos', codigoIBGE: 1504752 },
  { cidade: 'Santarém', codigoIBGE: 1506807 },
];

const arquivo = path.resolve(
  './scripts/aldeias.xlsx'
);

const workbook = XLSX.readFile(arquivo);

const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

const dados =
  XLSX.utils.sheet_to_json<Record<string, any>>(
    worksheet
  );

// Set de códigos IBGE dos municípios alvo
const municipiosSet = new Set(
  municipios.map((m) => m.codigoIBGE)
);

// contador de aldeias por município
const aldeiasPorMunicipio = new Map<
  number,
  number
>();

for (const linha of dados) {
  const codigoMunicipio = Number(
    linha.cod_municipio
  );

  if (municipiosSet.has(codigoMunicipio)) {
    aldeiasPorMunicipio.set(
      codigoMunicipio,
      (aldeiasPorMunicipio.get(
        codigoMunicipio
      ) || 0) + 1
    );
  }
}

let total = 0;

console.log('\n=== ALDEIAS INDÍGENAS ===\n');

for (const municipio of municipios) {
  const quantidade =
    aldeiasPorMunicipio.get(
      municipio.codigoIBGE
    ) || 0;

  total += quantidade;

  console.log(
    `${municipio.cidade}: ${quantidade}`
  );
}

console.log(
  `\nTOTAL DE ALDEIAS: ${total}`
);