import { useEffect, useState } from "react";

const PASTE_PREFIX = "p:";

function readHash(): string {
  return window.location.hash.slice(1);
}

export function useHashState() {
  const [hash, setHash] = useState(readHash);

  useEffect(() => {
    function onHashChange() {
      setHash(readHash());
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const isViewerMode = hash.length > 0;
  const isPaste = hash.startsWith(PASTE_PREFIX);
  const pasteId = isPaste ? hash.slice(PASTE_PREFIX.length) : null;
  const compressedCode = !isPaste && hash ? hash : null;

  return { hash, isViewerMode, pasteId, compressedCode };
}
