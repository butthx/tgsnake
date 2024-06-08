/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2024 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { Raw } from '../platform.deno.ts';
import { FilterContext, filter } from './Filters.ts';
import { TypeUpdate, ContextUpdate } from '../TL/Updates/index.ts';

export type MaybeArray<T> = T | T[];
export type MaybePromise<T> = T | Promise<T>;
export type NextFn = () => MaybePromise<void>;
export type MiddlewareFn<C> = (ctx: C, next: NextFn) => MaybePromise<any>;
export interface MiddlewareObj<C> {
  middleware: () => MiddlewareFn<C>;
}
export type ErrorHandler<T> = (
  error: Error,
  context: Combine<Combine<Combine<TypeUpdate, ContextUpdate>, Raw.TypeUpdate>, T>,
) => MaybePromise<any>;
export type Middleware<C> = MiddlewareFn<C> | MiddlewareObj<C>;
export type Combine<T, U> = T & Partial<U>;

function flatten<C>(mw: Middleware<C>): MiddlewareFn<C> {
  return typeof mw === 'function' ? mw : (ctx: C, next: NextFn) => mw.middleware()(ctx, next);
}
export function concat<C>(first: MiddlewareFn<C>, andThen: MiddlewareFn<C>) {
  return async (ctx: C, next: NextFn) => {
    let nextCalled = false;
    await first(ctx, async () => {
      if (nextCalled) throw new Error('`next` already called before!');
      else nextCalled = true;
      await andThen(ctx, next);
    });
  };
}
export function pass<C>(_ctx: C, next: NextFn) {
  return next();
}
export const leaf = () => Promise.resolve();
export function triggerFn(
  trigger: MaybeArray<string | RegExp>,
): Array<(content: string) => RegExpExecArray | string | null> {
  return toArray<string | RegExp>(trigger).map((t) =>
    typeof t === 'string' ? (txt) => (txt === t ? t : null) : (txt) => (t as RegExp).exec(txt),
  );
}
export function match<C>(
  content: string,
  triggers: Array<(content: string) => RegExpExecArray | string | null>,
) {
  const match: any[] = [];
  for (const t of triggers) {
    const res = t(content);
    if (res) {
      match.push(t);
    }
  }
  return Boolean(match.length);
}
export function toArray<T>(e: MaybeArray<T>): Array<T> {
  return Array.isArray(e) ? e : [e];
}
export async function run<C>(middleware: MiddlewareFn<C>, ctx: C) {
  await middleware(ctx, leaf);
}

/**
 * Composer is an event handler implemented by tgsnake.
 * Which is the grandfather of the 'Snake' class.
 * Composer has handlers such as 'command', 'hear', 'action' and many more.
 */
export class Composer<T = {}>
  implements
    MiddlewareObj<Combine<Combine<Combine<TypeUpdate, ContextUpdate>, Raw.TypeUpdates>, T>>
{
  /** @ignore */
  private handler!: MiddlewareFn<
    Combine<Combine<Combine<TypeUpdate, ContextUpdate>, Raw.TypeUpdates>, T>
  >;
  /** @ignore */
  context: Partial<T> = {};
  /**
   * The prefix that marks a text message is included in the command.
   */
  prefix = '.!/';
  constructor(
    ...middleware: Array<
      Middleware<Combine<Combine<Combine<TypeUpdate, ContextUpdate>, Raw.TypeUpdates>, T>>
    >
  ) {
    this.handler = middleware.length === 0 ? pass : middleware.map(flatten).reduce(concat);
  }
  /**
   * Running composer as a middleware.
   */
  middleware(): MiddlewareFn<
    Combine<Combine<Combine<TypeUpdate, ContextUpdate>, Raw.TypeUpdates>, T>
  > {
    return this.handler;
  }
  /**
   * Add a middleware function to the composer class.
   * @example
   * ```ts
   * bot.use((ctx,next) => {
   *   // do something
   *   return next()
   * })
   * ```
   */
  use(
    ...middleware: Array<
      Middleware<Combine<Combine<Combine<TypeUpdate, ContextUpdate>, Raw.TypeUpdates>, T>>
    >
  ): Composer<T> {
    const composer = new Composer(...middleware);
    this.handler = concat(this.handler, flatten(composer));
    return composer;
  }
  /**
   * Add event listener on event.
   * @example
   * ```ts
   * bot.on('msg.text',(ctx) => {
   *   // do something
   * })
   * ```
   */
  on<K extends keyof FilterContext>(
    filters: MaybeArray<K>,
    ...middleware: Array<Middleware<Combine<Combine<FilterContext[K], ContextUpdate>, T>>>
  ): Composer<T> {
    return this.filter<Combine<Combine<FilterContext[K], ContextUpdate>, T>>(
      (ctx) => filter(filters, ctx),
      ...middleware,
    );
  }
  filter<K>(
    predicate: (ctx: K) => MaybePromise<boolean>,
    ...middleware: Array<Middleware<K>>
  ): Composer<T>;
  filter(
    predicate: (
      ctx: Combine<Combine<Combine<TypeUpdate, ContextUpdate>, Raw.TypeUpdates>, T>,
    ) => MaybePromise<boolean>,
    ...middleware: Array<
      Middleware<Combine<Combine<Combine<TypeUpdate, ContextUpdate>, Raw.TypeUpdates>, T>>
    >
  ): Composer<T> {
    const composer = new Composer(...middleware);
    this.branch(predicate, composer, pass);
    return composer;
  }
  drop(
    predicate: (
      ctx: Combine<Combine<Combine<TypeUpdate, ContextUpdate>, Raw.TypeUpdates>, T>,
    ) => MaybePromise<boolean>,
    ...middleware: Array<
      Middleware<Combine<Combine<Combine<TypeUpdate, ContextUpdate>, Raw.TypeUpdates>, T>>
    >
  ): Composer<T> {
    return this.filter(async (ctx) => !(await predicate(ctx)), ...middleware);
  }
  fork(
    ...middleware: Array<
      Middleware<Combine<Combine<Combine<TypeUpdate, ContextUpdate>, Raw.TypeUpdates>, T>>
    >
  ): Composer<T> {
    const composer = new Composer(...middleware);
    const fork = flatten(composer);
    this.use((ctx, next) => Promise.all([next(), run(fork, ctx)]));
    return composer;
  }
  lazy(
    middlewareFactory: (
      ctx: Combine<Combine<Combine<TypeUpdate, ContextUpdate>, Raw.TypeUpdates>, T>,
    ) => MaybePromise<any>,
  ): Composer<T> {
    return this.use(async (context, next) => {
      const middleware = await middlewareFactory(context);
      const arr = toArray(middleware);
      await flatten(new Composer(...arr))(Object.assign(context, this.context), next);
    });
  }
  route<
    R extends Record<
      PropertyKey,
      Middleware<Combine<Combine<Combine<TypeUpdate, ContextUpdate>, Raw.TypeUpdates>, T>>
    >,
  >(
    router: (
      ctx: Combine<Combine<Combine<TypeUpdate, ContextUpdate>, Raw.TypeUpdates>, T>,
    ) => MaybePromise<string | undefined>,
    routeHandlers: R,
    fallback: Middleware<
      Combine<Combine<Combine<TypeUpdate, ContextUpdate>, Raw.TypeUpdates>, T>
    > = pass,
  ): Composer<T> {
    return this.lazy(async (ctx) => {
      let _a;
      const route = await router(ctx);
      return route === undefined
        ? []
        : (_a = routeHandlers[route]) !== null && _a !== void 0
          ? _a
          : fallback;
    });
  }
  branch(
    predicate: (
      ctx: Combine<Combine<Combine<TypeUpdate, ContextUpdate>, Raw.TypeUpdates>, T>,
    ) => MaybePromise<boolean>,
    trueMiddleware: Middleware<
      Combine<Combine<Combine<TypeUpdate, ContextUpdate>, Raw.TypeUpdates>, T>
    >,
    falseMiddleware: Middleware<
      Combine<Combine<Combine<TypeUpdate, ContextUpdate>, Raw.TypeUpdates>, T>
    >,
  ): Composer<T> {
    return this.lazy(async (ctx) => ((await predicate(ctx)) ? trueMiddleware : falseMiddleware));
  }
  /** @ignore */
  [Symbol.for('nodejs.util.inspect.custom')](): { [key: string]: any } {
    const toPrint: { [key: string]: any } = {
      _: this.constructor.name,
    };
    for (const key in this) {
      if (this.hasOwnProperty(key)) {
        const value = this[key];
        if (!key.startsWith('_')) {
          toPrint[key] = value;
        }
      }
    }
    return toPrint;
  }
  /** @ignore */
  toJSON(): { [key: string]: any } {
    const toPrint: { [key: string]: any } = {
      _: this.constructor.name,
    };
    for (const key in this) {
      if (this.hasOwnProperty(key)) {
        const value = this[key];
        if (!key.startsWith('_')) {
          toPrint[key] = typeof value === 'bigint' ? String(value) : value;
        }
      }
    }
    return toPrint;
  }
  /** @ignore */
  toString() {
    return `[constructor of ${this.constructor.name}] ${JSON.stringify(this, null, 2)}`;
  }
  /**
   * Listen any message text as a command.
   * This function is sensitive with new message text.
   * All text that begins with the specified prefix will be considered a command message.
   * @example
   * ```ts
   * bot.command('start',(ctx) => {
   *   ctx.message.reply('**Wohoho**',{
   *     parseMode : 'markdown'
   *   });
   * });
   * ```
   * @param trigger - text or regex which will be matched with incoming messages text.
   * @param middleware - the handler function when trigger is matched with incoming messages text.
   */
  command(
    trigger: MaybeArray<string | RegExp>,
    ...middleware: Array<Middleware<Combine<Combine<FilterContext['msg.text'], ContextUpdate>, T>>>
  ): Composer<T> {
    const key = toArray(trigger);
    const filterCmd = (ctx: Combine<Combine<FilterContext['msg.text'], ContextUpdate>, T>) => {
      const text = ctx.editedMessage ? ctx.editedMessage.text : ctx.message.text;
      const { _me } = ctx;
      const s = text.split(' ');
      const passed: RegExpExecArray[] = [];
      for (const cmd of key) {
        if (typeof cmd == 'string') {
          cmd as string;
          const r = new RegExp(
            `^[${this.prefix}](${cmd})${_me?.username ? `(@${_me?.username})?` : ``}$`,
            'i',
          );
          if (r.test(String(s[0]))) {
            passed.push(r.exec(String(s[0]))!);
          }
        }
        if (cmd instanceof RegExp) {
          cmd as RegExp;
          if (cmd.test(String(s[0]))) {
            passed.push(cmd.exec(String(s[0]))!);
          }
        }
      }
      ctx.match = passed;
      return Boolean(passed.length);
    };

    return this.on('msg.text').filter<
      Combine<Combine<FilterContext['msg.text'], ContextUpdate>, T>
    >(filterCmd, ...middleware);
  }
  /**
   * Listen any message text as a command.
   * This function is sensitive with new message text.
   * All text that begins with the specified prefix will be considered a command message.
   * @example
   * ```ts
   * bot.cmd('start',(ctx) => {
   *   ctx.message.reply('**Wohoho**',{
   *     parseMode : 'markdown'
   *   });
   * });
   * ```
   * @param trigger - text or regex which will be matched with incoming messages text.
   * @param middleware - the handler function when trigger is matched with incoming messages text.
   */
  cmd(
    trigger: MaybeArray<string | RegExp>,
    ...middleware: Array<Middleware<Combine<Combine<FilterContext['msg.text'], ContextUpdate>, T>>>
  ): Composer<T> {
    return this.command(trigger, ...middleware);
  }
  /**
   * Listen any new message text which is match with given filter.
   * For the trigger parameters, you can provide a regex as a filter for text messages.
   * @example
   * ```ts
   * // Any text with 'hello' inside will be responded.
   * bot.hears(/hello/, (ctx) => {
   *   ctx.message.reply('Wohoho')
   * })
   * ```
   * @param trigger - text or regex which will be matched with incoming messages text.
   * @param middleware - the handler function when trigger is matched with incoming messages text.
   */
  hears(
    trigger: MaybeArray<string | RegExp>,
    ...middleware: Array<Middleware<Combine<Combine<FilterContext['msg.text'], ContextUpdate>, T>>>
  ): Composer<T> {
    const tgr = triggerFn(trigger);
    return this.on('msg.text').filter(
      (ctx: Combine<FilterContext['msg.text'], ContextUpdate>) => {
        const text = ctx.editedMessage ? ctx.editedMessage.text : ctx.message.text;
        return match(String(text), tgr);
      },
      ...middleware,
    );
  }
  /**
   * Listen any new message text which is match with given filter.
   * For the trigger parameters, you can provide a regex as a filter for text messages.
   * @example
   * ```ts
   * // Any text with 'hello' inside will be responded.
   * bot.hear(/hello/, (ctx) => {
   *   ctx.message.reply('Wohoho')
   * })
   * ```
   * @param trigger - text or regex which will be matched with incoming messages text.
   * @param middleware - the handler function when trigger is matched with incoming messages text.
   */
  hear(
    trigger: MaybeArray<string | RegExp>,
    ...middleware: Array<Middleware<Combine<Combine<FilterContext['msg.text'], ContextUpdate>, T>>>
  ): Composer<T> {
    return this.hears(trigger, ...middleware);
  }
  /**
   * Listen any clicked inline keyboard (callback data) which is matched with given trigger.
   * @param trigger - text or regex which will be matched with callback data.
   * @param middleware - the handler function when trigger is matched with incoming messages text.
   * @example
   * ```ts
   * bot.action('hello', (ctx) => {
   *   // do something
   * })
   * ```
   */
  action(
    trigger: MaybeArray<string | RegExp>,
    ...middleware: Array<Middleware<Combine<Combine<FilterContext['cb.data'], ContextUpdate>, T>>>
  ): Composer<T> {
    const key = toArray(trigger);
    const filterCmd = (ctx: Combine<Combine<FilterContext['cb.data'], ContextUpdate>, T>) => {
      const { data } = ctx.callbackQuery;
      const passed: any[] = [];
      for (const cmd of key) {
        if (typeof cmd == 'string') {
          cmd as string;
          if (cmd == data) passed.push(cmd);
        }
        if (cmd instanceof RegExp) {
          cmd as RegExp;
          if (cmd.test(String(data))) passed.push(cmd);
        }
      }
      return Boolean(passed.length);
    };
    return this.on('cb.data').filter<Combine<Combine<FilterContext['cb.data'], ContextUpdate>, T>>(
      filterCmd,
      ...middleware,
    );
  }
  /**
   * Listen any query submitted by users. For example @botname <query>. <query> will be matched with the trigger.
   * @param trigger - text or regex which will be matched with query.
   * @param middleware - the handler function when trigger is matched with query.
   * @example
   * ```ts
   * bot.inlineQuery('some query', (ctx) => {
   *   // do something
   * })
   * ```
   */
  inlineQuery(
    trigger: MaybeArray<string | RegExp>,
    ...middleware: Array<
      Middleware<Combine<Combine<FilterContext['inlineQuery.from'], ContextUpdate>, T>>
    >
  ): Composer<T> {
    const key = toArray(trigger);
    const filterCmd = (
      ctx: Combine<Combine<FilterContext['inlineQuery.from'], ContextUpdate>, T>,
    ) => {
      const { query } = ctx.inlineQuery;
      const passed: any[] = [];
      for (const cmd of key) {
        if (typeof cmd == 'string') {
          cmd as string;
          if (cmd == query) passed.push(cmd);
        }
        if (cmd instanceof RegExp) {
          cmd as RegExp;
          if (cmd.test(String(query))) passed.push(cmd);
        }
      }
      return Boolean(passed.length);
    };
    return this.on('inlineQuery.from').filter<
      Combine<Combine<FilterContext['inlineQuery.from'], ContextUpdate>, T>
    >(filterCmd, ...middleware);
  }
}
