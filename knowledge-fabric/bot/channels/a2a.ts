import {
  bearerAuth,
  defineChannel,
  GET,
  localDevStrict,
  POST,
} from "@cursor/bdk/channels";
import { z } from "zod";
import {
  a2aTask,
  agentCard,
  extractUserText,
  jsonRpcError,
  jsonRpcResult,
  type A2aJsonRpc,
} from "../lib/a2a.js";

const fabricToken = process.env.AGENT_FABRIC_BEARER_TOKEN;

export default defineChannel({
  auth: [
    localDevStrict(),
    ...(fabricToken ? [bearerAuth(fabricToken)] : []),
  ],
  routes: [
    GET("/.well-known/agent-card.json", {
      description: "A2A agent card for MuleSoft Agent Fabric registration",
      querySchema: z.object({}),
      handler: async (request) => Response.json(agentCard(request)),
    }),
    GET("/agent-card.json", {
      description: "Alias of the A2A agent card",
      querySchema: z.object({}),
      handler: async (request) => Response.json(agentCard(request)),
    }),
    POST("/invoke", {
      description:
        "Synchronous knowledge question for Mule HTTP / Agentforce topic actions",
      bodySchema: z.object({
        question: z.string().min(1),
        conversationId: z.string().optional(),
      }),
      handler: async (_request, { send, body }) => {
        const session = await send(body.question, {
          continuationToken: body.conversationId
            ? `fabric:${body.conversationId}`
            : undefined,
          title: "Agent Fabric invoke",
        });
        const outcome = await session.waitForCompletion();
        const ok = outcome.status === "finished";
        return Response.json({
          ok,
          sessionId: session.id,
          conversationId: body.conversationId ?? session.id,
          answer: outcome.result ?? outcome.errorMessage ?? "",
          status: outcome.status,
        });
      },
    }),
    POST("/", {
      description: "A2A JSON-RPC 2.0 (message/send, tasks/get)",
      bodySchema: z.unknown(),
      handler: async (_request, { send, getSession, host, body }) => {
        const rpc = (body ?? {}) as A2aJsonRpc;
        if (rpc.jsonrpc && rpc.jsonrpc !== "2.0") {
          return jsonRpcError(rpc.id, -32600, "jsonrpc must be 2.0");
        }
        if (rpc.method === "message/send" || rpc.method === "tasks/send") {
          const extracted = extractUserText(rpc.params);
          if (!extracted.text) {
            return jsonRpcError(rpc.id, -32602, "message text is required");
          }
          const contextId = extracted.contextId ?? `ctx-${crypto.randomUUID()}`;
          const session = await send(extracted.text, {
            continuationToken: `a2a:${contextId}`,
            title: "A2A knowledge question",
          });
          const outcome = await session.waitForCompletion();
          const taskId = session.id;
          const state = outcome.status === "finished" ? "completed" : "failed";
          const text =
            outcome.result ?? outcome.errorMessage ?? "No answer produced.";
          const task = a2aTask({ taskId, contextId, state, text });
          await host.kv.put(`a2a:task:${taskId}`, {
            task,
            sessionId: session.id,
          });
          return jsonRpcResult(rpc.id, task);
        }
        if (rpc.method === "tasks/get") {
          const params = (rpc.params ?? {}) as { id?: string };
          if (!params.id) {
            return jsonRpcError(rpc.id, -32602, "task id is required");
          }
          const stored = await host.kv.get(`a2a:task:${params.id}`);
          if (
            stored &&
            typeof stored === "object" &&
            !Array.isArray(stored) &&
            "task" in stored
          ) {
            return jsonRpcResult(rpc.id, stored.task);
          }
          const session = await getSession(params.id);
          if (!session) {
            return jsonRpcError(rpc.id, -32001, "task not found");
          }
          return jsonRpcResult(
            rpc.id,
            a2aTask({
              taskId: session.id,
              contextId: session.continuationToken ?? session.id,
              state: "working",
              text: "",
            }),
          );
        }
        return jsonRpcError(
          rpc.id,
          -32601,
          `Unsupported method: ${String(rpc.method ?? "missing")}`,
        );
      },
    }),
  ],
});
