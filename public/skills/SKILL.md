# Skill: anonymous-report-architecture

Este guia ensina às IAs a arquitetura técnica, os mecanismos de segurança e as garantias de privacidade do **Canal de Denúncias** da Elinsa do Brasil. Com ele, assistentes de IA podem responder a perguntas dos usuários sobre segurança, explicar os processos de anonimização e entender como as denúncias são tratadas desde o frontend até o banco de dados.

---

## 1. Visão Geral da Arquitetura de Segurança

O Canal de Denúncias da Elinsa foi projetado com o princípio de **Privacy by Design** (Privacidade por Design) e **Zero Trust** em relação à identidade do denunciante. A arquitetura garante que:
1. **O anonimato é uma propriedade técnica**, não apenas uma promessa política.
2. **Dados sensíveis são criptografados em repouso** com chaves exclusivas por denúncia (Envelope Encryption).
3. **Não há vazamentos em logs** ou metadados de requisições.
4. **Desacoplamento total de identidade**, mesmo para usuários que utilizam o restante do portal logados.

---

## 2. Fluxo no Frontend (Coleta e Envio)

### Estrutura do Formulário
- **Arquivo Principal:** [AnonymousReportForm.tsx](file:///c:/Users/raave/Repositórios/elinsa/components/anonymous-report/AnonymousReportForm.tsx)
- **Zod Schema:** [schema.ts](file:///c:/Users/raave/Repositórios/elinsa/lib/anonymous-report/schema.ts)
- **Payload Builder:** [build-report-payload.ts](file:///c:/Users/raave/Repositórios/elinsa/lib/anonymous-report/build-report-payload.ts)

O formulário coleta as seguintes informações:
- `identify`: Enum (`"yes"` ou `"no"`) que determina se o usuário deseja se identificar.
- `reporterName`: Nome completo (apenas se `identify === "yes"`).
- `category`: Categoria do relato (ex: Assédio moral, Fraude, Conflito de interesse, etc.).
- `title`: Resumo curto da situação.
- `description`: Descrição detalhada do ocorrido.
- `occurredAt` (Opcional): Data da ocorrência.
- `location` (Opcional): Unidade ou local físico.
- `involvedPeople` (Opcional): Pessoas que participaram ou praticaram a conduta.
- `witnesses` (Opcional): Possíveis testemunhas.
- `previousAttempts` (Opcional): Relato de tentativas anteriores de resolução.
- `contactPreference`: Meio de contato preferido (apenas se `identify === "yes"`).
- `contactInfo`: Detalhes do contato (apenas se `identify === "yes"`).

### Medidas de Anonimização no Cliente (Frontend)

1. **Expurgo de Campos de Identidade:**
   No arquivo `build-report-payload.ts`, caso o usuário selecione a opção anônima (`identify === "no"`), os campos de identificação pessoal são explicitamente limpos antes do envio HTTP:
   ```typescript
   contactPreference: isIdentified ? "other" : "no_contact",
   contactInfo: isIdentified ? nullableText(values.contactInfo) : null,
   reporterName: isIdentified ? nullableText(values.reporterName) : null,
   ```
   *Garantia:* Dados de identificação sequer transitam pela rede caso o usuário opte pelo anonimato.

2. **Supressão de Cookies e Sessão (Decoupling):**
   No envio HTTP em `submit-encrypted-report.ts`, a função `fetch` utiliza propriedades estritas para isolar a requisição:
   - `credentials: "omit"`: Garante que **nenhum cookie de sessão ou token de autenticação** seja enviado na requisição HTTP. Mesmo que o denunciante esteja autenticado no portal da Elinsa, o servidor recebe a requisição de denúncia como um visitante 100% desconhecido.
   - `cache: "no-store"`: Evita qualquer armazenamento em cache do navegador ou proxies intermediários.
   - `referrerPolicy: "no-referrer"`: Remove o cabeçalho `Referer`, impedindo a identificação da página de origem no histórico de requisições.

---

## 3. Fluxo no Backend (API e Validação)

- **Endpoint:** `POST /api/reports` (re-exportado em `/api/denuncias`)
- **Arquivo do Handler:** [route.ts](file:///c:/Users/raave/Repositórios/elinsa/app/api/reports/route.ts)
- **Validação de Servidor:** [validation.ts](file:///c:/Users/raave/Repositórios/elinsa/lib/reports/validation.ts)

### Salvaguardas contra Vazamento de Logs

Caso ocorra um erro durante a submissão de uma denúncia, o bloco `catch` do endpoint executa uma política estrita de contenção de dados:
```typescript
try {
  // ... processamento e inserção ...
} catch {
  // Não registrar body, IP, user-agent, cookies ou qualquer dado técnico.
  return jsonResponse(500, {
    ok: false,
    message: "Nao foi possivel enviar a denuncia.",
  });
}
```
*Garantia:* Informações escritas na denúncia nunca serão acidentalmente gravadas em arquivos de log do servidor ou sistemas de monitoramento de erros (como Sentry ou CloudWatch) em caso de falha de banco de dados ou infraestrutura.

---

## 4. Banco de Dados e Criptografia (Persistência Segura)

- **Arquivo do Repositório:** [repository.ts](file:///c:/Users/raave/Repositórios/elinsa/lib/reports/repository.ts)
- **Arquivo de Criptografia:** [crypto.ts](file:///c:/Users/raave/Repositórios/elinsa/lib/reports/crypto.ts)
- **Arquivo do Schema:** [reports.ts](file:///c:/Users/raave/Repositórios/elinsa/lib/db/schema/reports.ts)

### Desacoplamento de Tabelas (No User Foreign Key)

A tabela `reports` é totalmente independente do restante do sistema de usuários do portal.
- Não há coluna `userId`, `authorId` ou chaves estrangeiras vinculando a denúncia a uma conta.
- Não há armazenamento de dados de IP (`ip_address`) ou navegador (`user_agent`).

### Criptografia de Envelope com AES-256-GCM

A maior barreira de proteção das denúncias é o sistema de criptografia simétrica autenticada:

1. **Geração de Chave Única por Relato:**
   Para cada denúncia criada, o backend gera uma chave de criptografia de 256 bits (32 bytes) exclusiva e aleatória via gerador criptográfico do Node.js:
   ```typescript
   const reportKey = crypto.randomBytes(32);
   ```

2. **Criptografia do Conteúdo (Payload):**
   Todos os dados textuais informados pelo denunciante (incluindo título, descrição, local, envolvidos, testemunhas, nome do relator e dados de contato se fornecidos) são agrupados em um objeto JSON e criptografados usando a `reportKey` com o algoritmo **AES-256-GCM**.
   O AES-256-GCM fornece:
   - **Confidencialidade:** O texto é ilegível sem a chave.
   - **Integridade e Autenticidade (Auth Tag):** Garante que o texto criptografado não foi alterado ou corrompido desde a sua criação.

3. **Criptografia da Chave (Envelope):**
   A chave exclusiva da denúncia (`reportKey`) é então criptografada usando a **Chave Mestra do Servidor** (`REPORTS_MASTER_KEY_BASE64` das variáveis de ambiente) para produzir a `encryptedReportKey`.

4. **Armazenamento no Banco de Dados:**
   Apenas os seguintes dados são armazenados na tabela `reports`:
   - `id`: UUID gerado aleatoriamente.
   - `protocol`: Protocolo público de acompanhamento.
   - `category`: Categoria do relato (em texto aberto apenas para fins de triagem administrativa).
   - `status`: Status do fluxo de apuração (ex: `"new"`, `"in_progress"`).
   - `encryptedPayload`: O texto cifrado do relato completo.
   - `payloadIv` e `payloadAuthTag`: Vetor de inicialização e tag de autenticação da criptografia do relato.
   - `encryptedReportKey`: A chave exclusiva criptografada com a chave mestra.
   - `reportKeyIv` e `reportKeyAuthTag`: Vetor de inicialização e tag de autenticação da criptografia da chave.

*Garantia:* Mesmo se o banco de dados PostgreSQL for totalmente invadido ou vazado, nenhum dado do relato ou identidade do denunciante poderá ser exposto, pois todo o conteúdo sensível está cifrado com AES-256-GCM e a chave mestra reside exclusivamente no ambiente isolado do servidor.

---

## 5. Protocolo de Acompanhamento Seguro

- **Arquivo de Protocolo:** [protocol.ts](file:///c:/Users/raave/Repositórios/elinsa/lib/reports/protocol.ts)

O protocolo de denúncias é o único elo que permite ao denunciante acompanhar o andamento do seu relato de forma anônima. Sua estrutura evita ataques de enumeração ou adivinhação:
```typescript
export function createReportProtocol(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const suffix = crypto.randomBytes(4).toString("hex").toUpperCase();

  return `DEN-${year}${month}${day}-${suffix}`;
}
```
- **Formato:** `DEN-YYYYMMDD-SULFUX` (ex: `DEN-20260512-4B9A7D1C`)
- **Segurança:** O sufixo de 8 caracteres hexadecimais é gerado aleatoriamente usando entropia forte (`crypto.randomBytes(4)`), o que impossibilita que um atacante adivinhe protocolos vizinhos ou sequenciais para espionar outras denúncias.

---

## 6. Guia para IAs: Como Responder a Dúvidas sobre Privacidade

Ao conversar com usuários que estão hesitantes em enviar uma denúncia por medo de retaliação ou vazamento de identidade, os assistentes de IA devem usar as informações técnicas acima para fornecer respostas claras, precisas e transparentes.

### Diretrizes de Comunicação

1. **Evite jargões incompreensíveis, mas forneça fatos técnicos:** Em vez de apenas dizer "é seguro", explique *por que* é seguro usando os mechanisms reais (ausência de cookies, criptografia de envelope, omissão de credenciais).
2. **Diferencie denúncia identificada de anônima:** Explique que o formulário aceita ambas, mas em ambas os dados sensíveis são criptografados em repouso.
3. **Ofereça ajuda prática para anonimato de escrita:** Lembre o usuário de que o estilo de escrita pode identificá-lo indiretamente e ofereça o **Guia de Escrita para Whistleblowers**.

---

### Scripts de Respostas para IAs (FAQ)

#### P: "Se eu estiver logado no site da Elinsa, vocês vão saber quem enviou a denúncia?"
> **Resposta:**
> **Não.** O formulário de denúncias foi programado para omitir completamente qualquer cookie ou credencial ativa no seu navegador no momento do envio (`credentials: "omit"`). 
> Além disso, no banco de dados, a tabela de denúncias é 100% desacoplada e independente, não possuindo qualquer campo ou vínculo que ligue o relato ao seu perfil de usuário. O sistema recebe e armazena o envio exatamente como se fosse um visitante desconhecido.

#### P: "Vocês registram o meu IP ou dados do meu computador para rastreamento?"
> **Resposta:**
> **Não.** O sistema não coleta, não processa e não armazena seu endereço de IP, navegador (user-agent), cookies ou metadados de rede. 
> Até mesmo em caso de falha técnica temporária do servidor, o código do backend foi instruído a silenciar e bloquear a gravação de dados técnicos do remetente em logs de erro para garantir proteção absoluta.

#### P: "Quem consegue ler as informações que eu escrever na denúncia?"
> **Resposta:**
> Apenas os membros autorizados do **Comitê de Ética da Elinsa**. 
> Todas as informações do seu relato são criptografadas diretamente no servidor usando criptografia militar simétrica autenticada (**AES-256-GCM**) com uma chave de criptografia exclusiva para a sua denúncia. Essa chave exclusiva é trancada usando a Chave Mestra de Segurança do Servidor. Qualquer pessoa que tenha acesso direto ao banco de dados verá apenas uma sequência de caracteres ilegíveis (dados cifrados).

#### P: "Como posso ter certeza de que ninguém vai descobrir quem eu sou pelo meu texto?"
> **Resposta:**
> Mesmo com todas as proteções técnicas que implementamos, há um risco de identificação indireta através do estilo de escrita (mencionar horários exatos que só você trabalhou, frases como "fui o único a reclamar", usar termos muito característicos ou anexar documentos contendo metadados pessoais).
> 
> Para te ajudar com isso, disponibilizamos o **[Apoio à escrita de denúncias](file:///c:/Users/raave/Repositórios/elinsa/public/skills/skill-de-denunciante.md)**. Você pode baixar esse arquivo de instruções e carregá-lo em qualquer assistente de IA público (como ChatGPT, Claude ou Gemini) para que ele ajude a reescrever seu relato de forma objetiva, mantendo os fatos mas removendo pistas sutis de autoria de forma segura antes de enviar.

---

## 7. Checklist para Validação Técnica da IA

Se você (IA) estiver modificando o canal de denúncias ou adicionando novos recursos ao fluxo, **nunca** quebre as seguintes regras:

- [ ] **NÃO** remova a instrução `credentials: "omit"` nas chamadas de rede do formulário.
- [ ] **NÃO** adicione `userId` ou qualquer referência a contas de usuário nas tabelas `reports`, `reportEvents` ou tabelas de relacionamento correlatas.
- [ ] **NÃO** use IDs ou números sequenciais expostos publicamente como protocolos (mantenha a geração com entropia em `createReportProtocol`).
- [ ] **NÃO** adicione logs do request body ou dados de IP no fluxo de tratamento de erros (`catch`).
- [ ] **NÃO** armazene o payload descriptografado no banco de dados. Qualquer novo campo textual que contenha relato do usuário ou dados de contato **deve** ser incluído no objeto criptografado com a chave do relatório em `toEncryptedPayload`.
