export type A2aAgentCard = {
  name: string;
  description: string;
  url: string;
  version: string;
  protocolVersion: string;
  capabilities: {
    streaming: boolean;
    pushNotifications: boolean;
  };
  defaultInputModes: string[];
  defaultOutputModes: string[];
  skills: Array<{
    id: string;
    name: string;
    description: string;
    tags: string[];
  }>;
};

export type A2aJsonRpc = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: unknown;
};

export function publicAgentUrl(request: Request): string {
  const configured = process.env.PUBLIC_AGENT_URL?.replace(/\/$/, "");
  if (configured) return configured;
  const url = new URL(request.url);
  return `${url.origin}/v1/channels/a2a`;
}

export function agentCard(request: Request): A2aAgentCard {
  return {
    name: "Internal Knowledge Agent",
    description:
      "Searches internal product, policy, and sales knowledge and returns cited answers for Agentforce via MuleSoft Agent Fabric.",
    url: publicAgentUrl(request),
    version: "1.0.0",
    protocolVersion: "0.3.0",
    capabilities: {
      streaming: false,
      pushNotifications: false,
    },
    defaultInputModes: ["text/plain", "application/json"],
    defaultOutputModes: ["text/plain", "application/json"],
    skills: [
      {
        id: "search-knowledge",
        name: "Search internal knowledge",
        description:
          "Retrieve and summarize internal knowledge with source citations.",
        tags: ["knowledge", "rag", "salesforce", "agentforce"],
      },
    ],
  };
}

export function extractUserText(params: unknown): {
  text: string;
  contextId?: string;
} {
  if (!params || typeof params !== "object") {
    return { text: "" };
  }
  const record = params as Record<string, unknown>;
  const contextId =
    typeof record.contextId === "string" ? record.contextId : undefined;
  const message = record.message;
  if (!message || typeof message !== "object") {
    if (typeof record.question === "string") {
      return { text: record.question, contextId };
    }
    return { text: "", contextId };
  }
  const msg = message as Record<string, unknown>;
  const messageContext =
    typeof msg.contextId === "string" ? msg.contextId : contextId;
  const parts = Array.isArray(msg.parts) ? msg.parts : [];
  const texts: string[] = [];
  for (const part of parts) {
    if (!part || typeof part !== "object") continue;
    const p = part as Record<string, unknown>;
    if (
      (p.kind === "text" || p.type === "text") &&
      typeof p.text === "string"
    ) {
      texts.push(p.text);
    }
  }
  return { text: texts.join("\n").trim(), contextId: messageContext };
}

export function jsonRpcResult(
  id: string | number | null | undefined,
  result: unknown,
): Response {
  return Response.json({ jsonrpc: "2.0", id: id ?? null, result });
}

export function jsonRpcError(
  id: string | number | null | undefined,
  code: number,
  message: string,
  status = 200,
): Response {
  return Response.json(
    { jsonrpc: "2.0", id: id ?? null, error: { code, message } },
    { status },
  );
}

export type A2aTask = {
  id: string;
  contextId: string;
  kind: "task";
  status: {
    state: "completed" | "failed" | "working";
    message: {
      role: "agent";
      kind: "message";
      messageId: string;
      parts: Array<{ kind: "text"; text: string }>;
    };
  };
};

export function a2aTask(input: {
  taskId: string;
  contextId: string;
  state: "completed" | "failed" | "working";
  text: string;
}): A2aTask {
  return {
    id: input.taskId,
    contextId: input.contextId,
    kind: "task",
    status: {
      state: input.state,
      message: {
        role: "agent",
        kind: "message",
        messageId: `msg-${input.taskId}`,
        parts: [{ kind: "text", text: input.text }],
      },
    },
  };
}
