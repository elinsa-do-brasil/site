const errorCodes: Record<string, { pt_br: string }> = {
  EMAIL_MANAGED_BY_MICROSOFT: {
    pt_br: "E-mails corporativos são administrados pela Microsoft.",
  },
  INVALID_EMAIL: {
    pt_br: "O e-mail informado não é válido.",
  },
  INVALID_OTP: {
    pt_br: "O código é inválido ou expirou.",
  },
  OTP_EXPIRED: {
    pt_br: "O código expirou. Solicite um novo.",
  },
  PASSWORD_AUTH_DISABLED: {
    pt_br: "Use Microsoft, código por e-mail ou Passkey para entrar.",
  },
  RATE_LIMITED: {
    pt_br: "Muitas tentativas. Aguarde antes de tentar novamente.",
  },
  TOO_MANY_ATTEMPTS: {
    pt_br: "O limite de tentativas foi atingido. Solicite um novo código.",
  },
};

export const getErrorMessage = (code: string, lang: "pt_br" = "pt_br") => {
  return (
    errorCodes[code]?.[lang] ||
    "Não foi possível concluir a ação. Tente novamente."
  );
};
