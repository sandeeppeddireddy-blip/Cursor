# Internal Knowledge MCP (MuleSoft)

Mule application that exposes internal knowledge as an **MCP server** using
[Anypoint Connector for MCP](https://docs.mulesoft.com/mcp-connector/latest/).
Salesforce **Agentforce** can consume it through **MuleSoft Agent Fabric**.

This is the MuleSoft-native package path (not the Cursor BDK agent).

## Tools

| Tool | Purpose |
| --- | --- |
| `search_knowledge` | Keyword search over the packaged corpus |
| `get_knowledge_document` | Load one article by id |
| `list_knowledge_documents` | List article ids and titles |

Corpus lives in:

- `src/main/resources/knowledge/*.md` — editable source articles
- `src/main/resources/knowledge-index.json` — runtime index used by DataWeave

Regenerate the index after editing Markdown:

```bash
python3 scripts/build-knowledge-index.py
```

## Local run (Anypoint Studio / Code Builder)

1. Import this folder as a Mule project (or open in Anypoint Code Builder).
2. Resolve dependencies (Exchange login required for `mule-mcp-connector`).
3. Run the app. Defaults:
   - HTTP: `http://localhost:8081`
   - Health: `GET /health`
   - MCP: `http://localhost:8081/mcp`

Smoke with any MCP client (example initialize):

```bash
curl -sS -X POST http://127.0.0.1:8081/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"smoke","version":"0"}}}'
```

## Deploy

Supported targets for MCP Connector: **CloudHub 2.0**, **Runtime Fabric**, **Hybrid**.

On CloudHub 2.0 / Runtime Fabric, set:

```text
mule.http.service.implementation=NETTY
```

in the app properties (Runtime Manager). Without NETTY, Streamable HTTP MCP can fail.

Also set:

```text
http.port=8081
mcp.endpoint.path=/mcp
```

Apply Anypoint policies (Client ID Enforcement, JWT, rate limiting) on the MCP API/instance before exposing it to Agent Fabric.

## Register in Agent Fabric

1. Deploy this app and note the public base URL, e.g. `https://knowledge-mcp-xxx.cloudhub.io`.
2. Register an MCP server asset in Anypoint Exchange pointing at:
   - `https://<host>/mcp`
3. Reference it from an Agent Network as `kind: mcp` (see `../mule-agent-fabric/`).
4. Point Agentforce at the Agent Fabric broker (or A2A bridge in front of the broker).

Agentforce topic guidance:

> Call `search_knowledge`, then `get_knowledge_document` on the best hits. Answer only from retrieved text. Cite article ids. Do not invent prices or discounts.

## Layout

```
mule-knowledge-mcp/
  pom.xml
  mule-artifact.json
  src/main/mule/knowledge-mcp.xml
  src/main/resources/config.properties
  src/main/resources/knowledge-index.json
  src/main/resources/knowledge/*.md
  src/main/resources/modules/Knowledge.dwl
  scripts/build-knowledge-index.py
```
