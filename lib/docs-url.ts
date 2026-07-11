const DEFAULT_SITE_ORIGIN = "https://elinsadobrasil.com.br";

function normalizeOrigin(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);

    return url.origin;
  } catch {
    return null;
  }
}

function getConfiguredSiteOrigin() {
  return (
    normalizeOrigin(process.env.NEXT_PUBLIC_URL) ??
    normalizeOrigin(process.env.NEXT_PUBLIC_SERVER_URL) ??
    DEFAULT_SITE_ORIGIN
  );
}

export function getDocsOrigin(origin = getConfiguredSiteOrigin()) {
  const url = new URL(origin);

  if (url.hostname.startsWith("www.")) {
    url.hostname = url.hostname.slice(4);
  }

  if (!url.hostname.startsWith("docs.")) {
    url.hostname = `docs.${url.hostname}`;
  }

  return url.origin;
}

export function getDocsUrl(pathname = "/", origin?: string) {
  const docsOrigin = getDocsOrigin(origin);
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;

  return new URL(path, docsOrigin).toString();
}
