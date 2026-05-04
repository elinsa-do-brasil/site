# 🏢 Elinsa do Brasil — Site Institucional

Portal institucional da **Elinsa do Brasil**, desenvolvido internamente pela equipe de TI com apoio do Marketing. O objetivo é estabelecer uma presença digital profissional, disponível 24h, que centralize informações da empresa e fortaleça a marca.

> Consulte o [documento de projeto](.docs/gemini-code-1777929287737.md) para detalhes sobre escopo, cronograma e responsabilidades.

---

## 🎨 Identidade Visual

| Token | Cor | Aplicação |
| :--- | :--- | :--- |
| **Azul Céu** | `#4DB8FF` | Destaques e acentos visuais |
| **Azul Principal** | `#0077B6` | Menus e botões |
| **Azul Escuro** | `#023E8A` | Títulos e rodapé |
| **Azul Claro** | `#CAF0F8` | Fundos suaves |
| **Branco** | `#FFFFFF` | Base das páginas |

---

## 🛠 Stack Tecnológica

Conjunto de tecnologias escolhidas para o desenvolvimento, estilização e manutenção do site.

### Framework e Linguagem

| Tecnologia | Finalidade |
| :--- | :--- |
| **[Next.js](https://nextjs.org)** `16.x` | Framework principal. Responsável pela estrutura do site, roteamento entre páginas e otimização de performance. Utilizado por empresas como Nike, Twitch e TikTok. |
| **[React](https://react.dev)** `19.x` | Biblioteca de interface. Permite construir componentes visuais reutilizáveis (menus, botões, seções). Mantida pela Meta. |
| **[TypeScript](https://www.typescriptlang.org)** `6.x` | Extensão do JavaScript que adiciona tipagem estática, reduzindo erros e facilitando a manutenção do código a longo prazo. |

### Estilização e Componentes

| Tecnologia | Finalidade |
| :--- | :--- |
| **[Tailwind CSS](https://tailwindcss.com)** `4.x` | Sistema de estilização por classes utilitárias. Agiliza a aplicação de cores, espaçamentos e responsividade sem necessidade de arquivos CSS separados. |
| **[shadcn/ui](https://ui.shadcn.com)** `4.x` | Coleção de componentes de interface prontos e acessíveis (formulários, modais, menus), personalizáveis com as cores da marca. |
| **[Radix UI](https://www.radix-ui.com)** `1.x` | Primitivos de acessibilidade que garantem o funcionamento correto dos componentes em todos os navegadores e para usuários com necessidades especiais. |
| **[Hugeicons](https://hugeicons.com)** `4.x` | Biblioteca de ícones utilizada em botões, menus e indicadores visuais ao longo do site. |

### Conteúdo

| Tecnologia | Finalidade |
| :--- | :--- |
| **[MDX](https://mdxjs.com)** | Formato de escrita que permite criar páginas de conteúdo (notícias, textos institucionais) em texto simples, sem editar código diretamente. |

### Qualidade de Código

| Tecnologia | Finalidade |
| :--- | :--- |
| **[Biome](https://biomejs.dev)** `2.x` | Ferramenta de padronização e verificação automática do código, garantindo consistência mesmo com múltiplos desenvolvedores. |
| **[React Compiler](https://react.dev/learn/react-compiler)** `1.x` | Otimizador automático de performance, reduzindo carregamentos desnecessários sem intervenção manual. |
| **[pnpm](https://pnpm.io)** | Gerenciador de dependências do projeto. Instala e organiza todas as bibliotecas necessárias de forma eficiente. |

---

## 📁 Estrutura do Projeto

```
elinsa/
├── app/                  # Páginas do site (cada pasta corresponde a uma rota)
│   ├── globals.css       # Estilos globais e variáveis de cor da marca
│   ├── layout.tsx        # Estrutura comum a todas as páginas (cabeçalho, rodapé)
│   └── page.tsx          # Página inicial
├── components/
│   └── ui/               # Componentes visuais reutilizáveis
├── lib/                  # Funções auxiliares compartilhadas
├── public/               # Arquivos estáticos (imagens, favicon)
├── .docs/                # Documentação interna do projeto
└── (arquivos de config)  # Configurações técnicas (Next.js, TypeScript, Biome, etc.)
```

---

## 🚀 Desenvolvimento Local

**Pré-requisitos:** Node.js 20+ e pnpm 10+.

```bash
# Instalar dependências (necessário apenas na primeira vez ou após atualizações)
pnpm install

# Iniciar servidor de desenvolvimento em http://localhost:3000
pnpm dev

# Gerar versão de produção
pnpm build && pnpm start

# Verificar e corrigir formatação do código
pnpm lint
pnpm format
```

---

## 📄 Páginas Planejadas

| Página | Descrição |
| :--- | :--- |
| **Página Inicial** | Banner institucional, destaques e chamadas para ação |
| **Quem Somos** | Histórico, missão, visão e valores |
| **Serviços / Soluções** | Catálogo de serviços oferecidos |
| **Projetos** | Portfólio de projetos realizados |
| **Notícias** | Atualizações e novidades da empresa |
| **Trabalhe Conosco** | Oportunidades de carreira |
| **Contato** | Formulário de contato e acesso rápido via WhatsApp |
| **Política de Privacidade** | Conformidade com a LGPD |
