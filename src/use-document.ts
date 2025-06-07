import { doc } from "./firestore";
import { useMemo } from "react";
import type {
  CollectionReference,
  DocumentData,
  FirestoreError,
} from "./firestore-types";
import { useDocument_fork, useDocumentOnce_fork } from "./fork";
import { makeMutableDocument } from "./make-mutable-document";
import type { FsMutableDocument } from "./types.js";

export function useDocument<T extends DocumentData>(
  collectionRef: CollectionReference<T>,
  documentId?: string
) {
  /**
   * Currently the same as useDocumentMaybe.
   *
   * @todo: investigate whether to throw in case of an permission error
   */
  return useDocumentMaybe(collectionRef, documentId);
}

export function useDocumentMaybe<T extends DocumentData>(
  collectionRef: CollectionReference<T>,
  documentId?: string
):
  | [FsMutableDocument<T>, false, FirestoreError | undefined]
  | [undefined, true, FirestoreError | undefined] {
  const ref = documentId ? doc(collectionRef, documentId) : undefined;

  /**
   * We do not need the loading state really. If there is no data, and there is
   * no error, it means data is still loading.
   */
  const [snapshot, , error] = useDocument_fork(ref);

  const document = useMemo(
    () => (snapshot?.exists ? makeMutableDocument(snapshot) : undefined),
    [snapshot]
  );

  return document ? [document, false, error] : [undefined, true, error];
}

export function useDocumentData<T extends DocumentData>(
  collectionRef: CollectionReference<T>,
  documentId?: string
):
  | [T, false, FirestoreError | undefined]
  | [undefined, true, FirestoreError | undefined] {
  const [document, , error] = useDocument(collectionRef, documentId);

  return document ? [document.data, false, error] : [undefined, true, error];
}

export function useDocumentDataMaybe<T extends DocumentData>(
  collectionRef: CollectionReference<T>,
  documentId?: string
):
  | [T, false, FirestoreError | undefined]
  | [undefined, true, FirestoreError | undefined] {
  const [document, , error] = useDocumentMaybe(collectionRef, documentId);

  return document ? [document?.data, false, error] : [undefined, true, error];
}

export function useDocumentOnceMaybe<T extends DocumentData>(
  collectionRef: CollectionReference<T>,
  documentId?: string
):
  | [FsMutableDocument<T>, false]
  | [undefined, true, FirestoreError | undefined] {
  const ref = documentId ? doc(collectionRef, documentId) : undefined;
  const [snapshot, , error] = useDocumentOnce_fork(ref);

  const document = useMemo(
    () => (snapshot?.exists ? makeMutableDocument(snapshot) : undefined),
    [snapshot]
  );

  return document ? [document, false] : [undefined, true, error];
}

export function useDocumentOnce<T extends DocumentData>(
  collectionRef: CollectionReference<T>,
  documentId?: string
) {
  /**
   * Currently the same as useDocumentOnceMaybe.
   *
   * @todo: investigate whether to throw in case of an permission error
   */
  return useDocumentOnceMaybe(collectionRef, documentId);
}

export function useDocumentDataOnce<T extends DocumentData>(
  collectionRef: CollectionReference<T>,
  documentId?: string
): [T, false] | [undefined, true, FirestoreError | undefined] {
  const [document, , error] = useDocumentOnce(collectionRef, documentId);

  return document ? [document.data, false] : [undefined, true, error];
}
