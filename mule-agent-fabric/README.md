# Example Agent Fabric wiring

These files are a starting point for an Anypoint Agent Network project.
They are not a deployable Mule app. Import the Cursor agent as an MCP
server (preferred) or as an A2A asset, then wire a broker Agentforce can call.

Replace group IDs, asset IDs, and URLs with your Anypoint org values.

## MCP connection (preferred)

1. Host this BDK agent (`bdk serve` or Cursor-managed deploy).
2. Register the MCP endpoint (`https://<host>/v1/mcp`) in Exchange as an MCP server.
3. Reference it from `agent-network.yaml` as `kind: mcp`.
4. Point Agentforce at the broker's A2A/MCP facade (A2A bridge if the consumer is A2A-only).

## A2A connection (self-hosted BDK)

Connection URL must end with `/` so Fabric can fetch:

`https://<host>/v1/channels/a2a/.well-known/agent-card.json`

Set inbound auth on Omni Gateway (JWT, client id, or bearer) to match
`AGENT_FABRIC_BEARER_TOKEN`.
