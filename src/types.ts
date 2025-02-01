import type { UpdateData } from "@react-native-firebase/firestore";
import type {
  DocumentData,
  DocumentReference,
  Transaction,
} from "./firestore-types";

/**
 * A simple serialize-able document type. Use this when defining functions that
 * take a document but do not need to mutate it.
 */
export type FsDocument<T> = Readonly<{
  id: string;
  data: T;
}>;

export type FsMutableDocument<T extends DocumentData> = Readonly<{
  ref: DocumentReference<T>;
  update: (data: UpdateData<T>) => Promise<void>;
  /**
   * The Firestore `UpdateData` type which allows the use of FieldValue
   * sometimes does not accept perfectly valid data. This is an alternative
   * without FieldValue.
   */
  updateWithPartial: (data: Partial<T>) => Promise<void>;
  delete: () => Promise<void>;
}> &
  FsDocument<T>;

export type FsMutableDocumentInTransaction<T> = Readonly<{
  ref: DocumentReference;
  update: (data: UpdateData<T>) => Transaction;
  /**
   * The Firestore `UpdateData` type which allows the use of FieldValue
   * sometimes does not accept perfectly valid data. This is an alternative
   * without FieldValue.
   */
  updateWithPartial: (data: Partial<T>) => Transaction;
  delete: () => Transaction;
}> &
  FsDocument<T>;
