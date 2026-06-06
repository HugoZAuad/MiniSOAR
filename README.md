# 🛡️ MiniSOAR (SOAR Miniaturizado)

![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)

> **Orquestração, Automação e Resposta de Segurança** em escala compacta — do indicador de ameaça ao alerta, com resposta ativa quando necessário.

O **MiniSOAR** é uma plataforma de automação de segurança desenvolvida em **NestJS (TypeScript)**, pautada nos princípios da **Clean Architecture**. O sistema processa indicadores de ameaça (**IP**, **DOMAIN**, **HASH**), enriquecendo-os com dados de inteligência e geo-localização, calculando um score de risco e orquestrando respostas automatizadas.

---

## 📑 Tabela de Conteúdo

- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Fluxo de Processamento](#-fluxo-de-processamento)
- [Como Utilizar](#-como-utilizar)
- [API & CLI](#-api--cli)
- [Configuração](#-configuração)
- [Testes e Qualidade](#-testes-e-qualidade)
- [Observabilidade](#-observabilidade)

---

## 🚀 Funcionalidades

- **Ingestão Versátil:** Processamento via **API HTTP** (real-time) ou **CLI** com processamento **por Stream** (lote).
- **Inteligência Tática:** Enriquecimento automático (Reputação externa, GeoIP, Recorrência interna).
- **Risco Híbrido:** Cálculo de score customizado para priorização de incidentes.
- **Resposta Ativa:** Contenção automática (Firewall/Bloqueio) para ameaças de alto risco.
- **Notificação:** Alertas táticos em tempo real via **webhook do Discord** (Embeds estruturados).
- **Persistência Segura:** Histórico e auditoria com **Prisma ORM** e **PostgreSQL**.

---

## 🏗️ Arquitetura

O projeto segue estritamente a **Clean Architecture (Ports & Adapters)**, garantindo baixo acoplamento e facilidade de evolução.

```text
src/
├── core/             # Lógica de Negócio (Entities, Use Cases, Interfaces)
├── infra/            # Implementações de Infraestrutura (Adapters, HTTP, CLI, DB)
└── module/          # Módulos NestJS (DI/Config de wiring)
```

- **Domain (core/domain):** Entidades (ex.: `Threat`) e contratos de portas/repositórios.
- **Application (core/application):** Casos de uso (ex.: `RegisterThreatUseCase`).
- **Infrastructure (infra/):** Implementações concretas (Prisma, Discord, Firewall, GeoIP, Threat Intelligence).
- **Controllers/DTOs/Guards:** camada de entrada e segurança (HTTP) e execução (CLI).

---

## ⚙️ Fluxo de Processamento (RegisterThreatUseCase)

O processamento segue uma pipeline resiliente e **não bloqueante**.

### Entrada
- Validação de `severity` (**1-10**) e do indicador.

### Enriquecimento Paralelo
- Busca de **recorrência interna**
- Busca de **reputação externa** (Threat Intelligence)
- Busca de **geo-localização** (GeoIP)

> Executado em paralelo com `Promise.all`, reduzindo latência.

### Cálculo de Score
- A entidade `Threat` aplica lógica de saturação e pesos para determinar o `hybridScore`.
- A decisão de alto risco usa o limiar `hybridScore >= 8`.

### Persistência
- Registro do evento no banco (Prisma → Postgres) na tabela `ThreatLog`.

### Notificação (Discord)
- Envio de **embed tático** via webhook.
- **Falhas de notificação não derrubam o fluxo** (captura e log de erro).

### Mitigação (Opcional)
- Se `isHighRisk()` for verdadeiro:
  - execução do playbook de contenção via `FirewallPort.block(...)`.
- **Falhas de mitigação não derrubam o caller** (captura e log de erro).

---

## 🛠️ Como Utilizar

### Pré-requisitos
- Node.js >= 18
- Postgres
- Variáveis de ambiente configuradas

### Instalação
```bash
npm install
```

### Execução (API)
```bash
npm run start:dev
```

### Execução (CLI / Scanner de Lote)
```bash
# Processa um arquivo de indicadores linha a linha
npm run cli -- scan --file ./data/indicadores.txt
```

---

## 🔗 API & CLI

### API HTTP

**POST /threats**

- **Guard:** `ApiKeyGuard`
- **Payload (JSON):**

```json
{
  "indicator": "1.1.1.1",
  "type": "IP",
  "severity": 5
}
```

### CLI

**scan** (modo lote)

- Lê arquivo com **ReadStream**
- Identifica o tipo automaticamente (IP/Hash/Domain)
- Envia cada linha para o use case

---

## ⚙️ Configuração

As seguintes variáveis de ambiente são necessárias:

- **`DATABASE_URL`**
  - String de conexão com o PostgreSQL (usada pelo Prisma)

- **`DISCORD_WEBHOOK_URL`**
  - Webhook para envio de alertas táticos ao Discord
  - Se ausente: o sistema apenas loga warning e segue

---

## 🧪 Testes e Qualidade

O projeto mantém alta confiabilidade com testes unitários e integração.

- **Unitários:** `npm test`
- **E2E:** `npm run test:e2e`
- **Cobertura:** `npm run test:cov`

---

## 📈 Observabilidade

- Logs centralizados com **Winston** (rotativos em `logs/`)
- Tratamento global de exceções com **HttpExceptionFilter**
- **Rate Limiting** com `@nestjs/throttler`
- Interceptação de requests via **LoggingInterceptor**

---

## 📝 Licença

Projeto desenvolvido sob padrões de arquitetura de software profissional.

