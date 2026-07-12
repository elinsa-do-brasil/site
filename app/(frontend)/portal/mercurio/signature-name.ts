const NAME_CONNECTORS = new Set(["da", "das", "de", "do", "dos"]);

export function normalizeSignatureName(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean);

  return words
    .map((word, index) => {
      const lowerWord = word.toLocaleLowerCase("pt-BR");

      if (index > 0 && NAME_CONNECTORS.has(lowerWord)) {
        return lowerWord;
      }

      return capitalizeNameWord(lowerWord);
    })
    .join(" ");
}

function capitalizeNameWord(value: string) {
  return value
    .split(/([-'])/u)
    .map((part) =>
      part === "-" || part === "'"
        ? part
        : part.charAt(0).toLocaleUpperCase("pt-BR") + part.slice(1),
    )
    .join("");
}
