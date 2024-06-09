/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2024 butthx <https://github.com/butthx>
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
        // @ts-ignore
        if (filterUpdate(key, context) && filter(context)) {
          job.resolve(context);
          return this.end();
        }
      }
      return next();
    };
    this.handler = middleware;
    return job.promise;
  }
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
