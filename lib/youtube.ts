const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set([
  "www.youtube.com",
  "youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtu.be",
  "www.youtube-nocookie.com",
  "youtube-nocookie.com",
]);

export function getYouTubeVideoId(input: string | undefined) {
  const value = input?.trim();

  if (!value) {
    return null;
  }

  if (YOUTUBE_ID_PATTERN.test(value)) {
    return value;
  }

  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    const hostname = url.hostname.toLowerCase();

    if (!YOUTUBE_HOSTS.has(hostname)) {
      return null;
    }

    if (hostname.endsWith("youtu.be")) {
      return sanitizeVideoId(url.pathname.split("/").filter(Boolean)[0]);
    }

    if (url.pathname === "/watch") {
      return sanitizeVideoId(url.searchParams.get("v"));
    }

    const [section, videoId] = url.pathname.split("/").filter(Boolean);

    if (section === "embed" || section === "shorts" || section === "live") {
      return sanitizeVideoId(videoId);
    }
  } catch {
    return null;
  }

  return null;
}

export function getYouTubeEmbedUrl(input: string | undefined) {
  const videoId = getYouTubeVideoId(input);

  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
}

function sanitizeVideoId(value: null | string | undefined) {
  return value && YOUTUBE_ID_PATTERN.test(value) ? value : null;
}
