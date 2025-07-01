import { deleteDoc as deleteDocFirestore } from "@react-native-firebase/firestore";
import type { DocumentData, DocumentReference } from "../firestore-types";
import { MiddlewareManager } from "./middleware-manager";

const manager = new MiddlewareManager<
  { reference: Parameters<typeof deleteDocFirestore>[0] },
  ReturnType<typeof deleteDocFirestore>
>(({ reference }) => {
  return deleteDocFirestore(reference);
});

export function deleteDoc<T extends DocumentData>(
  reference: DocumentReference<T>
) {
  return manager.run({ reference });
}

export function experimental_registerDeleteDocMiddleware(
  middleware: Parameters<(typeof manager)["use"]>[0]
) {
  manager.use(middleware);
}
