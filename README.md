# Agent Browser UI Orchestrator Kit — Elinsa routes

V1 para revisar, padronizar e melhorar a interface do site usando:

- `agent-browser` como navegador/olhos do agente;
- `codex exec` como executor não interativo;
- prompts especializados;
- um orquestrador em TypeScript.

Esta versão já vem com as rotas públicas, rotas de conta e rotas autenticadas do portal.

## Instalação

Na raiz do projeto:

```bash
pnpm add -D tsx
npm install -g agent-browser
agent-browser install --with-deps
```

Adicione no `package.json`:

```json
{
  "scripts": {
    "ai:crawl": "tsx scripts/ai/agent-browser-crawl.ts",
    "ai:improve": "tsx scripts/ai/orchestrator.ts"
  }
}
```

Copie os arquivos:

```bash
cp -r .ai scripts /caminho/do/seu/projeto/
```

Ou, se estiver usando o ZIP:

```bash
unzip agent-browser-ui-orchestrator-kit-elinsa.zip
cp -r agent-browser-ui-orchestrator-kit-elinsa/.ai .
cp -r agent-browser-ui-orchestrator-kit-elinsa/scripts .
cp agent-browser-ui-orchestrator-kit-elinsa/.env.agent.example .
```

## Credenciais de teste

A senha NÃO fica salva no ZIP. Coloque localmente em `.env.agent.local`:

```bash
cp .env.agent.example .env.agent.local
```

Depois edite:

```env
AGENT_BROWSER_TEST_EMAIL=seu-email-de-teste
AGENT_BROWSER_TEST_PASSWORD=sua-senha-de-teste
```

O arquivo `.env.agent.local` deve ficar fora do git.

Adicione no `.gitignore`:

```gitignore
.env.agent.local
.ai/runs/
```

## Rodar

Use uma branch separada:

```bash
git checkout -b ai/ui-polish
pnpm ai:improve
```

Para só capturar as telas:

```bash
pnpm ai:crawl -- --iteration manual
```

## Rotas configuradas

### Públicas

- `/`
- `/acompanhar-denuncia`
- `/assinatura-de-email`
- `/contato`
- `/denunciar`
- `/imprensa`
- `/licencas`
- `/mapas`
- `/marca`
- `/privacidade`
- `/quem-somos`
- `/termos`
- `/vagas`

### Conta

- `/configuracoes`
- `/convite`
- `/criar`
- `/entrar`
- `/recuperar-senha`
- `/redefinir-senha`
- `/verificar-email`

### Portal autenticado

- `/portal`
- `/portal/blog`
- `/portal/comite-de-etica`
- `/portal/contatos`
- `/portal/gestao`
- `/portal/gestao/convites`
- `/portal/gestao/equipes`
- `/portal/gestao/ferramentas`
- `/portal/gestao/organizacao`
- `/portal/mercurio`

## Como o login funciona

Antes de entrar nas rotas `auth: true`, o crawler abre `/entrar`, preenche e-mail/senha via JS no browser e submete o formulário.

Os seletores ficam em `.ai/config.json`:

```json
"auth": {
  "loginPath": "/entrar",
  "usernameEnv": "AGENT_BROWSER_TEST_EMAIL",
  "passwordEnv": "AGENT_BROWSER_TEST_PASSWORD",
  "usernameSelector": "input[type='email'], input[name='email'], input[name='username']",
  "passwordSelector": "input[type='password']",
  "submitSelector": "button[type='submit']"
}
```

Se teu formulário tiver nomes diferentes, muda esses seletores. Sem drama. Mentira: sempre tem drama, mas pelo menos aqui é localizado.

## Saída

Os relatórios e capturas ficam em:

```txt
.ai/runs/
```

E as alterações ficam no working tree para revisar:

```bash
git diff
```

## Segurança

O fluxo é propositalmente chato:

- revisores rodam em `read-only`;
- implementadores rodam em `workspace-write`;
- prompts proíbem mexer em API, auth, banco, migrations, payload config e `.env`;
- o Critic para se detectar risco grave.

Comece com `maxIterations: 1` em `.ai/config.json`.
