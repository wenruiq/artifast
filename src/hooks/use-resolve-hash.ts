import { useQuery } from "@tanstack/react-query";
import { fetchPaste } from "../lib/paste-api";
import { decompressCode } from "../lib/url-codec";
import { useHashState } from "./use-hash-state";

export function useResolveHash() {
  const { pasteId, compressedCode } = useHashState();

  const pasteQuery = useQuery({
    queryKey: ["paste", pasteId],
    // biome-ignore lint/style/noNonNullAssertion: guarded by enabled
    queryFn: () => fetchPaste(pasteId!),
    enabled: pasteId !== null,
    staleTime: Number.POSITIVE_INFINITY,
    retry: 1,
  });

  const decompressQuery = useQuery({
    queryKey: ["decompress", compressedCode],
    // biome-ignore lint/style/noNonNullAssertion: guarded by enabled
    queryFn: () => decompressCode(compressedCode!),
    enabled: compressedCode !== null,
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
  });

  const code = pasteId
    ? (pasteQuery.data ?? null)
    : (decompressQuery.data ?? null);
  const isLoading = pasteId ? pasteQuery.isLoading : decompressQuery.isLoading;

  return { code, isLoading };
}
