import type { FsDocument } from "~/types";
import type { DocumentData, DocumentSnapshot } from "./firestore-types";

export function makeDocument<T extends DocumentData>(
  doc: DocumentSnapshot<T>
): FsDocument<T> {
  return {
    id: doc.id,
    data: doc.data()!,
  };
}
