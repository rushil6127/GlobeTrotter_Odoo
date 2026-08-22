/**
 * GlobeTrotter — useApiData hook
 *
 * Provides consistent loading, error, and data state for API calls.
 * Use this in every page that fetches data to ensure uniform
 * loading/empty/error behavior as required by antigravity-frontend-rules.md.
 *
 * Usage:
 *   const { data: trips, isLoading, error, refetch } = useApiData(() => getTrips());
 */

import React, { useState, useEffect, useCallback } from "react";
import { ApiError } from "@/lib/api/client";

interface UseApiDataResult<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | Error | null;
  refetch: () => void;
}

export function useApiData<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList = []
): UseApiDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | Error | null>(null);
  const [fetchTick, setFetchTick] = useState(0);

  const refetch = useCallback(() => {
    setFetchTick((t) => t + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const result = await fetcher();
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTick, ...deps]);

  return { data, isLoading, error, refetch };
}
