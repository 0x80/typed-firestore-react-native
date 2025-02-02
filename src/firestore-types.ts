/**
 * The official @react-native-firebase types are awkward. Re-export the ones
 * that have a forced namespace so they align better with other SDKs.
 */
import type { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export type DocumentData = FirebaseFirestoreTypes.DocumentData;

export type DocumentReference<
  T extends FirebaseFirestoreTypes.DocumentData = DocumentData,
> = FirebaseFirestoreTypes.DocumentReference<T>;

export type CollectionReference<
  T extends FirebaseFirestoreTypes.DocumentData = DocumentData,
> = FirebaseFirestoreTypes.CollectionReference<T>;

export type DocumentSnapshot<T extends DocumentData> =
  FirebaseFirestoreTypes.DocumentSnapshot<T>;

export type Transaction = FirebaseFirestoreTypes.Transaction;

export type Query<T extends DocumentData = DocumentData> =
  FirebaseFirestoreTypes.Query<T>;

export type QuerySnapshot<T extends DocumentData = DocumentData> =
  FirebaseFirestoreTypes.QuerySnapshot<T>;

export type SnapshotListenOptions =
  FirebaseFirestoreTypes.SnapshotListenOptions;
