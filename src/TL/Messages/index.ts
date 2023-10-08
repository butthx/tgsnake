/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2023 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */

export * as Medias from './Medias/index.ts';
export * as ReplyMarkups from './ReplyMarkup.ts';
export { Message, type TypeMessage } from './Message.ts';
export {
  InlineQuery,
  ChosenInlineResult,
  type TypeInlineQuery,
  type TypeChosenInlineResult,
} from './inlineQuery.ts';
