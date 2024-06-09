/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2024 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { Conversation } from './conversation.ts';
import type { Raw } from '../platform.deno.ts';
import type { Combine, NextFn } from '../Context/Composer.ts';
import { type TypeUpdate, type ContextUpdate, Update } from '../TL/Updates/index.ts';
/**
 * Conversation Manager.
 * This class uses for handle conversation as middleware.
 * This class uses for creating, removing, and listening any updates.
 * This class only work with parsed update (bot api like).
 */
export class ConversationManager<T> {
  protected conversation!: Map<bigint, Conversation<T>>;
  constructor() {
    this.conversation = new Map<bigint, Conversation<T>>();
  }
  /**
   * Middleware function.
   * This function uses to listen any updates and call conversation when the chat has active conversation.
   */
  middleware() {
    return (
      context: Combine<Combine<Combine<TypeUpdate, ContextUpdate>, Raw.TypeUpdates>, T>,
      next: NextFn,
    ) => {
      if (context instanceof Update) {
        const peer = ConversationManager.getPeerId(context);
        if (peer) {
          const conversation = this.conversation.get(peer);
          if (conversation) {
            return conversation.middleware(context, next);
          }
        }
      }
      return next();
    };
  }
  /**
   * Creating conversation function.
   * This function is uses for creating conversation in given peer (chat id).
   * This function will be return conversation class which is can waiting any response.
   * Note: Only valid with parsed update (bot api like).
   * @param {bigint} peer - Chat Id.
   * @return {Conversation}
   */
  create(peer: bigint): Conversation<T> {
    const conversation = new Conversation<T>();
    this.conversation.set(peer, conversation);
    return conversation;
  }
  /**
   * Remove function.
   * This function is uses for removing any conversation in given peer (chat id).
   * This function will be return true if the chat have the active conversation and will be return false if the chat haven't the active conversation.
   * @param {bigint} peer - Chat Id.
   * @return {boolean}
   */
  remove(peer: bigint): boolean {
    return this.conversation.delete(peer);
  }
  /**
   * Get peer id function.
   * This function uses for getting the peer id (chat id) from any updates. (currently only work with parsed update)
   * @param {Update} update - Update.
   * @return {bigint | undefined}
   */
  static getPeerId(update: Update): bigint | undefined {
    for (const entries of Object.values(update)) {
      if (entries && typeof entries === 'object') {
        if (entries.chat && entries.chat.id) {
          return entries.chat.id;
        }
        if (
          entries.message &&
          typeof entries.message === 'object' &&
          entries.message.chat &&
          entries.message.chat.id
        ) {
          return entries.message.chat.id;
        }
      }
    }
  }
}
