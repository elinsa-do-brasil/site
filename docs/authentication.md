# Autenticação do Portal Interno

O portal usa Better Auth com três métodos de acesso:

- Microsoft Entra ID para o primeiro acesso de contas corporativas;
- código de uso único (OTP) por e-mail para contas existentes e convidados externos;
- Passkeys opcionais, cadastradas depois da autenticação.

E-mail e senha estão desativados no servidor e não fazem parte da interface.

## Microsoft Entra ID

O App Registration deve ser single-tenant e usar a callback:

```text
https://SEU_DOMINIO/api/auth/callback/microsoft
```

Configuração operacional:

- não habilitar **Assignment required**;
- não atribuir grupos ou usuários específicos ao aplicativo;
- permitir todos os membros do tenant com endereço `@grupoamperelinsa.com`;
- configurar o claim opcional `email` para tokens de ID;
- manter os escopos `openid`, `profile` e `email`;
- não conceder `User.Read` ou `offline_access`, pois o portal não consulta o Microsoft Graph.

O backend valida o emissor do tenant, rejeita convidados quando o claim `acct`
os identifica e exige `email`, `preferred_username` ou `upn` no domínio
corporativo. O domínio não substitui a validação criptográfica do tenant.

## Regras do OTP

- Uma conta já existente pode solicitar e usar OTP.
- Um endereço corporativo ainda inexistente recebe resposta genérica, mas deve
  fazer o primeiro acesso pela Microsoft.
- Um endereço externo ainda inexistente só recebe OTP quando a requisição traz
  um convite válido, pendente, não expirado e para o mesmo e-mail.
- O convite é revalidado na confirmação do código.
- Respostas de envio não informam se uma conta ou convite existe.
- O código possui 6 dígitos, expira em 10 minutos, permite 3 tentativas e é
  armazenado criptografado.

## Variáveis de ambiente

Consulte `.env.example`. Em produção, são obrigatórias:

- `BETTER_AUTH_SECRET` com pelo menos 32 caracteres e alta entropia;
- `BETTER_AUTH_URL` e `BETTER_AUTH_TRUSTED_ORIGINS` com HTTPS;
- `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET` e `MICROSOFT_TENANT_ID`;
- `MICROSOFT_ALLOWED_DOMAIN`;
- `RESEND_API_KEY` e `AUTH_EMAIL_FROM`.

## Banco e encerramento da migração

Aplique as migrations do Drizzle antes de publicar, pois o rate limiting usa a
tabela `rate_limit`.

Se um banco legado já possuir o schema mas ainda estiver sem histórico em
`drizzle.__drizzle_migrations`, valide e registre o baseline antes de migrar:

```bash
pnpm db:baseline
pnpm db:baseline --execute --confirm-database=NOME_DO_BANCO
pnpm db:migrate
```

O baseline recusa bancos com tabelas ou colunas obrigatórias ausentes. A
migration customizada seguinte reconcilia, de forma idempotente, os objetos
legados conhecidos que não existiam no banco original.

As linhas legadas do provider `credential` ficam inertes enquanto a equipe
valida OTP e Microsoft em staging. Depois de realizar backup do banco:

```bash
pnpm auth:finalize-passwordless
pnpm auth:finalize-passwordless --execute
```

O primeiro comando mostra apenas os totais. O segundo revoga as sessões dos
usuários afetados e remove as contas `credential`. A coluna nullable
`account.password` é mantida por compatibilidade de schema.

Referências: [Microsoft no Better Auth](https://better-auth.com/docs/authentication/microsoft),
[Email OTP](https://better-auth.com/docs/plugins/email-otp) e
[rate limiting](https://better-auth.com/docs/concepts/rate-limit).
