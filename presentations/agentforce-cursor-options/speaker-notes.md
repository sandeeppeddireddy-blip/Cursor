# Speaker notes

## 1. Title

Open with the decision: we have a working knowledge agent story in Cursor, and a Fabric-ready Mule MCP path — the question is which one Agentforce should call in production.

## 2. Agenda

Keep this tight. Emphasize that the deck is a **decision** brief, not a status dump.

## 3. Project context

Recount the arc:

- Goal: Agentforce → Agent Fabric → internal knowledge with citations.
- Built `knowledge-fabric` (Cursor BDK) and deployed on Cursor-managed hosting (NeuraFlash team, architecture v2).
- Discovered blocker: no registerable public MCP/A2A URL on v2; A2A custom channels return empty `202`s.
- Built `mule-knowledge-mcp` as the Fabric-native package path.

## 4. Decision in one sentence

Frame Salesforce’s own language: **tools (MCP)** vs **peer agents (A2A)**. Don’t force a coding/knowledge agent into A2A if a tool surface is enough.

## 5–6. Option A

Walk the flow left to right. Stress:

- Deploy + Exchange registration is the Anypoint-native motion.
- Intelligence is in Agentforce — so topic instructions matter (“search, then get document, then cite; never invent”).
- Strengths are operational; tradeoff is losing Cursor’s model loop on the critical path.

## 7–9. Option B

Show the same flow with Cursor BDK in the middle. Then pause on the hosting table — this is the make-or-break slide.

- Cursor-managed v2: playground / Bruno control-plane yes; Fabric registration no.
- Self-host `bdk serve` behind HTTPS + bearer: yes.
- Discourage the “Mule polls Cursor control plane” bridge.

## 10. Side-by-side

Use this for the room to argue. Don’t re-read every row — call out **Fabric-ready now?** and **Who reasons?**

## 11. Intelligence question

Direct answer to “will MCP be as smart as the agent?”:

> MCP gives tools; an agent adds reasoning.

If Agentforce is well-prompted and tool-allowlisted, Option A is enough for knowledge Q&A. If we need BDK eval discipline and multi-step refusal behavior, we need Option B (self-hosted).

## 12. Recommendation

Be decisive: **ship Option A now**; keep Option B warm for agent-grade turns / future Cursor MCP gateway.

## 13. Open questions

Leave time. Capture owners for ops (Anypoint vs self-host) and corpus ownership.

## 14. Appendix

Point people at repo paths. Mention the reference Google Slides / call recordings if they become available for style alignment.
