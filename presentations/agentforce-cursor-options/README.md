# Agentforce ↔ Cursor agents — integration options

Decision deck for how Salesforce **Agentforce** should reach Cursor-built capability through **MuleSoft Agent Fabric**.

## Files

| File | Purpose |
| --- | --- |
| [`Agentforce-Cursor-Integration-Options.pptx`](./Agentforce-Cursor-Integration-Options.pptx) | Presentable PowerPoint (14 slides) |
| [`speaker-notes.md`](./speaker-notes.md) | Talk track per slide |
| [`preview.html`](./preview.html) | Browser-friendly slide preview |

## The two options (short)

1. **Option A — Mule MCP app** (`mule-knowledge-mcp/`): register `https://<host>/mcp` in Agent Fabric. Agentforce keeps the reasoning loop. **Recommended for Fabric today.**
2. **Option B — Cursor BDK agent** (`knowledge-fabric/`): Fabric calls the agent over MCP or A2A. Full Cursor model turns. **Requires self-host** (Cursor-managed architecture v2 does not expose a public MCP/A2A URL yet).

## Source context

- Repo implementation and prior agent run *Cursor internal knowledge agent*.
- Reference Google Slides deck was linked but not readable from this environment (private / auth required). Re-align visuals if that deck is shared.
- Call recordings for the project synopsis were not available in this environment.
