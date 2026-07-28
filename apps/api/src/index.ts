import { Hono } from "hono";
import { cors } from "hono/cors";

import mothers from "./routes/mothers";
import system from "./routes/system";

const app = new Hono();

app.use("*", cors());

app.get("/health", (c) => c.json({ ok: true }));
app.route("/api/mothers", mothers);
app.route("/api", system);

app.onError((error, c) => {
  console.error(error);
  return c.json({ error: "Something went wrong. Try again." }, 500);
});

export default { port: Number(process.env.PORT ?? 3001), fetch: app.fetch };
