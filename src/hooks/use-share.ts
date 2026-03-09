import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { createPaste, PasteSizeExceededError } from "../lib/paste-api";
import { compressCode } from "../lib/url-codec";

const PASTE_PREFIX = "p:";

export interface ShareResult {
  readonly existing: boolean;
  readonly url: string;
}

function buildUrl(hash: string): string {
  return `${window.location.origin}${window.location.pathname}#${hash}`;
}

export function useShare() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (code: string): Promise<ShareResult> => {
      // Check cache first
      const cached = queryClient.getQueryData<ShareResult>(["share", code]);
      if (cached) {
        return cached;
      }

      try {
        const result = await createPaste(code);
        const url = buildUrl(`${PASTE_PREFIX}${result.id}`);
        return { url, existing: result.existing };
      } catch (error) {
        if (error instanceof PasteSizeExceededError) {
          throw error;
        }
        // Fallback to compressed URL
        const compressed = await compressCode(code);
        return { url: buildUrl(compressed), existing: false };
      }
    },
    onSuccess: (data, code) => {
      queryClient.setQueryData(["share", code], data);
    },
  });

  const share = useCallback(
    (code: string) => mutation.mutateAsync(code),
    [mutation]
  );

  const prefetch = useCallback(
    (code: string) => {
      if (!code.trim()) {
        return;
      }
      const cached = queryClient.getQueryData<ShareResult>(["share", code]);
      if (cached) {
        return;
      }
      // Fire and forget
      mutation.mutateAsync(code).catch(() => {
        // fire and forget — errors shown on dialog open
      });
    },
    [queryClient, mutation]
  );

  const getCachedUrl = useCallback(
    (code: string): ShareResult | null => {
      return queryClient.getQueryData<ShareResult>(["share", code]) ?? null;
    },
    [queryClient]
  );

  return {
    share,
    prefetch,
    getCachedUrl,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    data: mutation.data,
    error: mutation.error,
    reset: mutation.reset,
  };
}
