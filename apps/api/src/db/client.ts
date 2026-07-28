import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

/**
 * One driver for both environments.
 *
 * postgres.js speaks plain TCP, so the same code runs against a local Postgres in development and
 * against Neon in production — the only thing that changes is `DATABASE_URL`. TLS is required for
 * anything that isn't localhost.
 */
let instance: ReturnType<typeof create> | undefined;

function create() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  const isLocal = url.includes("localhost") || url.includes("127.0.0.1");
  const client = postgres(url, { ssl: isLocal ? false : "require", max: 5 });

  return drizzle(client, { schema });
}

/** Lazy so importing the schema never opens a connection. */
export const db = new Proxy({} as ReturnType<typeof create>, {
  get(_target, prop) {
    instance ??= create();
    return Reflect.get(instance, prop, instance);
  },
});

export { schema };
