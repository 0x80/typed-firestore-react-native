import {
  getDocs as getDocsFirestore,
  getDocsFromCache,
  getDocsFromServer,
} from "@react-native-firebase/firestore";
import type { DocumentData, Query, QuerySnapshot } from "../firestore-types";
import { MiddlewareManager } from "./middleware-manager";

type GetDocsSource = "default" | "cache" | "server";

const manager = new MiddlewareManager<
  {
    query: Parameters<typeof getDocsFirestore<DocumentData>>[0];
    source: GetDocsSource;
  },
  ReturnType<typeof getDocsFirestore<DocumentData>>
>(({ query, source }) => {
  switch (source) {
    case "cache":
      return getDocsFromCache(query);
    case "server":
      return getDocsFromServer(query);
    case "default":
    default:
      return getDocsFirestore(query);
  }
});

export function getDocs<T extends DocumentData>(
  query: Query<T>,
  source: GetDocsSource = "default"
) {
  return manager.run({ query, source }) as Promise<QuerySnapshot<T>>;
}

export function experimental_registerGetDocsMiddleware(
  middleware: Parameters<(typeof manager)["use"]>[0]
) {
  manager.use(middleware);
}
