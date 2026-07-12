import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

export type ReportPdfAttachment = {
  createdAt: string;
  key: string;
  mimeType: string;
  name: string;
  size: string;
};

export type ReportPdfEvent = {
  createdAt: string;
  key: string;
  label: string;
  message: string | null;
};

export type ReportPdfData = {
  attachments: ReportPdfAttachment[];
  category: string;
  contactInfo: string;
  contactPreference: string;
  description: string;
  events: ReportPdfEvent[];
  eventsOmitted: number;
  generatedAt: string;
  involvedPeople: string;
  location: string;
  occurredAt: string;
  previousAttempts: string;
  protocol: string;
  receivedAt: string;
  reporter: string;
  status: string;
  title: string;
  witnesses: string;
};

const colors = {
  blue: "#24A3DD",
  blueSoft: "#E8F7FD",
  border: "#D8E1E5",
  dark: "#0B4D66",
  darkBlue: "#0877A5",
  ink: "#14242C",
  muted: "#5D6B72",
  paper: "#FFFFFF",
  surface: "#F5F8F9",
};

Font.registerHyphenationCallback((word) => {
  if (word.length <= 28) return [word];

  return word.match(/.{1,18}/g) ?? [word];
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.paper,
    color: colors.ink,
    fontFamily: "Helvetica",
    fontSize: 9.5,
    lineHeight: 1.52,
    paddingBottom: 64,
    paddingHorizontal: 42,
    paddingTop: 88,
  },
  fixedHeader: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    left: 42,
    paddingBottom: 12,
    position: "absolute",
    right: 42,
    top: 28,
  },
  brand: {
    color: colors.dark,
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: -0.7,
  },
  brandDot: {
    color: colors.blue,
  },
  headerContext: {
    alignItems: "flex-end",
  },
  headerLabel: {
    color: colors.dark,
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 1.25,
  },
  confidentialPill: {
    backgroundColor: colors.blueSoft,
    borderColor: "#BDE5F5",
    borderRadius: 3,
    borderWidth: 1,
    color: colors.dark,
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 0.8,
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  hero: {
    borderLeftColor: colors.blue,
    borderLeftWidth: 3,
    marginBottom: 18,
    paddingLeft: 14,
  },
  overline: {
    color: colors.darkBlue,
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  title: {
    color: colors.dark,
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: -0.35,
    lineHeight: 1.16,
  },
  protocol: {
    color: colors.muted,
    fontFamily: "Courier",
    fontSize: 8.5,
    marginTop: 8,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 8,
    minHeight: 54,
    paddingHorizontal: 10,
    paddingVertical: 9,
    width: "48.8%",
  },
  fieldLabel: {
    color: colors.muted,
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  fieldValue: {
    color: colors.ink,
    fontSize: 9.5,
    fontWeight: 700,
    lineHeight: 1.35,
  },
  notice: {
    backgroundColor: colors.blueSoft,
    borderColor: "#BDE5F5",
    borderRadius: 4,
    borderWidth: 1,
    color: colors.dark,
    marginBottom: 20,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  noticeTitle: {
    fontSize: 8.5,
    fontWeight: 700,
    marginBottom: 2,
  },
  noticeText: {
    fontSize: 8,
    lineHeight: 1.4,
  },
  section: {
    marginBottom: 17,
  },
  sectionHeader: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    marginBottom: 9,
    paddingBottom: 6,
  },
  sectionNumber: {
    color: colors.darkBlue,
    fontFamily: "Courier",
    fontSize: 8,
    fontWeight: 700,
    marginRight: 8,
  },
  sectionTitle: {
    color: colors.dark,
    fontSize: 11,
    fontWeight: 700,
  },
  bodyText: {
    color: colors.ink,
    fontSize: 9.5,
    lineHeight: 1.55,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  detailItem: {
    marginBottom: 10,
    paddingRight: 8,
    width: "48.8%",
  },
  detailValue: {
    color: colors.ink,
    fontSize: 9,
    lineHeight: 1.45,
  },
  listRow: {
    alignItems: "flex-start",
    borderBottomColor: colors.border,
    borderBottomWidth: 0.7,
    flexDirection: "row",
    paddingVertical: 8,
  },
  listIndex: {
    color: colors.darkBlue,
    fontFamily: "Courier",
    fontSize: 8,
    fontWeight: 700,
    paddingTop: 1,
    width: 26,
  },
  listContent: {
    flexGrow: 1,
  },
  listTitle: {
    color: colors.ink,
    fontSize: 9,
    fontWeight: 700,
    lineHeight: 1.35,
  },
  listMeta: {
    color: colors.muted,
    fontSize: 8,
    lineHeight: 1.4,
    marginTop: 3,
  },
  emptyState: {
    color: colors.muted,
    fontSize: 8.5,
    fontStyle: "italic",
  },
  eventLimitNotice: {
    backgroundColor: colors.surface,
    borderLeftColor: colors.blue,
    borderLeftWidth: 2,
    color: colors.muted,
    marginBottom: 7,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  footer: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    color: colors.muted,
    fontSize: 8,
    left: 42,
    paddingTop: 8,
    position: "absolute",
    right: 42,
    textAlign: "center",
    top: 797,
  },
});

export function ReportPdfDocument({ data }: { data: ReportPdfData }) {
  return (
    <Document
      author="Elinsa do Brasil"
      creator="Portal Elinsa"
      language="pt-BR"
      subject={`Relatório confidencial do protocolo ${data.protocol}`}
      title={`Denúncia ${data.protocol}`}
    >
      <Page
        bookmark={`Denúncia ${data.protocol}`}
        size="A4"
        style={styles.page}
        wrap
      >
        <PdfHeader />
        <PdfFooter protocol={data.protocol} />

        <View style={styles.hero}>
          <Text style={styles.overline}>RELATÓRIO DE DENÚNCIA</Text>
          <Text style={styles.title} orphans={2} widows={2}>
            {data.title}
          </Text>
          <Text style={styles.protocol}>PROTOCOLO {data.protocol}</Text>
        </View>

        <View style={styles.summaryGrid} wrap={false}>
          <SummaryCard label="STATUS" value={data.status} />
          <SummaryCard label="CATEGORIA" value={data.category} />
          <SummaryCard label="RECEBIDA EM" value={data.receivedAt} />
          <SummaryCard label="IDENTIFICAÇÃO" value={data.reporter} />
        </View>

        <View style={styles.notice} wrap={false}>
          <Text style={styles.noticeTitle}>Documento confidencial</Text>
          <Text style={styles.noticeText}>
            Uso restrito a pessoas autorizadas do Comitê de Ética. Os anexos são
            listados neste relatório, mas permanecem protegidos e disponíveis
            somente no portal. Para leitura com tecnologias assistivas e acesso
            ao conteúdo original, consulte também o caso no portal. Caracteres
            sem suporte tipográfico são identificados pelo código Unicode.
          </Text>
        </View>

        <PdfSection number="01" title="Dados do caso">
          <View style={styles.detailsGrid}>
            <Detail label="Quando ocorreu" value={data.occurredAt} />
            <Detail label="Onde ocorreu" value={data.location} />
            <Detail
              label="Preferência de contato"
              value={data.contactPreference}
            />
            <Detail label="Contato informado" value={data.contactInfo} />
          </View>
        </PdfSection>

        <PdfSection number="02" title="Relato">
          <Text style={styles.bodyText} orphans={3} widows={3}>
            {data.description}
          </Text>
        </PdfSection>

        <PdfSection number="03" title="Pessoas envolvidas">
          <Text style={styles.bodyText} orphans={3} widows={3}>
            {data.involvedPeople}
          </Text>
        </PdfSection>

        <PdfSection number="04" title="Testemunhas">
          <Text style={styles.bodyText} orphans={3} widows={3}>
            {data.witnesses}
          </Text>
        </PdfSection>

        <PdfSection number="05" title="Tentativas anteriores">
          <Text style={styles.bodyText} orphans={3} widows={3}>
            {data.previousAttempts}
          </Text>
        </PdfSection>

        <PdfSection number="06" title="Anexos">
          {data.attachments.length > 0 ? (
            data.attachments.map((attachment, index) => (
              <View key={attachment.key} style={styles.listRow}>
                <Text style={styles.listIndex}>
                  {String(index + 1).padStart(2, "0")}
                </Text>
                <View style={styles.listContent}>
                  <Text style={styles.listTitle}>{attachment.name}</Text>
                  <Text style={styles.listMeta}>
                    {attachment.mimeType} · {attachment.size} · recebido em{" "}
                    {attachment.createdAt}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyState}>Nenhum anexo registrado.</Text>
          )}
        </PdfSection>

        <PdfSection number="07" title="Andamento do caso">
          {data.eventsOmitted > 0 && (
            <Text style={[styles.noticeText, styles.eventLimitNotice]}>
              Esta exportação mostra as movimentações relevantes mais recentes.
              {` ${formatOmittedEvents(data.eventsOmitted)}`}
            </Text>
          )}
          {data.events.length > 0 ? (
            data.events.map((event, index) => (
              <View key={event.key} style={styles.listRow}>
                <Text style={styles.listIndex}>
                  {String(index + 1).padStart(2, "0")}
                </Text>
                <View style={styles.listContent}>
                  <Text style={styles.listTitle}>{event.label}</Text>
                  {event.message && (
                    <Text style={styles.listMeta}>{event.message}</Text>
                  )}
                  <Text style={styles.listMeta}>{event.createdAt}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyState}>
              Nenhuma movimentação registrada.
            </Text>
          )}
        </PdfSection>

        <Text style={styles.listMeta}>
          Documento gerado em {data.generatedAt}. A situação mais recente e os
          anexos originais devem ser consultados no portal. Datas e horários
          estão no horário de Brasília.
        </Text>
      </Page>
    </Document>
  );
}

function PdfHeader() {
  return (
    <View style={styles.fixedHeader} fixed>
      <Text style={styles.brand}>
        <Image src="public/kit-de-marca/png/logo-colorido.png" style={{ width: 40, height: 40 }} />
      </Text>
      <View style={styles.headerContext}>
        <Text style={styles.headerLabel}>COMITÊ DE ÉTICA</Text>
        <Text style={styles.confidentialPill}>CONFIDENCIAL</Text>
      </View>
    </View>
  );
}

function PdfFooter({ protocol }: { protocol: string }) {
  return (
    <Text
      fixed
      render={({ pageNumber, totalPages }) =>
        `ELINSA · CONFIDENCIAL   |   ${protocol}   |   Página ${pageNumber} de ${totalPages}`
      }
      style={styles.footer}
    />
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

function PdfSection({
  children,
  number,
  title,
}: {
  children: React.ReactNode;
  number: string;
  title: string;
}) {
  return (
    <View style={styles.section}>
      <View minPresenceAhead={64} style={styles.sectionHeader}>
        <Text style={styles.sectionNumber}>{number}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.fieldLabel}>{label.toUpperCase()}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function formatOmittedEvents(total: number) {
  if (total === 1) {
    return "1 movimentação anterior permanece disponível no portal.";
  }

  return `${total} movimentações anteriores permanecem disponíveis no portal.`;
}
