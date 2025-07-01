import { useMemo } from "react";
import type {
  DocumentData,
  DocumentReference,
  FirestoreError,
} from "./firestore-types";
import { useDocument_fork, useDocumentOnce_fork } from "./fork";
import { makeMutableDocument } from "./make-mutable-document";
import type { FsMutableDocument } from "./types";

export function useSpecificDocument<T extends DocumentData>(
  documentRef: DocumentReference<T>
) {
  /**
   * Currently the same as useSpecificDocumentMaybe.
   *
   * @todo: investigate whether to throw in case of an permission error
   */
  return useSpecificDocumentMaybe(documentRef);
}

export function useSpecificDocumentMaybe<T extends DocumentData>(
  documentRef: DocumentReference<T>
):
  | [FsMutableDocument<T>, false, FirestoreError | undefined]
  | [undefined, true, FirestoreError | undefined] {
  const [snapshot, , error] = useDocument_fork(documentRef);

  const document = useMemo(
    () => (snapshot?.exists ? makeMutableDocument(snapshot) : undefined),
    [snapshot]
  );

  return document ? [document, false, error] : [undefined, true, error];
}

export function useSpecificDocumentData<T extends DocumentData>(
  documentRef: DocumentReference<T>
):
  | [T, false, FirestoreError | undefined]
  | [undefined, true, FirestoreError | undefined] {
  const [document, , error] = useSpecificDocument(documentRef);

  return document ? [document.data, false, error] : [undefined, true, error];
}

export function useSpecificDocumentDataMaybe<T extends DocumentData>(
  documentRef: DocumentReference<T>
):
  | [T, false, FirestoreError | undefined]
  | [undefined, true, FirestoreError | undefined] {
  const [document, , error] = useSpecificDocumentMaybe(documentRef);

  return document ? [document.data, false, error] : [undefined, true, error];
}

export function useSpecificDocumentOnce<T extends DocumentData>(
  documentRef: DocumentReference<T>
):
  | [FsMutableDocument<T>, false]
  | [undefined, true, FirestoreError | undefined] {
  const [snapshot, , error] = useDocumentOnce_fork(documentRef);

  const document = useMemo(
    () => (snapshot?.exists ? makeMutableDocument(snapshot) : undefined),
    [snapshot]
  );

  return document ? [document, false] : [undefined, true, error];
}

export function useSpecificDocumentDataOnce<T extends DocumentData>(
  documentRef: DocumentReference<T>
): [T, false] | [undefined, true, FirestoreError | undefined] {
  const [document, , error] = useSpecificDocumentOnce(documentRef);

  return document ? [document.data, false] : [undefined, true, error];
}
