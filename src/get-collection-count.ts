import { query } from "@react-native-firebase/firestore";
import type {
  CollectionReference,
  DocumentData,
  QueryConstraints,
} from "./firestore-types";
import { getCount } from "./firestore";

export async function getCollectionCount<T extends DocumentData>(
  collectionRef: CollectionReference<T>,
  ...queryConstraints: QueryConstraints
) {
  const snapshot = await getCount(query(collectionRef, ...queryConstraints));
  return snapshot.data().count;
}
