import { onSnapshot } from "@react-native-firebase/firestore";
import type {
  DocumentData,
  FirestoreError,
  Query,
  QuerySnapshot,
  SnapshotListenOptions,
} from "../firestore-types";
import { MiddlewareManager } from "./middleware-manager";

const manager = new MiddlewareManager<
  {
    query: Query;
    options: SnapshotListenOptions | undefined;
    onNext: (snapshot: QuerySnapshot) => void;
    onError?: (error: FirestoreError) => void;
    onCompletion?: () => void;
  },
  ReturnType<typeof onSnapshot>
>(({ query, options, onNext, onError, onCompletion }) => {
  return options
    ? onSnapshot(query, options, onNext, onError, onCompletion)
    : onSnapshot(query, onNext, onError, onCompletion);
});

export function onDocsSnapshot<T extends DocumentData>(
  query: Query<T>,
  options: SnapshotListenOptions | undefined,
  onNext: (snapshot: QuerySnapshot<T>) => void,
  onError?: (error: FirestoreError) => void,
  onCompletion?: () => void
) {
  return manager.run({
    query,
    options,
    onNext: onNext as (snapshot: QuerySnapshot) => void,
    onError,
    onCompletion,
  });
}

export function registerOnDocsSnapshotMiddleware(
  middleware: Parameters<(typeof manager)["use"]>[0]
) {
  manager.use(middleware);
}
