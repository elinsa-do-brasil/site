import { Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type ContactStatus,
  contactStatusLabels,
} from "@/lib/contacts/validators";
import { ContactStatusSelect } from "./contact-status-select";

type ContactListItem = {
  company: string | null;
  createdAt: Date;
  email: string;
  emailNotificationError: string | null;
  emailNotificationSent: boolean;
  id: string;
  message: string;
  name: string;
  phone: string | null;
  status: ContactStatus;
  subject: string | null;
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export function ContactsTable({ contacts }: { contacts: ContactListItem[] }) {
  if (contacts.length === 0) {
    return (
      <Card className="rounded-md border-dashed bg-card/70 py-10">
        <CardContent className="text-center text-sm text-muted-foreground">
          Nenhum contato recebido ainda.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-md border-border/80 py-0 shadow-sm">
      <CardHeader className="border-b py-4">
        <CardTitle className="text-base">Contatos recebidos</CardTitle>
        <CardDescription>
          Mensagens públicas recebidas pelo formulário do site.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[8.5rem]">Data</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Assunto</TableHead>
              <TableHead>Mensagem</TableHead>
              <TableHead className="w-[8rem]">Status</TableHead>
              <TableHead className="w-[10rem]">Alterar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="text-muted-foreground">
                  {dateFormatter.format(contact.createdAt)}
                </TableCell>
                <TableCell className="min-w-60">
                  <div className="space-y-1">
                    <p className="font-medium">{contact.name}</p>
                    <a
                      className="flex items-center gap-1.5 text-muted-foreground transition hover:text-elinsa-primary"
                      href={`mailto:${contact.email}`}
                    >
                      <Mail className="size-3" />
                      {contact.email}
                    </a>
                    {contact.phone && (
                      <p className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="size-3" />
                        {contact.phone}
                      </p>
                    )}
                    {contact.company && (
                      <p className="text-muted-foreground">{contact.company}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="max-w-48 whitespace-normal">
                  {contact.subject || "Sem assunto"}
                  {contact.emailNotificationError && (
                    <p className="mt-1 text-[0.68rem] leading-snug text-destructive">
                      Falha no e-mail
                    </p>
                  )}
                  {contact.emailNotificationSent && (
                    <p className="mt-1 text-[0.68rem] leading-snug text-muted-foreground">
                      E-mail enviado
                    </p>
                  )}
                </TableCell>
                <TableCell className="max-w-[26rem] whitespace-normal">
                  <p className="line-clamp-4 leading-relaxed">
                    {contact.message}
                  </p>
                </TableCell>
                <TableCell>
                  <StatusBadge status={contact.status} />
                </TableCell>
                <TableCell>
                  <ContactStatusSelect
                    contactId={contact.id}
                    status={contact.status}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: ContactStatus }) {
  const variant = status === "spam" ? "destructive" : "outline";

  return <Badge variant={variant}>{contactStatusLabels[status]}</Badge>;
}
