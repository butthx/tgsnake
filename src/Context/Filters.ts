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
import type { TypeUpdate, CallbackQuery } from '../TL/Updates/index.ts';
import type {
  Message,
  InlineQuery,
  ChosenInlineResult,
  ShippingQuery,
} from '../TL/Messages/index.ts';

export type TypeUpdateExtended<T, P extends keyof T> = TypeUpdate & {
  message?: FilterQuery<T, P>;
  channelPost?: FilterQuery<T, P>;
  inlineQuery?: FilterQuery<T, P>;
  chosenInlineResult?: FilterQuery<T, P>;
  callbackQuery?: FilterQuery<T, P>;
  shippingQuery?: FilterQuery<T, P>;
  editedMessage?: FilterQuery<T, P>;
  editedChannelPost?: FilterQuery<T, P>;
};
export interface FilterRawTypeUpdatesContext {
  UpdatesTooLong?: Raw.UpdatesTooLong;
  UpdateShortMessage?: Raw.UpdateShortMessage;
  UpdateShortChatMessage?: Raw.UpdateShortChatMessage;
  UpdateShort?: Raw.UpdateShort;
  UpdatesCombined?: Raw.UpdatesCombined;
  Updates?: Raw.Updates;
  UpdateShortSentMessage?: Raw.UpdateShortSentMessage;
}
export interface FilterContext extends FilterRawTypeUpdatesContext {
  any: TypeUpdate | Raw.TypeUpdates;
  message?: FilterQuery<TypeUpdate, 'message'>;
  editedMessage?: FilterQuery<TypeUpdate, 'editedMessage'>;
  channelPost?: FilterQuery<TypeUpdate, 'channelPost'>;
  editedChannelPost?: FilterQuery<TypeUpdate, 'editedChannelPost'>;
  inlineQuery?: FilterQuery<TypeUpdate, 'inlineQuery'>;
  chosenInlineResult?: FilterQuery<TypeUpdate, 'chosenInlineResult'>;
  callbackQuery?: FilterQuery<TypeUpdate, 'callbackQuery'>;
  shippingQuery?: FilterQuery<TypeUpdate, 'shippingQuery'>;
  preCheckoutQuery?: FilterQuery<TypeUpdate, 'preCheckoutQuery'>;
  poll?: FilterQuery<TypeUpdate, 'poll'>;
  pollAnswer?: FilterQuery<TypeUpdate, 'pollAnswer'>;
  chatJoinRequest?: FilterQuery<TypeUpdate, 'chatJoinRequest'>;
  myChatMember?: FilterQuery<TypeUpdate, 'myChatMember'>;
  chatMember?: FilterQuery<TypeUpdate, 'chatMember'>;
  secretChat?: FilterQuery<TypeUpdate, 'secretChat'>;
  /* shorthand */
  'msg.text'?: FilterQuery<TypeUpdateExtended<Message, 'text'>, 'message'>;
  'msg.caption'?: FilterQuery<TypeUpdateExtended<Message, 'caption'>, 'message'>;
  'msg.chat'?: FilterQuery<TypeUpdateExtended<Message, 'chat'>, 'message'>;
  'msg.from'?: FilterQuery<TypeUpdateExtended<Message, 'from'>, 'message'>;
  'msg.animation'?: FilterQuery<TypeUpdateExtended<Message, 'animation'>, 'message'>;
  'msg.audio'?: FilterQuery<TypeUpdateExtended<Message, 'audio'>, 'message'>;
  'msg.document'?: FilterQuery<TypeUpdateExtended<Message, 'document'>, 'message'>;
  'msg.photo'?: FilterQuery<TypeUpdateExtended<Message, 'photo'>, 'message'>;
  'msg.sticker'?: FilterQuery<TypeUpdateExtended<Message, 'sticker'>, 'message'>;
  'msg.video'?: FilterQuery<TypeUpdateExtended<Message, 'video'>, 'message'>;
  'msg.videoNote'?: FilterQuery<TypeUpdateExtended<Message, 'videoNote'>, 'message'>;
  'msg.voice'?: FilterQuery<TypeUpdateExtended<Message, 'voice'>, 'message'>;
  'msg.webpage'?: FilterQuery<TypeUpdateExtended<Message, 'webpage'>, 'message'>;
  'msg.replyToMessage'?: FilterQuery<TypeUpdateExtended<Message, 'replyToMessage'>, 'message'>;
  'msg.replyToMessageId'?: FilterQuery<TypeUpdateExtended<Message, 'replyToMessageId'>, 'message'>;
  'msg.replyToTopMessageId'?: FilterQuery<
    TypeUpdateExtended<Message, 'replyToTopMessageId'>,
    'message'
  >;
  'msg.newChatMembers'?: FilterQuery<TypeUpdateExtended<Message, 'newChatMembers'>, 'message'>;
  'msg.leftChatMember'?: FilterQuery<TypeUpdateExtended<Message, 'leftChatMember'>, 'message'>;
  'msg.pinnedMessage'?: FilterQuery<TypeUpdateExtended<Message, 'pinnedMessage'>, 'message'>;
  'cb.data'?: FilterQuery<TypeUpdateExtended<CallbackQuery, 'data'>, 'callbackQuery'>;
  'cb.message'?: FilterQuery<TypeUpdateExtended<CallbackQuery, 'message'>, 'callbackQuery'>;
  'editMsg.text'?: FilterQuery<TypeUpdateExtended<Message, 'text'>, 'editedMessage'>;
  'editMsg.caption'?: FilterQuery<TypeUpdateExtended<Message, 'caption'>, 'editedMessage'>;
  'editPost.text'?: FilterQuery<TypeUpdateExtended<Message, 'text'>, 'editedChannelPost'>;
  'editPost.caption'?: FilterQuery<TypeUpdateExtended<Message, 'caption'>, 'editedChannelPost'>;
  'inlineQuery.from'?: FilterQuery<TypeUpdateExtended<InlineQuery, 'from'>, 'inlineQuery'>;
  'inlineQuery.location'?: FilterQuery<TypeUpdateExtended<InlineQuery, 'location'>, 'inlineQuery'>;
  'inlineQuery.chatType'?: FilterQuery<TypeUpdateExtended<InlineQuery, 'chatType'>, 'inlineQuery'>;
  'chosenInlineResult.from'?: FilterQuery<
    TypeUpdateExtended<ChosenInlineResult, 'from'>,
    'chosenInlineResult'
  >;
  'chosenInlineResult.location'?: FilterQuery<
    TypeUpdateExtended<ChosenInlineResult, 'location'>,
    'chosenInlineResult'
  >;
  'chosenInlineResult.inlineMessageId'?: FilterQuery<
    TypeUpdateExtended<ChosenInlineResult, 'inlineMessageId'>,
    'chosenInlineResult'
  >;
  'shippingQuery.from'?: FilterQuery<TypeUpdateExtended<ShippingQuery, 'from'>, 'shippingQuery'>;
}
export type FilterQuery<T, P extends keyof T> = T & {
  [K in P]-?: T[K];
};
export function filter(key: string | string[], ctx: TypeUpdate | Raw.TypeUpdates) {
  const aliases = {
    cb: 'callbackQuery',
    msg: 'message',
    editMsg: 'editedMessage',
    editPost: 'editedChannelPost',
  };
  if (Array.isArray(key)) {
    for (const k of key) {
      if (k === 'any' || ctx[k] || ('className' in ctx && k === ctx.className)) return true;
      let sk = k.split('.');
      if (sk.length) {
        if (ctx[aliases[sk[0]]] && ctx[aliases[sk[0]]][sk[1]] !== undefined) {
          return true;
        }
      }
    }
  } else {
    if (key === 'any' || ctx[key] || ('className' in ctx && key === ctx.className)) return true;
    let sk = key.split('.');
    if (sk.length) {
      if (ctx[aliases[sk[0]]] && ctx[aliases[sk[0]]][sk[1]] !== undefined) {
        return true;
      }
    }
  }
  return false;
}
