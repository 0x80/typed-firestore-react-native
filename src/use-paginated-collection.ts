import {
  type QueryConstraint,
  query,
  limit,
} from "@react-native-firebase/firestore";
import { useMemo, useState } from "react";
import { useCollections } from "./use-collections";
import type { CollectionReference, DocumentData } from "./firestore-types";
import { getErrorMessage, isDefined } from "./utils";
import { useIsFirestoreQueryEqual } from "./fork/helpers/useIsFirestoreQueryEqual";
import type { FsMutableDocument } from "./types";

export function usePaginatedCollection<T extends DocumentData>(
  collectionRef: CollectionReference<T>,
  options?: { pageSize?: number },
  ...queryConstraints: (Omit<QueryConstraint, "_apply"> | undefined)[]
): [FsMutableDocument<T>[], boolean, boolean, () => void] {
  const { pageSize = 50 } = options ?? {};
  const _query = query(
    collectionRef,
    ...queryConstraints.filter(isDefined),
    limit(pageSize)
  );

  const getInitialQueries = () => [{ query: _query, queryKey: "page-1" }];

  const [queries, setQueries] = useState(() => getInitialQueries());

  /** Reset queries when query changes */
  useIsFirestoreQueryEqual(_query, () => setQueries(getInitialQueries()));

  const results = useCollections(queries);

  const error = results.find((result) => result.error)?.error;
  if (error) {
    throw new Error(
      `Failed to execute query on ${collectionRef.path}: ${getErrorMessage(error)}`
    );
  }

  return useMemo(() => {
    const data = results.flatMap((result) => result.data ?? []);
    const isLoading = results.some((result) => result.loading);
    const hasMore = results.at(-1)?.data?.length === pageSize;
    const fetchMore = () => {
      const lastDoc = results.at(-1)?.snapshots?.at(-1);
      if (!lastDoc) return;
      setQueries((prevQueries) => [
        ...prevQueries,
        {
          query: _query?.startAfter(lastDoc).limit(pageSize),
          queryKey: `page-${prevQueries.length + 1}`,
        },
      ]);
    };
    return [data, isLoading, hasMore, fetchMore];
  }, [results]);
}
