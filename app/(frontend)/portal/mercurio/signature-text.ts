const ASSISTANT_RESPONSE_PATTERNS = [
  /^(?:claro|certamente|com certeza)[!,:.\s]/iu,
  /\b(?:aqui est[aá]|segue (?:uma?|o)|espero que (?:isso )?ajude|fico [àa] disposi[cç][ãa]o|posso ajudar)\b/iu,
  /\b(?:como|sou) (?:uma?|o) (?:ia|assistente virtual|modelo de linguagem)\b/iu,
];

const PROMPT_PATTERNS = [
  /\b(?:ignore|desconsidere|esque[cç]a)\b.{0,48}\b(?:instru[cç][õo]es|prompt|sistema)\b/iu,
  /\b(?:instru[cç][õo]es (?:anteriores|do sistema)|system prompt|prompt injection)\b/iu,
  /\b(?:responda|atue|aja) como\b/iu,
];

const RESPONSE_FORMAT_PATTERN = /\r?\n|```|(?:^|\n)\s*(?:[-*]|\d+\.)\s+/mu;

export function getSuspiciousSignatureTextError(
  value: string,
  maxLength: number,
) {
  const trimmedValue = value.trim();

  if (trimmedValue.length > maxLength) {
    return `Use no máximo ${maxLength} caracteres.`;
  }

  if (
    RESPONSE_FORMAT_PATTERN.test(trimmedValue) ||
    ASSISTANT_RESPONSE_PATTERNS.some((pattern) => pattern.test(trimmedValue)) ||
    PROMPT_PATTERNS.some((pattern) => pattern.test(trimmedValue))
  ) {
    return "Informe apenas o dado solicitado, sem respostas de assistente ou instruções de prompt.";
  }

  return "";
}
