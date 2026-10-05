# Bruno / cURL for Cursor-hosted `knowledge-fabric`

Architecture **v2** hosted agents are called through the Cursor control plane
(`https://api.cursor.com`), not a public `/v1/mcp` URL.

Auth: Cursor **service account** or user API key as `Authorization: Bearer …`.

| Var | Value |
| --- | --- |
| `baseUrl` | `https://api.cursor.com` |
| `teamId` | `33263637` (NeuraFlash) |
| `slug` | `knowledge-fabric` |
| `CURSOR_API_KEY` | your key (never commit) |

Dashboard: https://cursor.com/dashboard/deployed-agents/knowledge-fabric

## Import into Bruno

**Option A — collection**
1. Bruno → Open Collection → `bruno/knowledge-fabric-cloud/`
2. Select env `cloud`
3. Set secret `cursorApiKey`

**Option B — paste cURL**
Bruno → Import → cURL → paste any request below.

## 1) Start a turn

```bash
curl -X POST 'https://api.cursor.com/internal/agentsdk/deployments/knowledge-fabric/sessions' \
  -H "Authorization: Bearer $CURSOR_API_KEY" \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
    "teamId": 33263637,
    "message": "What is the list price for Northstar Cloud Professional?"
  }'
```

Expected: `202` with `deliveryId`, `workflowId`, `sessionMode`.
`sessionId` is often **missing** at accept time.

Dry-run (read tools only):

```bash
curl -X POST 'https://api.cursor.com/internal/agentsdk/deployments/knowledge-fabric/sessions' \
  -H "Authorization: Bearer $CURSOR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "teamId": 33263637,
    "message": "What is NST-PRO list price?",
    "dryRun": true
  }'
```

## 2) Find the session id

Wait a few seconds, then:

```bash
curl -X GET 'https://api.cursor.com/internal/agentsdk/deployments/knowledge-fabric/logs?teamId=33263637' \
  -H "Authorization: Bearer $CURSOR_API_KEY" \
  -H 'Accept: application/json'
```

Copy the newest `sessions[].sessionId` (looks like `ses_…`).

## 3) Poll events (answer lives here)

```bash
curl -X GET "https://api.cursor.com/internal/agentsdk/deployments/knowledge-fabric/sessions/${SESSION_ID}/events?teamId=33263637&afterEventIndex=-1" \
  -H "Authorization: Bearer $CURSOR_API_KEY" \
  -H 'Accept: application/json'
```

Look for `type: "message.completed"` — assistant text is in that event’s `data`.

## 4) Optional: runs / follow-up

```bash
curl -X GET "https://api.cursor.com/internal/agentsdk/deployments/knowledge-fabric/sessions/${SESSION_ID}/runs?teamId=33263637" \
  -H "Authorization: Bearer $CURSOR_API_KEY"
```

```bash
curl -X POST 'https://api.cursor.com/internal/agentsdk/deployments/knowledge-fabric/sessions' \
  -H "Authorization: Bearer $CURSOR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d "{
    \"teamId\": 33263637,
    \"sessionId\": \"${SESSION_ID}\",
    \"message\": \"Cite the article id for that price.\"
  }"
```

## What will not work for sync Bruno answers

- Alias URL + `X-Agent-Alias-Token` against `/v1/mcp` or `/v1/session` → 404 on this v2 deploy
- Custom channel `/v1/channels/a2a/invoke` on Cursor hosting → empty `202` (no response body)

For a single request/response HTTP API, use the Mule MCP app (`mule-knowledge-mcp`) once deployed, or self-host BDK.
