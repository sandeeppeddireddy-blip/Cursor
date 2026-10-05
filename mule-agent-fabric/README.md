# Example Agent Fabric wiring

These files are a starting point for an Anypoint Agent Network project.
They are not a deployable Mule app. Deploy `../mule-knowledge-mcp/` first,
register its MCP URL in Exchange, then wire a broker Agentforce can call.

Replace group IDs, asset IDs, and URLs with your Anypoint org values.

## Primary path: Mule MCP app

1. Deploy `mule-knowledge-mcp` to CloudHub 2.0 / Runtime Fabric / Hybrid.
2. Set `mule.http.service.implementation=NETTY`.
3. Register `https://<host>/mcp` in Exchange as an MCP server.
4. Reference it from `agent-network.yaml` as `kind: mcp`.
5. Point Agentforce at the broker (A2A bridge if the consumer is A2A-only).

## Optional: Cursor BDK A2A

The Cursor BDK agent under `../knowledge-fabric/` can still be registered as
A2A when self-hosted. Cursor-managed hosting currently does not expose a
public MCP URL for architecture v2.

Connection URL must end with `/` so Fabric can fetch:

`https://<host>/v1/channels/a2a/.well-known/agent-card.json`
