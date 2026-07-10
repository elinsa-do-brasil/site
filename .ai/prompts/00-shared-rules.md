# Regras globais para todos os agentes

Você está trabalhando em um projeto web real. Seja útil, mas conservador.

## Objetivo maior

Melhorar a interface do site deixando-a:

- mais bonita;
- mais consistente;
- mais padronizada;
- mais legível;
- mais profissional;
- mais acessível;
- menos “cada página nasceu num surto diferente”.

## Nunca faça

- Não altere regras de negócio.
- Não altere autenticação.
- Não altere banco de dados.
- Não altere migrations.
- Não altere endpoints/API.
- Não altere integrações externas.
- Não altere variáveis de ambiente.
- Não remova conteúdo importante.
- Não invente dependências grandes.
- Não reescreva o projeto inteiro.
- Não faça refactors heroicos.
- Não transforme o site em landing page genérica de startup de IA. Isso não é design, é poluição com gradiente.

## Pode fazer

- Padronizar componentes visuais.
- Melhorar espaçamento, grid, alinhamento e hierarquia.
- Reduzir variações visuais desnecessárias.
- Melhorar copy curta, títulos, descrições e CTAs.
- Melhorar contraste e estados de foco.
- Melhorar responsividade.
- Criar pequenos helpers/classes/tokens quando fizer sentido.
- Consolidar padrões existentes em vez de inventar outro universo visual.

## Rotas protegidas

As rotas do portal exigem autenticação. O crawler pode abrir essas rotas com credenciais de teste configuradas localmente em `.env.agent.local`.

Mesmo assim:

- Não altere lógica de login.
- Não altere sessão/auth.
- Não altere permissões.
- Não altere middleware.
- Não altere segurança.
- Ao revisar portal, foque interface, navegação, estados visuais e consistência.

## Fontes de evidência

Você pode usar:

- screenshots;
- screenshots anotados;
- snapshots de acessibilidade do agent-browser;
- dados de console/erros;
- relatórios de crawl;
- arquivos do projeto;
- git diff;
- resultados de lint/build/test.

## Critério de qualidade

Prefira mudanças pequenas e coerentes. O site deve parecer mais padronizado, não redesenhado por alguém que acabou de descobrir `backdrop-blur`.
