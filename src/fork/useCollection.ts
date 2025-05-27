import { getDocs, onDocsSnapshot } from "../firestore";
import { useCallback, useEffect, useMemo } from "react";
import type {
  DocumentData,
  Query,
  QuerySnapshot,
  FirestoreError,
} from "~/firestore-types";
import {
  useIsFirestoreQueryEqual,
  useIsMounted,
  useLoadingValue,
} from "./helpers";
import type {
  CollectionDataHook,
  CollectionDataOnceHook,
  CollectionHook,
  CollectionOnceHook,
  DataOptions,
  OnceDataOptions,
  OnceOptions,
  Options,
} from "./types";

export function useCollection_fork<T extends DocumentData>(
  query?: Query<T>,
  options?: Options
): CollectionHook<T> {
  const { error, loading, reset, setError, setValue, value } = useLoadingValue<
    QuerySnapshot<T>,
    FirestoreError
  >();
  const ref = useIsFirestoreQueryEqual<Query<T>>(query, reset);

  useEffect(() => {
    if (!ref.current) {
      setValue(undefined);
      return;
    }
    const unsubscribe = onDocsSnapshot(
      ref.current,
      options?.snapshotListenOptions,
      setValue,
      setError
    );

    return () => {
      unsubscribe();
    };
  }, [ref.current]);

  return [value!, loading, error];
}

export function useCollectionOnce_fork<T extends DocumentData>(
  query?: Query<T>,
  options?: OnceOptions
): CollectionOnceHook<T> {
  const { error, loading, reset, setError, setValue, value } = useLoadingValue<
    QuerySnapshot<T>,
    FirestoreError
  >();
  const isMounted = useIsMounted();
  const ref = useIsFirestoreQueryEqual<Query<T>>(query, reset);

  const loadData = useCallback(
    async (query?: Query<T> | null, options?: Options & OnceOptions) => {
      if (!query) {
        setValue(undefined);
        return;
      }

      try {
        const result = await getDocs(query, options?.getOptions?.source);
        if (isMounted) {
          setValue(result);
        }
      } catch (error) {
        if (isMounted) {
          setError(error as FirestoreError);
        }
      }
    },
    []
  );

  const reloadData = useCallback(
    () => loadData(ref.current, options),
    [loadData, ref.current]
  );

  useEffect(() => {
    loadData(ref.current, options).catch(setError);
  }, [ref.current]);

  return [value!, loading, error, reloadData];
}

export function useCollectionData_fork<T extends DocumentData>(
  query?: Query<T>,
  options?: DataOptions
): CollectionDataHook<T> {
  const [snapshots, loading, error] = useCollection_fork<T>(query, options);

  const values = getValuesFromSnapshots<T>(snapshots);

  return [values, loading, error, snapshots];
}

export function useCollectionDataOnce_fork<T extends DocumentData>(
  query?: Query<T>,
  options?: OnceDataOptions
): CollectionDataOnceHook<T> {
  const [snapshots, loading, error, reloadData] = useCollectionOnce_fork<T>(
    query,
    options
  );

  const values = getValuesFromSnapshots<T>(snapshots);

  return [values, loading, error, snapshots, reloadData];
}

const getValuesFromSnapshots = <T extends DocumentData>(
  snapshots: QuerySnapshot<T> | undefined
): T[] | undefined => {
  return useMemo(() => snapshots?.docs.map((doc) => doc.data()), [snapshots]);
};
