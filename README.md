# 🛡️ MiniSOAR (SOAR Miniaturizado)

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)

> **Orquestração, Automação e Resposta de Segurança** em escala compacta.

O **MiniSOAR** é uma plataforma de automação de segurança construída em **NestJS (TypeScript)** seguindo **Clean Architecture (Ports & Adapters)**.

- Registra **indicadores de ameaça** (`IP`, `DOMAIN`, `HASH`)
- Faz enriquecimento (reputação/GeoIP/recorrência)
- Calcula e persiste um **score de risco** + auditoria
- Pode executar **resposta ativa** (contenção via Firewall) quando o risco é alto

---

## Guia rápido para front-end (copiar/colar)

### 1) Configure a URL base

- Prefixo global: `api/v1`
- Porta padrão: `PORT` (default **3001**)

Exemplo:

- `http://localhost:3001/api/v1`

### 2) Sempre autentique com API Key

Todas as rotas abaixo exigem `x-api-key`.

- Header: **`x-api-key`**
- Valor: **env `API_KEY`** no servidor
- Se `API_KEY` não existir ou a chave estiver errada: **401**

Exemplo de header:

```bash
-H "x-api-key: SUA_API_KEY"
```

### 3) Validações importantes (payload)

- `severity` é **inteiro** e deve estar em **1..10**
- `type` é recebido como string, mas o backend normaliza para **UPPERCASE** (`type.toUpperCase()`)

---

## Endpoints consumidos pelo front-end

> Payloads e query params passam por validação com `ValidationPipe`.

### POST `/api/v1/threats`

**Registrar uma ameaça** (fluxo base: persistência + enriquecimento + notificação + possível contenção).

- Resposta esperada: **201**

**Request body**

```json
{
  "indicator": "1.1.1.1",
  "type": "IP",
  "severity": 5
}
```

**Erros comuns**

- **400**: payload inválido (ex.: `severity` fora de 1..10)
- **401**: `x-api-key` ausente/inválida

**Exemplo (curl)**

```bash
curl -X POST "http://localhost:3001/api/v1/threats" \
  -H "Content-Type: application/json" \
  -H "x-api-key: SUA_API_KEY" \
  -d '{"indicator":"1.1.1.1","type":"IP","severity":5}'
```

**Exemplo (fetch no front-end)**

```ts
const baseUrl = 'http://localhost:3001/api/v1';
const apiKey = 'SUA_API_KEY';

await fetch(`${baseUrl}/threats`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
  },
  body: JSON.stringify({
    indicator: '1.1.1.1',
    type: 'IP',
    severity: 5,
  }),
});
```

---

### GET `/api/v1/threats`

**Listar e filtrar ameaças** com paginação.

- Resposta esperada: **200**

**Query params**

- `page` (int >= 1, opcional; default: `1`)
- `limit` (int >= 1, opcional; default: **15** no DTO)
- `severity` (int >= 1, opcional)
- `indicator` (string, opcional)

**Exemplo (curl)**

```bash
curl -X GET "http://localhost:3001/api/v1/threats?page=1&limit=20&severity=3" \
  -H "x-api-key: SUA_API_KEY"
```

**Exemplo (fetch no front-end)**

```ts
const baseUrl = 'http://localhost:3001/api/v1';
const apiKey = 'SUA_API_KEY';

const params = new URLSearchParams({
  page: '1',
  limit: '15',
  severity: '3',
});

const res = await fetch(`${baseUrl}/threats?${params.toString()}`, {
  headers: { 'x-api-key': apiKey },
});
const data = await res.json();
```

---

### POST `/api/v1/ingestion`

**Ingerir um lote (array)** de ameaças.

- Resposta esperada: **201** (quando o lote é aceito)

**Request body**

```json
{
  "threats": [
    { "indicator": "1.1.1.1", "type": "IP", "severity": 3 },
    { "indicator": "example.com", "type": "DOMAIN", "severity": 7 }
  ]
}
```

**Exemplo (curl)**

```bash
curl -X POST "http://localhost:3001/api/v1/ingestion" \
  -H "Content-Type: application/json" \
  -H "x-api-key: SUA_API_KEY" \
  -d '{
    "threats": [
      {"indicator":"1.1.1.1","type":"IP","severity":3}
    ]
  }'
```

---

### GET `/api/v1/analytics`

**Retorna analytics agregadas**.

- Resposta esperada: **200**

**Exemplo (curl)**

```bash
curl -X GET "http://localhost:3001/api/v1/analytics" \
  -H "x-api-key: SUA_API_KEY"
```

---

## Exemplos de fluxo (para entender o comportamento)

### 1) Cadastrar uma threat (tela de “detecção”)

1. Front-end chama `POST /api/v1/threats`
2. Backend normaliza `type` para uppercase
3. Backend salva no banco
4. Backend tenta notificar (Discord) e, se risco alto, bloqueia via Firewall

### 2) Enviar lote (tela/batch de ingestão)

- Front-end chama `POST /api/v1/ingestion` com `threats: [...]`
- Cada item do array passa pelo mesmo fluxo base do `POST /api/v1/threats`

### 3) Consultar histórico (tela de listagem)

- Front-end chama `GET /api/v1/threats?page&limit&severity&indicator`

### 4) Consultar analytics (dashboard)

- Front-end chama `GET /api/v1/analytics`

---

## Configuração (variáveis de ambiente)

Principais:

- **`DATABASE_URL`**
  - Conexão com PostgreSQL (Prisma)

- **`API_KEY`**
  - Valor esperado pelo `ApiKeyGuard` no header `x-api-key`

- **`DISCORD_WEBHOOK_URL`**
  - Webhook do Discord para alertas
  - Se ausente, o sistema segue apenas logando

- **`PORT`**
  - Porta HTTP (default: `3001`)

- **`FRONTEND_URL`** (opcional)
  - Origem liberada no CORS (além de `http://localhost:3000`)

---

## Testes e qualidade

- Unitários: `npm test`
- E2E: `npm run test:e2e`
- Cobertura: `npm run test:cov`

---

## Observabilidade

- Logging com **Winston** (arquivo rotativo em `logs/`)
- `HttpExceptionFilter` para tratamento global
- `LoggingInterceptor` para interceptar requests
- Rate limiting via `@nestjs/throttler` (configurado no `AppModule`)

---

## Licença

Projeto desenvolvido seguindo práticas de arquitetura de software.

