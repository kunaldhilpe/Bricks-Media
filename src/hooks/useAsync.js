import { useCallback, useEffect, useRef, useState } from 'react';

export const IDLE = 'idle';
export const LOADING = 'loading';
export const SUCCESS = 'success';
export const ERROR = 'error';

/**
 * Runs an async task and tracks its status.
 *
 * - Results from a superseded run are ignored (fast filter changes never flash
 *   stale data), and the superseded request is aborted rather than left in flight.
 * - `task` is read from a ref, so a stale closure is impossible even if the
 *   caller forgets `deps`. `deps` controls WHEN to refetch, not WHICH function runs.
 * - StrictMode safe: there is no `mounted` flag to get stuck in the "unmounted"
 *   position when React double-invokes effects in development.
 *
 * The task receives `{ signal }` as its final argument. Pass it to fetch/axios to
 * get real cancellation; ignore it and nothing breaks.
 *
 * NOTE: `deps` must have a constant length across renders, and every value in it
 * must be referentially stable. Passing an inline object or array literal
 * (`[{ page, sort }]`) recreates `run` every render and causes an infinite
 * refetch loop. Pass primitives, or memoize the object.
 */
export default function useAsync(
  task,
  deps = [],
  { immediate = true, keepPreviousData = true } = {},
) {
  const [state, setState] = useState({
    data: null,
    error: null,
    status: immediate ? LOADING : IDLE,
    loading: immediate,
  });

  // Always invoke the newest task, whatever the caller put in `deps`.
  const taskRef = useRef(task);
  useEffect(() => {
    taskRef.current = task;
  });

  const runId = useRef(0);
  const controllerRef = useRef(null);

  // Abort whatever is in flight when the component really does go away.
  useEffect(() => () => controllerRef.current?.abort(), []);

  const run = useCallback(
    async (...args) => {
      const id = ++runId.current;

      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setState((prev) => ({
        data: keepPreviousData ? prev.data : null,
        error: null,
        status: LOADING,
        loading: true,
      }));

      try {
        const data = await taskRef.current(...args, { signal: controller.signal });
        if (id !== runId.current) return { data, error: null }; // superseded
        setState({ data, error: null, status: SUCCESS, loading: false });
        return { data, error: null };
      } catch (error) {
        if (id !== runId.current) return { data: null, error };
        if (error?.name === 'AbortError') return { data: null, error };
        setState((prev) => ({
          data: keepPreviousData ? prev.data : null,
          error,
          status: ERROR,
          loading: false,
        }));
        return { data: null, error };
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [keepPreviousData, ...deps],
  );

  useEffect(() => {
    if (immediate) run();
  }, [run, immediate]);

  return { ...state, run, reload: run };
}
