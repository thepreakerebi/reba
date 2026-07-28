import { Hono } from "hono";
import { streamSSE } from "hono/streaming";

import { RISK_FACTORS, SIGNS, runEvaluation } from "@reba/core";

import { registerRealtimeClient } from "../lib/realtime";

const router = new Hono();

/** The protocol, served to the client so the questions have exactly one source of truth. */
router.get("/protocol", (c) => c.json({ signs: SIGNS, riskFactors: RISK_FACTORS }));

/** Golden-set scoring, computed fresh on every request. */
router.get("/eval", (c) => c.json(runEvaluation()));

router.get("/realtime", (c) =>
  streamSSE(c, async (stream) => {
    const unregister = registerRealtimeClient({
      send: (data) => stream.writeSSE({ event: "message", data }),
    });
    stream.onAbort(unregister);

    try {
      await stream.writeSSE({ event: "connected", data: "ok" });
      while (true) {
        await stream.sleep(25_000);
        await stream.writeSSE({ event: "ping", data: String(Date.now()) });
      }
    } finally {
      unregister();
    }
  }),
);

export default router;
