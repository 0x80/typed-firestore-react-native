import { createElement, type FunctionComponent } from "react";
// @ts-expect-error -- no type declarations available
import { act, create } from "react-test-renderer";

/**
 * Minimal renderHook built directly on react-test-renderer, replacing the
 * deprecated @testing-library/react-hooks package.
 */
export function renderHook<T>(hookFn: () => T): { result: { current: T } } {
  const result = { current: undefined as T };

  const TestComponent: FunctionComponent = () => {
    result.current = hookFn();
    return null;
  };

  act(() => {
    create(createElement(TestComponent));
  });

  return {
    result,
  };
}
