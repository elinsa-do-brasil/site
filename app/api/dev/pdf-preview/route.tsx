import { renderToBuffer } from "@react-pdf/renderer";
import type { ReportPdfData } from "@/lib/reports/report-pdf-document";
import { ReportPdfDocument } from "@/lib/reports/report-pdf-document";

export const dynamic = "force-dynamic";

const testData: ReportPdfData = {
  protocol: "DEN-2026-000142",
  title: "Assédio moral reiterado no setor de logística",
  status: "Em análise",
  category: "Assédio moral",
  receivedAt: "08/07/2026 às 14:32",
  reporter: "Anônimo",
  occurredAt: "Entre março e junho de 2026",
  location: "Galpão 3 — Centro de Distribuição (Guarulhos/SP)",
  contactPreference: "E-mail",
  contactInfo: "denunciante-anonimo@protonmail.com",
  description:
    "Venho relatar situações recorrentes de assédio moral praticadas pelo supervisor da área de logística, Sr. Carlos Mendes, contra membros da equipe do turno noturno. Desde março de 2026, o supervisor tem adotado comportamentos humilhantes durante as reuniões diárias de alinhamento, incluindo:\n\n• Gritos e xingamentos direcionados a funcionários específicos na frente de colegas;\n• Ameaças veladas de demissão caso metas não fossem cumpridas;\n• Atribuição de tarefas degradantes como forma de punição por erros operacionais;\n• Impedimento de pausas para uso do banheiro em horários de pico.\n\nEsses episódios têm causado afastamentos por questões de saúde mental entre os colegas, sendo que pelo menos dois funcionários solicitaram transferência de setor nos últimos dois meses. O clima organizacional no turno noturno deteriorou-se significativamente, impactando também a produtividade e a segurança das operações.",
  involvedPeople:
    "Carlos Mendes — Supervisor de Logística (turno noturno)\nEmpresa: Elinsa do Brasil\nSetor: Centro de Distribuição — Galpão 3\nCargo: Supervisor operacional\nTempo de empresa: aproximadamente 8 anos",
  witnesses:
    "Ana Paula Ferreira — Operadora de empilhadeira (turno noturno)\nRodrigo Santos Lima — Conferente de cargas (turno noturno)\nOutros membros da equipe do turno noturno que preferiram não ser identificados.",
  previousAttempts:
    'Em abril de 2026, um colega da equipe relatou verbalmente a situação ao gerente de operações, Sr. Fernando Alves, que disse que "iria conversar" com o supervisor. Não houve mudança de comportamento após essa conversa. Não foi registrada ocorrência formal anterior.',
  generatedAt: "12/07/2026 às 11:45",
  attachments: [
    {
      key: "att-001",
      name: "print-conversa-whatsapp.png",
      mimeType: "image/png",
      size: "342 KB",
      createdAt: "08/07/2026 às 14:33",
    },
    {
      key: "att-002",
      name: "gravacao-reuniao-05jun.mp3",
      mimeType: "audio/mpeg",
      size: "4,2 MB",
      createdAt: "08/07/2026 às 14:34",
    },
    {
      key: "att-003",
      name: "atestado-medico-afastamento.pdf",
      mimeType: "application/pdf",
      size: "128 KB",
      createdAt: "08/07/2026 às 14:35",
    },
  ],
};

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not found", { status: 404 });
  }

  const pdfBuffer = await renderToBuffer(<ReportPdfDocument data={testData} />);

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Cache-Control": "no-store",
    },
  });
}
