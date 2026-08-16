import { useCallback, useEffect, useState } from "react";

/**
 * Fetches data from the given async function and exposes {data, loading,
 * error, reload}. Used by every public page to pull live data from the
 * database via the backend API — no page keeps its own hardcoded state.
 */
export function useApiData(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // This custom hook intentionally forwards a caller-supplied, variable-length
  // deps array through to useCallback — the whole point of useApiData is to let
  // each page declare its own dependencies. eslint-plugin-react-hooks@7's static
  // analysis requires a literal array here (it can't verify a forwarded one), so
  // both the exhaustive-deps check and the literal-array check are disabled for
  // this specific, deliberate pattern.
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
  const memoFetcher = useCallback(fetcher, deps);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    memoFetcher()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load data.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [memoFetcher]);

  useEffect(() => load(), [load]);

  return { data, loading, error, reload: load };
}
