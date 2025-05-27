import {
  getDocs as getDocsFirestore,
  getDocsFromCache,
  getDocsFromServer,
} from "@react-native-firebase/firestore";
import type { DocumentData, Query, QuerySnapshot } from "../firestore-types";
import { MiddlewareManager } from "./middleware-manager";

type GetDocsSource = "default" | "cache" | "server";

const manager = new MiddlewareManager<
  { query: Parameters<typeof getDocsFirestore>[0]; source: GetDocsSource },
  ReturnType<typeof getDocsFirestore>
>(({ query, source }) => {
  switch (source) {
    case "default":
      return getDocsFirestore(query);
    case "cache":
      return getDocsFromCache(query);
    case "server":
      return getDocsFromServer(query);
  }
});

export function getDocs<T extends DocumentData>(
  query: Query<T>,
  source: GetDocsSource = "default"
) {
  return manager.run({ query, source }) as Promise<QuerySnapshot<T>>;
}

export function registerGetDocsMiddleware(
  middleware: Parameters<(typeof manager)["use"]>[0]
) {
  manager.use(middleware);
}
