/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2024 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { TLObject } from '../TL.ts';
import { Raw } from '../../platform.deno.ts';
import { Message } from '../Messages/Message.ts';
import { User } from '../Advanced/User.ts';
import { getPeerId, createInlineMsgId } from '../../Utilities.ts';
import type { Snake } from '../../Client/index.ts';

export class CallbackQuery extends TLObject {
  id!: bigint;
  from?: User;
  message?: Message;
  data?: string;
  chatInstance?: bigint;
  inlineMessageId?: string;
  gameShortName?: string;
  constructor(
    {
      id,
      from,
      message,
      data,
      chatInstance,
      inlineMessageId,
      gameShortName,
    }: {
      id: bigint;
      from?: User;
      message?: Message;
      data?: string;
      chatInstance?: bigint;
      inlineMessageId?: string;
      gameShortName?: string;
    },
    client: Snake,
  ) {
    super(client);
    this.id = id;
    this.from = from;
    this.message = message;
    this.data = data;
    this.chatInstance = chatInstance;
    this.inlineMessageId = inlineMessageId;
    this.gameShortName = gameShortName;
  }
  static async parse(
    client: Snake,
    update: Raw.UpdateBotCallbackQuery | Raw.UpdateInlineBotCallbackQuery,
    chats: Array<Raw.TypeChat>,
    users: Array<Raw.TypeUser>,
  ): Promise<CallbackQuery> {
    if (update instanceof Raw.UpdateInlineBotCallbackQuery) {
      return CallbackQuery.parseInline(
        client,
        update as Raw.UpdateInlineBotCallbackQuery,
        chats,
        users,
      );
    }
    return CallbackQuery.parseBot(client, update as Raw.UpdateBotCallbackQuery, chats, users);
  }
  static async parseBot(
    client: Snake,
    update: Raw.UpdateBotCallbackQuery,
    _: Array<Raw.TypeChat>,
    users: Array<Raw.TypeUser>,
  ) {
    const chatId = getPeerId(update.peer);
    const cb = new CallbackQuery(
      {
        id: update.queryId,
        chatInstance: update.chatInstance,
        gameShortName: update.gameShortName,
        data: update.data ? update.data.toString('utf8') : undefined,
        from: await User.parse(
          client,
          users.find((user) => user.id === update.userId),
        ),
      },
      client,
    );
    const cchat = client._cacheMessage.get(chatId!);
    if (cchat) {
      const cmsg = cchat.get(update.msgId);
      if (cmsg) {
        cb.message = cmsg;
      } else {
        try {
          let fmsg = await client.api.getMessages(chatId!, [update.msgId]);
          cb.message = fmsg[0];
        } catch (error) {}
      }
    } else {
      try {
        let fmsg = await client.api.getMessages(chatId!, [update.msgId]);
        cb.message = fmsg[0];
      } catch (error) {}
    }
    return cb;
  }
  static async parseInline(
    client: Snake,
    update: Raw.UpdateInlineBotCallbackQuery,
    _: Array<Raw.TypeChat>,
    users: Array<Raw.TypeUser>,
  ) {
    return new CallbackQuery(
      {
        id: update.queryId,
        chatInstance: update.chatInstance,
        gameShortName: update.gameShortName,
        data: update.data ? update.data.toString('utf8') : undefined,
        inlineMessageId: createInlineMsgId(update.msgId),
        from: await User.parse(
          client,
          users.find((user) => user.id === update.userId),
        ),
      },
      client,
    );
  }
}
