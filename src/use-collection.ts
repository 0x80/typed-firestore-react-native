import {
  limit,
  query,
  type QueryConstraint,
} from "@react-native-firebase/firestore";
import { useMemo } from "react";
import type { CollectionReference, DocumentData } from "./firestore-types";
import { useCollection_fork, useCollectionOnce_fork } from "./fork";
import { makeMutableDocument } from "./make-mutable-document";
import type { FsMutableDocument } from "./types";
import { getErrorMessage, isDefined } from "./utils";

/**
 * The @react-native-firebase/firestore query constraint functions where,
 * orderBy, limit, etc. are incorrectly typed and are missing the `_apply`
 * method.
 *
 * Exclude the `_apply` method to make the type checker happy.
 */
type QueryConstraints = (Omit<QueryConstraint, "_apply"> | undefined)[];

export function useCollection<T extends DocumentData>(
  collectionRef: CollectionReference<T>,
  ...queryConstraints: QueryConstraints
): [FsMutableDocument<T>[], false] | [undefined, true] {
  const hasNoConstraints = queryConstraints.length === 0;

  const _query = hasNoConstraints
    ? query(collectionRef, limit(500))
    : query(collectionRef, ...queryConstraints.filter(isDefined));

  /**
   * We do not need the loading state really. If there is no data, and there is
   * no error, it means data is still loading.
   */
  const [snapshot, , error] = useCollection_fork(_query);

  if (error) {
    throw new Error(
      `Failed to execute query on ${collectionRef.path}: ${getErrorMessage(error)}`
    );
  }

  const docs = useMemo(() => {
    if (!snapshot) {
      return undefined;
    }
    return snapshot.docs.map((doc) => makeMutableDocument(doc));
  }, [snapshot]);

  return docs ? [docs, false] : [undefined, true];
}

export function useCollectionOnce<T extends DocumentData>(
  collectionRef: CollectionReference<T>,
  ...queryConstraints: QueryConstraints
): [FsMutableDocument<T>[], false] | [undefined, true] {
  const hasNoConstraints = queryConstraints.length === 0;

  const _query = hasNoConstraints
    ? query(collectionRef, limit(500))
    : query(collectionRef, ...queryConstraints.filter(isDefined));

  /**
   * We do not need the loading state really. If there is no data, and there is
   * no error, it means data is still loading.
   */
  const [snapshot, , error] = useCollectionOnce_fork(_query);

  if (error) {
    throw new Error(
      `Failed to execute query on ${collectionRef.path}: ${getErrorMessage(error)}`
    );
  }

  const docs = useMemo(() => {
    if (!snapshot) {
      return undefined;
    }
    return snapshot.docs.map((doc) => makeMutableDocument(doc));
  }, [snapshot]);

  return docs ? [docs, false] : [undefined, true];
}
