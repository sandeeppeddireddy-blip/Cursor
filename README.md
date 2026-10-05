# Cursor / MuleSoft knowledge fabric

This repository contains two complementary paths for Salesforce **Agentforce**
to search internal knowledge through **MuleSoft Agent Fabric**:

1. **Mule MCP app (recommended for Agent Fabric)** — [`mule-knowledge-mcp/`](mule-knowledge-mcp/README.md)  
   Deployable Anypoint package using MCP Connector. Register `https://<host>/mcp` in Exchange.

2. **Cursor BDK agent** — [`knowledge-fabric/`](knowledge-fabric/README.md)  
   Cursor-hosted or self-hosted agent with model reasoning. Self-host if you need a public MCP/A2A URL; Cursor-managed v2 deploy does not yet expose one for Agent Fabric.

Sample Agent Network wiring: [`mule-agent-fabric/`](mule-agent-fabric/README.md).
