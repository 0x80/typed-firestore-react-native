import { updateDoc as updateDocFirestore } from "@react-native-firebase/firestore";
import type {
  DocumentData,
  DocumentReference,
  UpdateData,
} from "../firestore-types";
import { MiddlewareManager } from "./middleware-manager";

const manager = new MiddlewareManager<
  {
    reference: Parameters<typeof updateDocFirestore>[0];
    data: UpdateData<DocumentData>;
  },
  ReturnType<typeof updateDocFirestore>
>(({ reference, data }) => {
  return updateDocFirestore(reference, data);
});

export function updateDoc<T extends DocumentData>(
  reference: DocumentReference<T>,
  data: UpdateData<T>
) {
  return manager.run({ reference, data });
}

export function experimental_registerUpdateDocMiddleware(
  middleware: Parameters<(typeof manager)["use"]>[0]
) {
  manager.use(middleware);
}
