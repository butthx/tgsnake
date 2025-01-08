/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2025 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { TLObject } from '../TL.ts';
import { Raw } from '../../platform.deno.ts';
import { User } from '../Advanced/User.ts';
import { Location } from './Medias/Venue.ts';
import { createInlineMsgId } from '../../Utilities.ts';
import type { Snake } from '../../Client/index.ts';

export interface TypeInlineQuery {
  id: string;
  query: string;
  offset: string;
  from?: User;
  chatType?: string;
  location?: Location;
}
export interface TypeChosenInlineResult {
  resultId: string;
  query: string;
  from?: User;
  location?: Location;
  inlineMessageId?: string;
}
// https://core.telegram.org/bots/api#inlinequery
export class InlineQuery extends TLObject {
  id!: string;
  query!: string;
  offset!: string;
  from?: User;
  chatType?: string;
  location?: Location;
  constructor({ id, from, query, offset, chatType, location }: TypeInlineQuery, client: Snake) {
    super(client);
    this.id = id;
    this.from = from;
    this.query = query;
    this.offset = offset;
    this.chatType = chatType;
    this.location = location;
  }
  static parse(
    client: Snake,
    update: Raw.UpdateBotInlineQuery,
    users: Array<Raw.TypeUser>,
  ): InlineQuery {
    return new InlineQuery(
      {
        id: String(update.queryId),
        query: update.query,
        offset: update.offset,
        location: update.geo ? Location.parse(client, update.geo) : undefined,
        chatType:
          update.peerType instanceof Raw.InlineQueryPeerTypeSameBotPM ||
          update.peerType instanceof Raw.InlineQueryPeerTypeBotPM
            ? 'sender'
            : update.peerType instanceof Raw.InlineQueryPeerTypePM
              ? 'private'
              : update.peerType instanceof Raw.InlineQueryPeerTypeChat
                ? 'group'
                : update.peerType instanceof Raw.InlineQueryPeerTypeMegagroup
                  ? 'supergroup'
                  : update.peerType instanceof Raw.InlineQueryPeerTypeBroadcast
                    ? 'channel'
                    : undefined,
        from: User.parse(
          client,
          users.find((user) => user.id === update.userId),
        ),
      },
      client,
    );
  }
}
// https://core.telegram.org/bots/api#choseninlineresult
export class ChosenInlineResult extends TLObject {
  resultId!: string;
  query!: string;
  from?: User;
  location?: Location;
  inlineMessageId?: string;
  constructor(
    { resultId, query, from, location, inlineMessageId }: TypeChosenInlineResult,
    client: Snake,
  ) {
    super(client);
    this.resultId = resultId;
    this.query = query;
    this.from = from;
    this.location = location;
    this.inlineMessageId = inlineMessageId;
  }
  static parse(
    client: Snake,
    update: Raw.UpdateBotInlineSend,
    users: Array<Raw.TypeUser>,
  ): ChosenInlineResult {
    return new ChosenInlineResult(
      {
        resultId: update.id,
        query: update.query,
        location: update.geo ? Location.parse(client, update.geo) : undefined,
        inlineMessageId: update.msgId ? createInlineMsgId(update.msgId) : undefined,
        from: User.parse(
          client,
          users.find((user) => user.id === update.userId),
        ),
      },
      client,
    );
  }
}
