import { getCountFromServer } from "@react-native-firebase/firestore";
import type { Query } from "../firestore-types";
import { MiddlewareManager } from "./middleware-manager";

const manager = new MiddlewareManager<
  { query: Parameters<typeof getCountFromServer>[0] },
  ReturnType<typeof getCountFromServer>
>(({ query }) => {
  return getCountFromServer(query);
});

export function getCount(query: Query) {
  return manager.run({ query });
}

export function experimental_registerGetCountMiddleware(
  middleware: Parameters<(typeof manager)["use"]>[0]
) {
  manager.use(middleware);
}
