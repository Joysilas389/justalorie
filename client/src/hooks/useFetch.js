import { useState, useEffect, useCallback } from 'react';

export function useFetch(fetchFn, params = null, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFn(params);
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [fetchFn, JSON.stringify(params)]);

  useEffect(() => { load(); }, [load, ...deps]);

  return { data, loading, error, refetch: load, setData };
}
