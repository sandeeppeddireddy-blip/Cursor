# Internal Knowledge Agent

Cursor BDK agent that searches internal knowledge and returns cited answers.
Salesforce Agentforce consumes it through MuleSoft Agent Fabric (MCP or A2A).

AskQuestion was not available in this environment, so these defaults were used:

- Purpose: domain assistant over internal knowledge
- Name / location: `knowledge-fabric`
- Model: `grok-4.5` with `effort=high` and `fast=true`
- Channels: playground + HTTP (always on) and an A2A / invoke custom channel
- MCP: none inbound; this agent *is* the MCP/A2A server Agent Fabric calls
- Capabilities: server tools, one skill, smoke evals

## Run locally

Requires Node 22.13+ (never Bun). From this directory:

```bash
npm install
npx @cursor/bdk validate --dir .
npx @cursor/bdk info --dir . --json
npx @cursor/bdk call search_knowledge --dir . --input '{"query":"Professional list price"}'
npx @cursor/bdk serve --dir . --mode single --dev
```

Playground: http://127.0.0.1:3000/playground

Model turns (`bdk run`, evals, Agentforce answers) need a Cursor credential:
`CURSOR_API_KEY`, `CURSOR_API_KEY_FILE`, `CURSOR_SERVICE_ACCOUNT_KEY`, or `bdk login`.

```bash
npx @cursor/bdk run --dir . --message "What is the list price for Northstar Cloud Professional?"
npx @cursor/bdk eval --dir .
```

Replace files in `knowledge/` with your real articles. Search is local keyword match over those Markdown files.

## How Agentforce reaches this agent

```
Agentforce  →  MuleSoft Agent Fabric (registry + broker/gateway)
           →  this agent (MCP ask, A2A message/send, or HTTP invoke)
           →  search_knowledge / get_knowledge_document
           →  cited answer
```

### 1. MCP (recommended on Cursor-hosted agents)

BDK already serves streamable HTTP MCP:

- `POST /v1/mcp` — `ask`, `check`, and `call_tool` (session auth)
- `POST /v1/mcp/tools` — deterministic server tools only

Register that MCP URL in Anypoint Exchange / Agent Fabric, then attach it as an MCP connection on the Agent Broker (`kind: mcp`). Agentforce talks to the broker; the broker calls `ask` with the user question.

Use a bearer token (`bdk serve --bearer-token …` or the hosted alias token). Do not expose MCP anonymously.

### 2. A2A (self-hosted BDK behind Omni Gateway)

Agent Fabric looks up `{baseUrl}/.well-known/agent-card.json` (protocol 0.3.0). This project serves:

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/v1/channels/a2a/.well-known/agent-card.json` | Agent card |
| POST | `/v1/channels/a2a/` | JSON-RPC `message/send`, `tasks/get` |
| POST | `/v1/channels/a2a/invoke` | Simple `{ question, conversationId? }` JSON |

Set `PUBLIC_AGENT_URL` to the public base of the A2A channel (must end so that `.well-known/agent-card.json` is appended, typically `https://<host>/v1/channels/a2a`). Set `AGENT_FABRIC_BEARER_TOKEN` and send `Authorization: Bearer …` from the gateway.

Loopback still works without the token (`localDevStrict`).

On **Cursor-managed hosting**, custom channel handlers are acknowledged with an empty `202` before they run, so the agent card and synchronous JSON-RPC responses will not reach Agent Fabric. Use MCP or self-host `bdk serve` behind MuleSoft for A2A.

Sample Agent Network files: `../mule-agent-fabric/`.

### 3. Agentforce topic / action

In Agentforce, add an action that calls the Agent Fabric broker (or a Mule HTTP listener that POSTs `/v1/channels/a2a/invoke`). Keep the topic instructions: "Ask the internal knowledge agent; do not invent prices or discounts."

## Layout

```
knowledge-fabric/
  bot/agent.ts
  bot/instructions.md
  bot/tools/search_knowledge.ts
  bot/tools/get_knowledge_document.ts
  bot/skills/cite-internal-knowledge.md
  bot/channels/a2a.ts
  knowledge/*.md          # replace with your corpus
  evals/knowledge.eval.ts
```
