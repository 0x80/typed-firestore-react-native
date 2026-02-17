import { renderHook } from "@testing-library/react-hooks";
import firestore, { collection, where, orderBy, limit } from "@react-native-firebase/firestore";
import { useCollection } from "../use-collection";
import type { CollectionReference } from "../firestore-types";
import { describe, it, expect } from "vitest";

// Define a sample document type
type TodoItem = {
  id: string;
  title: string;
  completed: boolean;
  priority: number;
  dueDate: Date;
};

describe("useCollection", () => {
  it("should have correct type inference", () => {
    // This test is mainly for TypeScript type checking
    const collectionRef = collection(firestore(), "todos") as CollectionReference<TodoItem>;

    // The actual test is that this compiles without type errors
    const { result } = renderHook(() => useCollection(collectionRef));

    // TypeScript should infer this as: [FsMutableDocument<TodoItem>[], false] | [undefined, true]
    const [docs, loading] = result.current;

    if (!loading) {
      // When not loading, docs should be FsMutableDocument<TodoItem>[]
      const firstDoc = docs[0];
      if (firstDoc) {
        const _title: string = firstDoc.data.title; // Should compile
        const _completed: boolean = firstDoc.data.completed; // Should compile
        expect(typeof _title).toBe("string");
        expect(typeof _completed).toBe("boolean");
      }
    }
  });

  it("should work with query constraints", () => {
    const collectionRef = collection(firestore(), "todos") as CollectionReference<TodoItem>;

    // The actual test is that this compiles without type errors
    const { result } = renderHook(() =>
      useCollection(
        collectionRef,
        where("completed", "==", false),
        where("priority", ">", 1),
        orderBy("dueDate", "asc"),
        limit(10),
      ),
    );

    // TypeScript should infer this as: [FsMutableDocument<TodoItem>[], false] | [undefined, true]
    const [docs, loading] = result.current;

    if (!loading) {
      // When not loading, docs should be FsMutableDocument<TodoItem>[]
      const firstDoc = docs[0];
      if (firstDoc) {
        // Verify type inference for all fields
        const _title: string = firstDoc.data.title;
        const _completed: boolean = firstDoc.data.completed;
        const _priority: number = firstDoc.data.priority;
        const _dueDate: Date = firstDoc.data.dueDate;

        // Type checks
        expect(typeof _title).toBe("string");
        expect(typeof _completed).toBe("boolean");
        expect(typeof _priority).toBe("number");
        expect(_dueDate).toBeInstanceOf(Date);
      }
    }
  });
});
