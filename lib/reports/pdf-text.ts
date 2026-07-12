const WIN_ANSI_EXTRA_CODE_POINTS = new Set([
  0x0152, 0x0153, 0x0160, 0x0161, 0x0178, 0x017d, 0x017e, 0x0192, 0x02c6,
  0x02dc, 0x2013, 0x2014, 0x2018, 0x2019, 0x201a, 0x201c, 0x201d, 0x201e,
  0x2020, 0x2021, 0x2022, 0x2026, 0x2030, 0x2039, 0x203a, 0x20ac, 0x2122,
]);
const graphemeSegmenter = new Intl.Segmenter("pt-BR", {
  granularity: "grapheme",
});

/**
 * Evita que as fontes PDF padrão corrompam silenciosamente caracteres fora de
 * WinAnsi. O código Unicode mantém o valor auditável; o original segue no portal.
 */
export function sanitizePdfText(value: string, maxCharacters = 10_000) {
  const normalized = value
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u202A-\u202E\u2066-\u2069]/g, "")
    .trim();

  const safeCharacters = Array.from(normalized).filter((character) => {
    if (character === "\n" || character === "\t") return true;

    const codePoint = character.codePointAt(0) ?? 0;
    return codePoint >= 32 && codePoint !== 127;
  });
  const wasTruncated = safeCharacters.length > maxCharacters;
  const boundedSource = safeCharacters.slice(0, maxCharacters).join("");
  const converted = Array.from(
    graphemeSegmenter.segment(boundedSource),
    ({ segment }) =>
      isWinAnsiText(segment) ? segment : formatUnicodeFallback(segment),
  ).join("");
  const outputLimit = maxCharacters * 2;
  const outputCharacters = Array.from(converted);
  const boundedOutput = outputCharacters.slice(0, outputLimit).join("");

  if (wasTruncated || outputCharacters.length > outputLimit) {
    return `${boundedOutput.trimEnd()}… [conteúdo abreviado; consulte o portal]`;
  }

  return boundedOutput;
}

function isWinAnsiText(value: string) {
  return Array.from(value).every((character) => {
    const codePoint = character.codePointAt(0) ?? 0;
    return codePoint <= 0xff || WIN_ANSI_EXTRA_CODE_POINTS.has(codePoint);
  });
}

function formatUnicodeFallback(value: string) {
  const codePoints = Array.from(value, (character) =>
    (character.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, "0"),
  );

  return `[símbolo U+${codePoints.join("+U+")}]`;
}
