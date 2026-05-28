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
  { cidade: 'Curua', codigoIBGE: 1502855 },
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

type ApiResponse = {
  resultados: {
    series: {
      serie: {
        [ano: string]: string;
      };
    }[];
  }[];
}[];

async function consultarPopulacaoMunicipio(
  municipio: Municipio
): Promise<number> {
  try {
    const url = `https://servicodados.ibge.gov.br/api/v3/agregados/4709/periodos/2022/variaveis/93?localidades=N6[${municipio.codigoIBGE}]`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const data: ApiResponse = await response.json();

    const populacao =
      data?.[0]?.resultados?.[0]?.series?.[0]?.serie?.['2022'];

    return Number(populacao || 0);
  } catch (error) {
    console.error(
      `Erro ao consultar ${municipio.cidade}:`,
      error
    );

    return 0;
  }
}

async function calcularPopulacaoTotal() {
  console.time('consulta');

  const populacoes = await Promise.all(
    municipios.map(async (municipio) => {
      const populacao =
        await consultarPopulacaoMunicipio(municipio);

      console.log(
        `${municipio.cidade}: ${populacao.toLocaleString(
          'pt-BR'
        )} habitantes`
      );

      return populacao;
    })
  );

  const totalHabitantes = populacoes.reduce(
    (acc, curr) => acc + curr,
    0
  );

  console.timeEnd('consulta');

  console.log(
    `\nTotal de habitantes: ${totalHabitantes.toLocaleString(
      'pt-BR'
    )}`
  );

  return totalHabitantes;
}

calcularPopulacaoTotal();