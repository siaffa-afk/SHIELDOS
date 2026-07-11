// Small data-fetching hook for views: loading/error/data + refetch.
// Keeps components free of fetch plumbing and error formatting.
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api/apiClient.js';

export function useApi(endpoint, params = {}, deps = []) {
  const [state, setState] = useState({ loading: true, data: null, error: null });
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const endpointRef = useRef(endpoint);
  endpointRef.current = endpoint;

  // Keyed on the endpoint PATH, not the object — callers may pass inline
  // objects and must not trigger a refetch loop.
  const refetch = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await api(endpointRef.current, paramsRef.current);
      setState({ loading: false, data, error: null });
    } catch (err) {
      setState({ loading: false, data: null, error: err.userMessage ?? 'Something went wrong.' });
    }
  }, [endpoint.path]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { refetch(); }, [refetch, ...deps]);

  return { ...state, refetch };
}

/** Imperative call for button actions; returns {ok,data|error}. */
export async function call(endpoint, params = {}) {
  try {
    const data = await api(endpoint, params);
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err.userMessage ?? 'Something went wrong.', problems: err.problems };
  }
}
