/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2025 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */

import type { Raw } from '../platform.deno.ts';
import { type MiddlewareFn, type Combine, type NextFn } from '../Context/Composer.ts';
import { FilterContext, filter as filterUpdate } from '../Context/Filters.ts';
import { TypeUpdate, ContextUpdate } from '../TL/Updates/index.ts';

export type ConversationWaitFilterFn<T> = (context: T) => boolean;
/**
 * Conversation.
 * This class is useful for waiting for the latest updates from chat.
 * Like a conversation the client will waiting another user to response the current discussion.
 * A: send hello.
 * A: waiting B to send hi.
 * B: send hi.
 * A: process hi from B.
 */
export class Conversation<T> {
  protected handler!: MiddlewareFn<
    Combine<Combine<Combine<TypeUpdate, ContextUpdate>, Raw.TypeUpdates>, T>
  >;
  constructor() {
    this.handler = (_, next) => next();
  }
  middleware(
    context: Combine<Combine<Combine<TypeUpdate, ContextUpdate>, Raw.TypeUpdates>, T>,
    next: NextFn,
  ) {
    return this.handler(context, next);
  }
  /**
   * Wait function.
   * This function will be return promise and waiting new update from current chat.
   * If new update is equal with filters, it will be resolve the promise.
   * @param { string } key - Expected update.
   * @param { ConversationWaitFilterFn | undefined } filter - Function to filter updates, the filter function must be synchronous and return a boolean. If expected it must be return true, otherwise return false.
   * @example
   * ```ts
   * const conversation = await client.conversation.create(chatId)
   * await conversation.wait('msg.text') // without filter
   * await conversation.wait('msg.text', (update) => {
   *   if(/^\/cancel/.test(update.message.text)){
   *     client.conversation.remove(chatId)
   *   }
   *   return true
   * })
   * ```
   */
  wait<K extends keyof FilterContext>(
    key: K,
    filter: ConversationWaitFilterFn<Combine<Combine<FilterContext[K], ContextUpdate>, T>> = (
      context: Combine<Combine<FilterContext[K], ContextUpdate>, T>,
    ) => {
      context; // for ignore 'context' is declared but its value is never read.
      return true;
    },
  ) {
    const job = new ConversationJob<Combine<Combine<FilterContext[K], ContextUpdate>, T>>();
    const middleware: MiddlewareFn<
      Combine<Combine<Combine<TypeUpdate, ContextUpdate>, Raw.TypeUpdates>, T>
    > = (context, next) => {
      if (!job.resolved) {
        if (
          filterUpdate(key, context) &&
          filter(context as unknown as Combine<Combine<FilterContext[K], ContextUpdate>, T>)
        ) {
          job.resolve(context as unknown as Combine<Combine<FilterContext[K], ContextUpdate>, T>);
          return this.end();
        }
      }
      return next();
    };
    this.handler = middleware;
    return job.promise;
  }
  /**
   * End function.
   * This function will be reset conversation handler to default, which will not listen to updates in the current chat.
   * By default this function is always called when 'wait' function is resolved, so you no need to call this function.
   * To end the conversation better you resolve the 'wait' function and call the 'client.conversation.remove' function.
   */
  end() {
    this.handler = (_, next) => next();
  }
}

export class ConversationJob<T> {
  resolve!: (result: T) => void;
  reject!: (error: any) => void;
  promise!: Promise<T>;
  resolved?: boolean;
  constructor() {
    this.promise = new Promise<T>((res, rej) => {
      this.resolve = (results: T) => {
        this.resolved = true;
        res(results);
      };
      this.reject = (error: any) => {
        this.resolved = true;
        rej(error);
      };
    });
  }
}
