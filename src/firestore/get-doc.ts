import {
  getDoc as getDocFirestore,
  getDocFromCache,
  getDocFromServer,
} from "@react-native-firebase/firestore";
import type {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
} from "../firestore-types";
import { MiddlewareManager } from "./middleware-manager";

type GetDocSource = "default" | "cache" | "server";

const manager = new MiddlewareManager<
  { reference: Parameters<typeof getDocFirestore>[0]; source: GetDocSource },
  ReturnType<typeof getDocFirestore>
>(({ reference, source }) => {
  switch (source) {
    case "default":
      return getDocFirestore(reference);
    case "cache":
      return getDocFromCache(reference);
    case "server":
      return getDocFromServer(reference);
  }
});

export function getDoc<T extends DocumentData>(
  reference: DocumentReference<T>,
  source: GetDocSource = "default"
) {
  return manager.run({ reference, source }) as Promise<DocumentSnapshot<T>>;
}

export function registerGetDocMiddleware(
  middleware: Parameters<(typeof manager)["use"]>[0]
) {
  manager.use(middleware);
}
