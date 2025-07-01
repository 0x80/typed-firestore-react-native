export type Next<T, R> = (ctx: T) => R;
export type Middleware<T, R> = (ctx: T, next: Next<T, R>) => R;
export type Handler<T, R> = (ctx: T) => R;

export class MiddlewareManager<T, R> {
  private handler: Handler<T, R>;
  private middlewares: Middleware<T, R>[] = [];

  constructor(handler: Handler<T, R>) {
    this.handler = handler;
  }

  use(middleware: Middleware<T, R>): this {
    this.middlewares.push(middleware);
    return this;
  }

  run(initialCtx: T): R {
    const dispatch = (i: number, ctx: T): R => {
      if (i >= this.middlewares.length) {
        return this.handler(ctx);
      }
      const middleware = this.middlewares[i]!;
      return middleware(ctx, (newCtx) => dispatch(i + 1, newCtx));
    };

    return dispatch(0, initialCtx);
  }
}
