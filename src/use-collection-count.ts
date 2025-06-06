import { useCallback } from "react";
import { useLoadingValue, useIsFirestoreQueryEqual } from "./fork/helpers";
import {
  type FirestoreError,
  getCountFromServer,
  query,
} from "@react-native-firebase/firestore";
import type {
  QueryConstraints,
  DocumentData,
  CollectionReference,
  Query,
} from "./firestore-types";
import { useEffect } from "react";
import { useIsMounted } from "./fork/helpers";
import { getErrorMessage, isDefined } from "./utils";

function useCollectionCount<T extends DocumentData>(
  query?: Query<T>
): [number | undefined, boolean, FirestoreError | undefined, () => void] {
  const { error, loading, reset, setError, setValue, value } = useLoadingValue<
    number | undefined,
    FirestoreError
  >();
  const isMounted = useIsMounted();
  const ref = useIsFirestoreQueryEqual<Query<T>>(query, reset);

  const loadData = useCallback(async (query?: Query<T> | null) => {
    if (!query) {
      setValue(undefined);
      return;
    }

    try {
      const result = await getCountFromServer(query);
      if (isMounted) {
        setValue(result.data().count);
      }
    } catch (error) {
      if (isMounted) {
        setError(error as FirestoreError);
      }
    }
  }, []);

  const reloadData = useCallback(
    () => loadData(ref.current),
    [loadData, ref.current]
  );

  useEffect(() => {
    loadData(ref.current).catch(setError);
  }, [ref.current]);

  return [value, loading, error, reloadData];
}

export function useCollectionCountOnce<T extends DocumentData>(
  collectionRef: CollectionReference<T>,
  ...queryConstraints: QueryConstraints
): [number, false] | [undefined, true] {
  const [value, , error] = useCollectionCount(
    query(collectionRef, ...queryConstraints.filter(isDefined))
  );

  if (error) {
    throw new Error(
      `Failed to execute query on ${collectionRef.path}: ${getErrorMessage(error)}`
    );
  }

  return value !== undefined ? [value, false] : [undefined, true];
}
