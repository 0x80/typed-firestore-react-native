import { deleteDoc, updateDoc } from "./firestore";
import type {
  FsMutableDocument,
  FsMutableDocumentInTransaction,
} from "~/types";
import type {
  DocumentData,
  DocumentSnapshot,
  Transaction,
  UpdateData,
} from "./firestore-types";

export function makeMutableDocument<T extends DocumentData>(
  doc: DocumentSnapshot<T>
): FsMutableDocument<T> {
  return {
    id: doc.id,
    data: doc.data()!,
    ref: doc.ref,
    update: (data: UpdateData<T>) => updateDoc(doc.ref, data),
    updateWithPartial: (data: Partial<T>) =>
      updateDoc(doc.ref, data as UpdateData<T>),
    delete: () => deleteDoc(doc.ref),
  };
}

export function makeMutableDocumentInTransaction<T extends DocumentData>(
  doc: DocumentSnapshot<T>,
  tx: Transaction
): FsMutableDocumentInTransaction<T> {
  return {
    id: doc.id,
    data: doc.data()!,
    ref: doc.ref,
    update: (data: UpdateData<T>) => tx.update(doc.ref, data),
    updateWithPartial: (data: Partial<T>) =>
      tx.update(doc.ref, data as UpdateData<T>),
    delete: () => tx.delete(doc.ref),
  };
}
