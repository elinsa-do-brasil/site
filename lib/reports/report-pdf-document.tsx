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

export type ReportPdfData = {
  attachments: ReportPdfAttachment[];
  category: string;
  contactInfo: string;
  contactPreference: string;
  description: string;
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
  logo: {
    width: 54,
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
    alignItems: "center",
    backgroundColor: colors.blueSoft,
    borderColor: "#BDE5F5",
    borderRadius: 3,
    borderWidth: 1,
    height: 20,
    justifyContent: "center",
    marginTop: 4,
    paddingHorizontal: 8,
  },
  confidentialPillText: {
    color: colors.dark,
    fontSize: 7.5,
    fontWeight: 700,
    letterSpacing: 0.8,
    lineHeight: 1,
  },
  hero: {
    alignItems: "flex-start",
    borderLeftColor: colors.blue,
    borderLeftWidth: 3,
    height: 28,
    justifyContent: "center",
    marginBottom: 12,
    paddingLeft: 10,
  },
  overline: {
    color: colors.darkBlue,
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 1.4,
    lineHeight: 1,
  },
  caseTable: {
    borderColor: colors.border,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 18,
    overflow: "hidden",
  },
  tableRow: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableCell: {
    minHeight: 36,
    paddingHorizontal: 9,
    paddingVertical: 5,
    width: "50%",
  },
  tableCellDivider: {
    borderLeftColor: colors.border,
    borderLeftWidth: 1,
  },
  tableCellFull: {
    width: "100%",
  },
  fieldLabel: {
    color: colors.muted,
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  fieldValue: {
    color: colors.ink,
    fontSize: 9,
    fontWeight: 400,
    lineHeight: 1.35,
  },
  section: {
    marginBottom: 17,
  },
  sectionHeader: {
    alignItems: "baseline",
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
    lineHeight: 1,
    width: 24,
  },
  sectionTitle: {
    color: colors.dark,
    fontSize: 11,
    fontWeight: 700,
    lineHeight: 1,
  },
  bodyText: {
    color: colors.ink,
    fontSize: 9.5,
    lineHeight: 1.55,
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
  documentNote: {
    color: colors.muted,
    fontSize: 7.5,
    marginTop: 2,
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
        </View>

        <CaseSummaryTable data={data} />

        <PdfSection number="01" title="Relato">
          <Text style={styles.bodyText} orphans={3} widows={3}>
            {data.description}
          </Text>
        </PdfSection>

        <PdfSection
          keepTogether={data.involvedPeople.length <= 1_200}
          number="02"
          title="Pessoas envolvidas"
        >
          <Text style={styles.bodyText} orphans={3} widows={3}>
            {data.involvedPeople}
          </Text>
        </PdfSection>

        <PdfSection
          keepTogether={data.witnesses.length <= 1_200}
          number="03"
          title="Testemunhas"
        >
          <Text style={styles.bodyText} orphans={3} widows={3}>
            {data.witnesses}
          </Text>
        </PdfSection>

        <PdfSection
          keepTogether={data.previousAttempts.length <= 1_200}
          number="04"
          title="Tentativas anteriores"
        >
          <Text style={styles.bodyText} orphans={3} widows={3}>
            {data.previousAttempts}
          </Text>
        </PdfSection>

        <PdfSection number="05" title="Anexos">
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

        <Text style={styles.documentNote}>
          Gerado em {data.generatedAt} (horário de Brasília).
        </Text>
      </Page>
    </Document>
  );
}

function PdfHeader() {
  return (
    <View style={styles.fixedHeader} fixed>
      <Image
        src="public/kit-de-marca/png/logo-colorido.png"
        style={styles.logo}
      />
      <View style={styles.headerContext}>
        <Text style={styles.headerLabel}>COMITÊ DE ÉTICA</Text>
        <View style={styles.confidentialPill}>
          <Text style={styles.confidentialPillText}>CONFIDENCIAL</Text>
        </View>
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

function PdfSection({
  children,
  keepTogether = false,
  number,
  title,
}: {
  children: React.ReactNode;
  keepTogether?: boolean;
  number: string;
  title: string;
}) {
  return (
    <View style={styles.section} wrap={!keepTogether}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionNumber}>{number}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function CaseSummaryTable({ data }: { data: ReportPdfData }) {
  return (
    <View style={styles.caseTable} wrap={false}>
      <View style={styles.tableRow}>
        <TableCell full label="Assunto" value={data.title} />
      </View>
      <View style={styles.tableRow}>
        <TableCell label="Protocolo" value={data.protocol} />
        <TableCell divider label="Status" value={data.status} />
      </View>
      <View style={styles.tableRow}>
        <TableCell label="Categoria" value={data.category} />
        <TableCell divider label="Recebida em" value={data.receivedAt} />
      </View>
      <View style={styles.tableRow}>
        <TableCell label="Identificação" value={data.reporter} />
        <TableCell divider label="Quando ocorreu" value={data.occurredAt} />
      </View>
      <View style={styles.tableRow}>
        <TableCell label="Onde ocorreu" value={data.location} />
        <TableCell
          divider
          label="Preferência de contato"
          value={data.contactPreference}
        />
      </View>
      <View style={[styles.tableRow, styles.tableRowLast]}>
        <TableCell full label="Contato informado" value={data.contactInfo} />
      </View>
    </View>
  );
}

function TableCell({
  divider = false,
  full = false,
  label,
  value,
}: {
  divider?: boolean;
  full?: boolean;
  label: string;
  value: string;
}) {
  const cellStyles = [
    styles.tableCell,
    ...(divider ? [styles.tableCellDivider] : []),
    ...(full ? [styles.tableCellFull] : []),
  ];

  return (
    <View style={cellStyles}>
      <Text style={styles.fieldLabel}>{label.toUpperCase()}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}
