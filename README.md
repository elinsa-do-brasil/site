# Elinsa do Brasil — Site Institucional

## Proposta de Stack Tecnológica

Proposta de tecnologias, paleta de cores e arquitetura para o portal institucional da Elinsa do Brasil.

> Site institucional da Elinsa do Brasil.

---

## Paleta de Cores

| Nome | OKLCH | HEX | Aplicação |
| :--- | :--- | :--- | :--- |
| Azul Céu | `oklch(0.762 0.145 241.6)` | `#4DB8FF` | Destaques e acentos |
| Azul Principal | `oklch(0.552 0.133 242.7)` | `#0077B6` | Menus e botões |
| Azul Escuro | `oklch(0.380 0.139 258.0)` | `#023E8A` | Títulos e rodapé |
| Azul Claro | `oklch(0.931 0.041 211.8)` | `#CAF0F8` | Fundos suaves |
| Branco | `oklch(1.000 0.000 0)` | `#FFFFFF` | Base das páginas |

---

## Licenciamento

Todas as tecnologias adotadas são **open-source** e distribuídas sob licenças permissivas (predominantemente MIT). Isso garante:

- **Sem custos de licenciamento** — não há assinaturas, royalties ou taxas recorrentes.
- **Uso comercial irrestrito** — utilização livre em contexto empresarial, sem restrições legais.
- **Independência de fornecedor** — código-fonte público, mantido por comunidades ativas e empresas como Meta, Vercel e Google. Em caso de descontinuação, o código permanece disponível.
- **Propriedade integral do conteúdo** — textos, imagens e dados publicados no site são de propriedade exclusiva da Elinsa.

---

## Tecnologias

### Estrutura do Site

| Tecnologia | Versão | Finalidade |
| :--- | :--- | :--- |
| [Next.js](https://nextjs.org) | 16.x | Responsável pela montagem das páginas, navegação entre seções e performance de carregamento. Utilizado por empresas como Nike, Twitch e TikTok. |
| [React](https://react.dev) | 19.x | Construção dos elementos visuais do site (menus, formulários, cards) de forma modular e reutilizável. Mantido pela Meta. |
| [TypeScript](https://www.typescriptlang.org) | 6.x | Verificação de tipos no código, reduzindo erros e facilitando a manutenção a longo prazo. |

### Aparência e Interface

| Tecnologia | Versão | Finalidade |
| :--- | :--- | :--- |
| [Tailwind CSS](https://tailwindcss.com) | 4.x | Sistema de estilização que agiliza a aplicação de cores, espaçamentos e responsividade. |
| [shadcn/ui](https://ui.shadcn.com) | 4.x | Componentes visuais prontos e acessíveis (botões, formulários, modais, tabelas), personalizáveis com a identidade da marca. |
| [Radix UI](https://www.radix-ui.com) | 1.x | Compatibilidade entre navegadores e acessibilidade para pessoas com deficiência. |
| [Hugeicons](https://hugeicons.com) | 4.x | Ícones vetoriais para botões, menus e indicadores visuais. |

### Qualidade e Manutenção

| Tecnologia | Versão | Finalidade |
| :--- | :--- | :--- |
| [Biome](https://biomejs.dev) | 2.x | Verificação e padronização automática do código, garantindo consistência entre desenvolvedores. |
| [React Compiler](https://react.dev/learn/react-compiler) | 1.x | Otimização automática de performance, melhorando a velocidade do site sem intervenção manual. |
| [pnpm](https://pnpm.io) | 10.x | Gerenciador de dependências do projeto. |

### Hospedagem e Infraestrutura

| Serviço | Finalidade |
| :--- | :--- |
| [Microsoft Azure](https://azure.microsoft.com) | Hospedagem do site e do banco de dados. Plataforma já utilizada na infraestrutura da empresa, garantindo conformidade com políticas de segurança corporativas. |
| Banco de dados (Azure) | Armazenamento dos dados do CMS (notícias, vagas, usuários), sob controle exclusivo da Elinsa. |

### Autenticação

O acesso ao painel administrativo requer um sistema de login seguro. Duas opções estão em avaliação:

| Opção | Descrição |
| :--- | :--- |
| [Better Auth](https://www.better-auth.com) + [Entra ID](https://www.microsoft.com/pt-br/security/business/identity-access/microsoft-entra-id) | Login com a conta corporativa Microsoft já existente. Dispensa a criação de senhas separadas e centraliza o controle de permissões no Entra ID (antigo Azure AD). |
| Sistema nativo do Payload | Gerenciamento próprio de usuários e senhas. Alternativa mais simples caso a integração com Entra ID não seja viável na primeira versão. |

A definição será feita durante o desenvolvimento, com base na viabilidade de integração com o ambiente Microsoft existente.

---

## Gestão de Conteúdo — Payload CMS

O [Payload](https://payloadcms.com) é um sistema de gestão de conteúdo open-source (licença MIT) construído com as mesmas tecnologias do site. Será responsável pelas áreas do portal que demandam atualização frequente: **notícias** e **vagas de emprego**.

### Funcionamento

O Payload disponibiliza um **painel administrativo** acessível pelo navegador (em `/admin`), onde pessoas autorizadas podem criar, editar e publicar conteúdo sem conhecimento técnico e sem depender da equipe de TI.

O editor de texto é compatível com **Markdown**, um formato de escrita simples onde se utiliza `#` para títulos e `**texto**` para negrito. A experiência de edição é similar à de plataformas como Notion ou Google Docs, permitindo produzir artigos com formatação rica de forma ágil.

### Conteúdo gerenciado

| Conteúdo | Descrição | Responsável |
| :--- | :--- | :--- |
| Notícias | Artigos, comunicados e novidades da empresa | Marketing |
| Vagas | Oportunidades de emprego com título, descrição, requisitos e status (aberta/encerrada) | RH / Marketing |
| Imagens | Fotos e arquivos utilizados nos artigos e vagas | Marketing |
| Usuários | Controle de acesso ao painel administrativo | TI |

### Fluxo de publicação

1. O responsável acessa o painel (`/admin`) e faz login
2. Cria ou edita o conteúdo no editor visual, adiciona imagens conforme necessário
3. Publica — o conteúdo é exibido automaticamente na página correspondente do site
4. Pode editar, despublicar ou remover o conteúdo a qualquer momento

### Justificativa

- Integrado ao site — o painel administrativo é parte da mesma aplicação, sem exigir infraestrutura separada
- Compatibilidade total com o stack adotado, sem introduzir ferramentas ou linguagens adicionais
- Dados armazenados no banco de dados da empresa na Azure, sem dependência de serviços externos
- Geração automática das interfaces necessárias para o site exibir o conteúdo publicado

---

## Páginas Planejadas

| Página | Descrição | Fonte do conteúdo |
| :--- | :--- | :--- |
| Página Inicial | Banner institucional, destaques e chamadas para ação | Fixo |
| Quem Somos | Histórico, missão, visão e valores | Fixo |
| Serviços / Soluções | Catálogo de serviços oferecidos | Fixo |
| Projetos | Portfólio de projetos realizados | Fixo |
| Notícias | Atualizações e novidades da empresa | Payload CMS |
| Trabalhe Conosco | Oportunidades de carreira | Payload CMS |
| Contato | Formulário de contato e acesso rápido via WhatsApp | Fixo |
| Política de Privacidade | Conformidade com a LGPD | Fixo |

---

## Estrutura do Projeto

```
elinsa/
├── app/
│   ├── (frontend)/           # Páginas públicas do site
│   │   ├── noticias/
│   │   ├── trabalhe-conosco/
│   │   └── ...
│   └── (payload)/
│       └── admin/            # Painel administrativo (acesso restrito)
├── collections/
│   ├── Posts.ts              # Definição de notícias
│   ├── Vagas.ts              # Definição de vagas
│   ├── Media.ts              # Gestão de imagens
│   └── Users.ts              # Controle de acesso
├── components/
│   └── ui/                   # Componentes visuais reutilizáveis
├── public/                   # Arquivos estáticos (favicon, imagens fixas)
├── payload.config.ts         # Configuração do CMS
└── next.config.ts            # Configuração do site
```

---

## Documentação

A documentação fica em outro repositório e é publicada no subdomínio `docs.*`
do mesmo ambiente. Links antigos em `/docs` são redirecionados para esse host.

---

## Desenvolvimento Local

**Pré-requisitos:** Node.js 20+ e pnpm 10+.

```bash
pnpm install                  # Instalar dependências
pnpm dev                      # Iniciar em http://localhost:3000
pnpm build && pnpm start      # Gerar versão de produção
pnpm lint                     # Verificar problemas no código
pnpm format                   # Corrigir formatação
```
