"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { API_URL } from "./api";

/**
 * Opens one EventSource for the session and invalidates the query keys the server names.
 * Keys are broadcast coarsely; TanStack Query's prefix semantics do the rest.
 */
export function useRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const source = new EventSource(`${API_URL}/api/realtime`);

    source.addEventListener("message", (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent).data) as {
          type?: string;
          keys?: string[][];
        };
        if (payload.type !== "invalidate") return;
        for (const key of payload.keys ?? []) {
          void queryClient.invalidateQueries({ queryKey: key });
        }
      } catch {
        // A malformed frame is never worth tearing the stream down for.
      }
    });

    // EventSource reconnects on its own; nothing to do here.
    source.onerror = () => {};

    return () => source.close();
  }, [queryClient]);
}
