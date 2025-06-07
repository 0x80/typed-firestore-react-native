import { onSnapshot } from "@react-native-firebase/firestore";
import type {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  FirestoreError,
  SnapshotListenOptions,
} from "../firestore-types";
import { MiddlewareManager } from "./middleware-manager";

const manager = new MiddlewareManager<
  {
    reference: DocumentReference;
    options: SnapshotListenOptions | undefined;
    onNext: (snapshot: DocumentSnapshot<DocumentData>) => void;
    onError?: (error: FirestoreError) => void;
    onCompletion?: () => void;
  },
  ReturnType<typeof onSnapshot>
>(({ reference, options, onNext, onError, onCompletion }) => {
  return options
    ? onSnapshot(reference, options, onNext, onError, onCompletion)
    : onSnapshot(reference, onNext, onError, onCompletion);
});

export function onDocSnapshot<T extends DocumentData>(
  reference: DocumentReference<T>,
  options: SnapshotListenOptions | undefined,
  onNext: (snapshot: DocumentSnapshot<T>) => void,
  onError?: (error: FirestoreError) => void,
  onCompletion?: () => void
) {
  return manager.run({
    reference,
    options,
    onNext: onNext as (snapshot: DocumentSnapshot<DocumentData>) => void,
    onError,
    onCompletion,
  });
}

export function experimental_registerOnDocSnapshotMiddleware(
  middleware: Parameters<(typeof manager)["use"]>[0]
) {
  manager.use(middleware);
}
