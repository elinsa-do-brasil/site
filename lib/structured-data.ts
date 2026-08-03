import {
  absoluteUrl,
  ORGANIZATION_LOGO,
  ORGANIZATION_SOCIAL_PROFILES,
  SITE_DESCRIPTION,
  SITE_NAME,
} from "@/lib/seo";

type BreadcrumbItem = {
  name: string;
  path: string;
};

type ArticleStructuredData = {
  author: string;
  dateModified?: null | string;
  datePublished?: null | string;
  description: string;
  image?: null | string;
  path: string;
  title: string;
};

type JobStructuredData = {
  city: string;
  datePosted?: null | string;
  description: string;
  identifier: number | string;
  path: string;
  title: string;
};

const organizationId = absoluteUrl("/#organization");
const websiteId = absoluteUrl("/#website");

export function createHomeStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@id": organizationId,
        "@type": "Organization",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Belém",
          addressRegion: "PA",
          addressCountry: "BR",
        },
        foundingDate: "2012",
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl(ORGANIZATION_LOGO),
        },
        name: SITE_NAME,
        sameAs: ORGANIZATION_SOCIAL_PROFILES,
        url: absoluteUrl("/"),
      },
      {
        "@id": websiteId,
        "@type": "WebSite",
        description: SITE_DESCRIPTION,
        inLanguage: "pt-BR",
        name: SITE_NAME,
        publisher: {
          "@id": organizationId,
          "@type": "Organization",
          logo: {
            "@type": "ImageObject",
            url: absoluteUrl(ORGANIZATION_LOGO),
          },
          name: SITE_NAME,
        },
        url: absoluteUrl("/"),
      },
    ],
  };
}

export function createNewsArticleStructuredData(
  article: ArticleStructuredData,
) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        author: {
          "@type": article.author === SITE_NAME ? "Organization" : "Person",
          name: article.author,
        },
        dateModified: validDate(article.dateModified),
        datePublished: validDate(article.datePublished),
        description: article.description,
        headline: article.title,
        image: article.image ? [absoluteUrl(article.image)] : undefined,
        inLanguage: "pt-BR",
        mainEntityOfPage: absoluteUrl(article.path),
        publisher: { "@id": organizationId },
      },
      createBreadcrumbStructuredData([
        { name: "Início", path: "/" },
        { name: "Imprensa", path: "/imprensa" },
        { name: article.title, path: article.path },
      ]),
    ],
  };
}

export function createJobPostingStructuredData(job: JobStructuredData) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "JobPosting",
        datePosted: validDate(job.datePosted),
        description: job.description,
        hiringOrganization: {
          "@id": organizationId,
          "@type": "Organization",
          logo: absoluteUrl(ORGANIZATION_LOGO),
          name: SITE_NAME,
          sameAs: absoluteUrl("/"),
        },
        identifier: {
          "@type": "PropertyValue",
          name: SITE_NAME,
          value: String(job.identifier),
        },
        jobLocation: {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressCountry: "BR",
            addressLocality: job.city,
            addressRegion: "PA",
          },
        },
        title: job.title,
        url: absoluteUrl(job.path),
      },
      createBreadcrumbStructuredData([
        { name: "Início", path: "/" },
        { name: "Vagas", path: "/vagas" },
        { name: job.title, path: job.path },
      ]),
    ],
  };
}

export function createBreadcrumbStructuredData(items: BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      item: absoluteUrl(item.path),
      name: item.name,
      position: index + 1,
    })),
  };
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function validDate(value: null | string | undefined) {
  if (!value || Number.isNaN(Date.parse(value))) {
    return undefined;
  }

  return value;
}
