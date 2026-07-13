import type { ReactNode } from "react";
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "react-email";
import { barebonesBoxedTailwindConfig } from "../theme";
import { Fonts } from "../theme-fonts";

export const emailAssetBaseUrl =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
  "https://elinsa-nine.vercel.app";

type EmailShellProps = {
  preview: string;
  children: ReactNode;
  baseUrl?: string;
  headerLabel?: string;
  footerText?: string;
};

type EmailHeaderProps = {
  baseUrl?: string;
  brandName?: string;
  markAlt?: string;
};

type EmailFooterProps = {
  baseUrl?: string;
  legalText?: string;
  links?: EmailSocialLink[];
};

type EmailSocialLink = {
  href: string;
  iconPath: string;
  label: string;
};

export type EmailDetailItem = {
  label: string;
  value?: string | null;
};

type AuthEmailCardProps = {
  actionHref: string;
  actionLabel: string;
  description: ReactNode;
  details?: EmailDetailItem[];
  logoAlt?: string;
  logoPath?: string;
  note?: ReactNode;
  title: string;
};

const defaultFooterLinks: EmailSocialLink[] = [
  {
    href: "https://www.linkedin.com/in/elinsadobrasil/",
    iconPath: "/email/linkedin.png",
    label: "LinkedIn",
  },
  {
    href: "https://www.instagram.com/elinsadobrasil/",
    iconPath: "/email/instagram.png",
    label: "Instagram",
  },
  {
    href: "https://elinsadobrasil.com.br/",
    iconPath: "/email/globe.png",
    label: "Site",
  },
];

export function EmailShell({
  preview,
  children,
  baseUrl = emailAssetBaseUrl,
  headerLabel = "Elinsa do Brasil",
  footerText = `© ${new Date().getFullYear()} Elinsa Industrial e Naval do Brasil.`,
}: EmailShellProps) {
  return (
    <Tailwind config={barebonesBoxedTailwindConfig}>
      <Html lang="pt-BR">
        <Head>
          <Fonts />
        </Head>

        <Body className="m-0 bg-bg-2 text-center font-sans">
          <Preview>{preview}</Preview>
          <Container className="mobile:mt-0 mx-auto mt-8 w-full max-w-[640px]">
            <Section className="bg-bg mobile:px-2 px-6 py-4">
              <EmailHeader baseUrl={baseUrl} brandName={headerLabel} />
              {children}
              <EmailFooter baseUrl={baseUrl} legalText={footerText} />
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}

export function EmailHeader({
  baseUrl = emailAssetBaseUrl,
  brandName = "Elinsa do Brasil",
  markAlt = "Elinsa",
}: EmailHeaderProps) {
  return (
    <Section className="mb-3 px-6">
      <Row>
        <Column className="w-1/2 py-[7px] align-middle">
          <Row>
            <Column className="w-[32px] align-middle">
              <Img
                src={`${baseUrl}/kit-de-marca/png/e-azul.png`}
                alt={markAlt}
                width={23}
                className="block"
              />
            </Column>
          </Row>
        </Column>
        <Column align="right" className="w-1/2 py-[7px] align-middle">
          <Text className="font-13 m-0 text-right font-sans">
            <span className="text-fg-3">{brandName}</span>
          </Text>
        </Column>
      </Row>
    </Section>
  );
}

export function AuthEmailCard({
  actionHref,
  actionLabel,
  description,
  details,
  logoAlt = "Logo Elinsa",
  logoPath = "/kit-de-marca/png/logo-azul.png",
  note,
  title,
}: AuthEmailCardProps) {
  return (
    <Section className="bg-bg-2 mobile:px-6 mobile:py-12 rounded-[8px] px-[40px] py-[64px] text-center">
      <Section className="mb-3">
        <Img
          src={`${emailAssetBaseUrl}${logoPath}`}
          alt={logoAlt}
          width={120}
          className="mx-auto mb-5 block"
        />
        <Heading as="h1" className="font-18 m-0 font-sans text-fg">
          {title}
        </Heading>
      </Section>

      <Text className="font-16 mx-auto mt-0 mb-8 max-w-[380px] text-center font-sans text-fg-2">
        {description}
      </Text>

      {details ? <EmailDetailList items={details} /> : null}

      <Section className="mb-6 text-center">
        <Button
          href={actionHref}
          className="box-border inline-block rounded-lg bg-brand px-7 py-4 text-center font-sans font-16 leading-6 text-fg-inverted no-underline"
        >
          {actionLabel}
        </Button>
      </Section>

      {note ? (
        <Text className="font-13 mx-auto mt-8 mb-0 max-w-[400px] text-center font-sans text-fg-3">
          {note}
        </Text>
      ) : null}
    </Section>
  );
}

export function EmailDetailList({ items }: { items: EmailDetailItem[] }) {
  const visibleItems = items.filter((item) => item.value);

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <Section className="mx-auto mb-8 max-w-[420px] rounded-[8px] bg-bg px-6 py-5 text-left">
      {visibleItems.map((item) => (
        <Row
          className="border-none border-b border-solid border-stroke py-2"
          key={item.label}
        >
          <Column className="w-[120px] align-top">
            <Text className="font-13 m-0 text-fg-3">{item.label}</Text>
          </Column>
          <Column className="align-top">
            <Text className="font-14 m-0 text-fg">{item.value}</Text>
          </Column>
        </Row>
      ))}
    </Section>
  );
}

export function EmailFooter({
  baseUrl = emailAssetBaseUrl,
  legalText = `© ${new Date().getFullYear()} Elinsa Industrial e Naval do Brasil.`,
  links = defaultFooterLinks,
}: EmailFooterProps) {
  return (
    <Section className="bg-bg">
      <Row>
        <Column className="px-6 py-8 text-center">
          <Text className="font-13 mx-auto mt-0 mb-4 max-w-[280px] text-center font-sans text-fg-3">
            {legalText}
          </Text>

          <Section className="mb-8">
            {links.map((link) => (
              <Link
                href={link.href}
                className="inline-block px-2 align-middle"
                key={link.href}
              >
                <Img
                  src={`${baseUrl}${link.iconPath}`}
                  alt={link.label}
                  width={18}
                  className="block"
                />
              </Link>
            ))}
          </Section>
        </Column>
      </Row>
    </Section>
  );
}
