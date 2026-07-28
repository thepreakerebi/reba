/**
 * SSE fan-out. One channel — the CHW view watching every mother at once.
 *
 * Pattern lifted from Sky: serialise the payload once, send per client inside try/catch, and hand
 * the caller back an unregister closure rather than exposing the map.
 */

import type { MiddlewareHandler } from "hono";

export type RealtimeClient = { send: (data: string) => unknown };

const CHANNEL = "watch";

const clients = new Map<string, Set<RealtimeClient>>();

export function registerRealtimeClient(client: RealtimeClient, channel = CHANNEL): () => void {
  const set = clients.get(channel) ?? new Set<RealtimeClient>();
  set.add(client);
  clients.set(channel, set);
  return () => {
    set.delete(client);
    if (set.size === 0) clients.delete(channel);
  };
}

export function broadcastInvalidate(keys: string[][], channel = CHANNEL): void {
  const set = clients.get(channel);
  if (!set || set.size === 0) return;
  const payload = JSON.stringify({ type: "invalidate", keys });
  for (const client of set) {
    try {
      void client.send(payload);
    } catch {
      // A dead client is removed by its own onAbort handler; never break the loop for one.
    }
  }
}

/** Post-hoc: runs after the handler, skips reads and anything that failed. */
export function broadcastOnMutation(keys: string[][]): MiddlewareHandler {
  return async (c, next) => {
    await next();
    if (c.req.method === "GET" || c.req.method === "HEAD") return;
    if (c.res.status >= 400) return;
    broadcastInvalidate(keys);
  };
}
