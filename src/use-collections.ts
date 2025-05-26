import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FsMutableDocument } from "./types";
import type { DocumentData, Query } from "./firestore-types";
import { makeMutableDocument } from "./make-mutable-document";

type CollectionInput<T extends DocumentData> = {
  query: Query<T> | undefined;
  queryKey?: string;
};

type CollectionSubscription<T extends DocumentData> = CollectionInput<T> & {
  unsubscribe?: () => void;
};

type CollectionResult<T extends DocumentData> = CollectionInput<T> & {
  data?: FsMutableDocument<T>[];
  error?: Error;
  snapshots?: FirebaseFirestoreTypes.QueryDocumentSnapshot<T>[];
};

export function useCollections<T extends DocumentData>(
  collections: CollectionInput<T>[]
) {
  const subscriptionsRef = useRef<CollectionSubscription<T>[]>([]);
  const [results, setResults] = useState<CollectionResult<T>[]>([]);

  useEffect(() => {
    /** Start and update snapshot listeners for each collection */
    collections.forEach((collection) => {
      /** Find existing collection */
      const existingSubscription = subscriptionsRef.current.find((c) =>
        compareCollection(c, collection)
      );

      /** If the query is the same, then there is nothing to do */
      if (
        existingSubscription &&
        collection.query &&
        existingSubscription.query?.isEqual(collection.query)
      ) {
        return;
      }

      /** Create new snapshot listener */
      const queryKey =
        collection.queryKey ??
        existingSubscription?.queryKey ??
        generateQueryKey();
      const normalizedCollection = {
        ...collection,
        queryKey,
      };
      const unsubscribe = collection.query?.onSnapshot(
        (snapshot) => {
          const data = snapshot.docs.map((doc) => makeMutableDocument(doc));
          setResults((existingResults) => {
            const filteredResults = existingResults.filter(
              (c) => !compareCollection(c, normalizedCollection)
            );
            return [
              ...filteredResults,
              { ...normalizedCollection, data, snapshots: snapshot.docs },
            ];
          });
        },
        (error) => {
          setResults((existingResults) => {
            const filteredResults = existingResults.filter(
              (c) => !compareCollection(c, normalizedCollection)
            );
            return [...filteredResults, { ...normalizedCollection, error }];
          });
        }
      );

      /** Unsubscribe any existing snapshot listener */
      existingSubscription?.unsubscribe?.();

      /** Update the existing collection, and otherwise create a new one */
      if (existingSubscription) {
        existingSubscription.query = collection.query;
        existingSubscription.queryKey = queryKey;
        existingSubscription.unsubscribe = unsubscribe;
      } else {
        subscriptionsRef.current.push({
          query: collection.query,
          queryKey,
          unsubscribe,
        });
      }
    });

    /** Prune deleted subscriptions */
    subscriptionsRef.current = subscriptionsRef.current.filter(
      (subscription) => {
        const existingCollection = collections.find((c) =>
          compareCollection(c, subscription)
        );
        if (!existingCollection) {
          subscription.unsubscribe?.();
          return false;
        }
        return true;
      }
    );

    /** Prune results for deleted collections */
    setResults((existingResults) => {
      const filteredResults = existingResults.filter(
        (result) => !!collections.find((c) => compareCollection(c, result))
      );
      return isShallowArrayEqual(existingResults, filteredResults)
        ? existingResults
        : filteredResults;
    });
  }, [collections]);

  /** On unmount remove existing subscriptions */
  useEffect(() => {
    return () => {
      subscriptionsRef.current.forEach((subscription) => {
        subscription.unsubscribe?.();
      });
    };
  }, []);

  /**
   * Generate a key for detecting changes in collections
   * (add/remove/update,re-order).
   */
  const differenceKey = collections
    .map(
      (c) =>
        c.queryKey ??
        subscriptionsRef.current.find((s) => compareCollection(c, s))
          ?.queryKey ??
        generateQueryKey()
    )
    .join("-");

  /** Cache the results */
  return useMemo(() => {
    return collections.map((collection) => {
      const existingResult = results.find((c) =>
        compareCollection(c, collection)
      );
      return {
        loading: collection.query && !existingResult?.data,
        data: existingResult?.data,
        error: existingResult?.error,
        snapshots: existingResult?.snapshots,
      };
    });
  }, [differenceKey, results]);
}

function compareCollection<T extends DocumentData>(
  a: CollectionInput<T>,
  b: CollectionInput<T>
) {
  return (
    a.queryKey === b.queryKey ||
    a.query === b.query ||
    (b.query && a.query?.isEqual(b.query))
  );
}

let queryKeyCounter = 0;
function generateQueryKey() {
  return `query-${String(queryKeyCounter++)}`;
}

function isShallowArrayEqual<T>(a: T[] | undefined, b: T[] | undefined) {
  if (a === b || Object.is(a, b)) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}
