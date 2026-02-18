import { vi } from "vitest";

// Mock Firebase Firestore
vi.mock("@react-native-firebase/firestore", () => {
  const queryConstraintMock = {
    _apply: vi.fn(),
  };

  const createQueryConstraint = () => ({
    ...queryConstraintMock,
  });

  return {
    default: () => ({
      collection: vi.fn(),
    }),
    collection: vi.fn(),
    query: vi.fn(),
    limit: vi.fn().mockReturnValue(createQueryConstraint()),
    where: vi.fn().mockReturnValue(createQueryConstraint()),
    orderBy: vi.fn().mockReturnValue(createQueryConstraint()),
    onSnapshot: vi.fn(),
    deleteDoc: vi.fn().mockResolvedValue(undefined),
    updateDoc: vi.fn().mockResolvedValue(undefined),
  };
});
