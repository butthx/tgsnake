// Tgsnake - Telegram MTProto framework developed based on gram.js.
// Copyright (C) 2022 Butthx <https://github.com/butthx>
//
// This file is part of Tgsnake
//
// Tgsnake is a free software : you can redistribute it and/or modify
//  it under the terms of the MIT License as published.

import { Api } from 'telegram';
import { From } from '../Utils/From';
import { Update } from './Update';
import { Telegram } from '../Telegram';
import { Snake } from '../Client';
import { BigInteger } from 'big-integer';
import { MessageContext } from '../Context/MessageContext';
import Util from 'tg-file-id/dist/Util';
import { toString } from '../Utils/ToBigInt';
export class UpdateInlineBotCallbackQuery extends Update {
  id!: bigint;
  data?: string;
  message?: MessageContext;
  from!: From;
  chatInstance!: bigint;
  inlineMessageId?: string;
  gameShortName?: string;
  constructor() {
    super();
    this['_'] = 'updateInlineBotCallbackQuery';
  }
  async init(update: Api.UpdateInlineBotCallbackQuery, SnakeClient: Snake) {
    let mode = ['debug', 'info'];
    if (mode.includes(SnakeClient.logger)) {
      SnakeClient.log(
        `[${SnakeClient.connectTime}] - [${new Date().toLocaleString()}] - Creating update ${
          this['_']
        }`
      );
    }
    this.telegram = SnakeClient.telegram;
    this.data = update.data?.toString('utf8');
    this.id = BigInt(toString(update.queryId!) as string);
    this.gameShortName = update.gameShortName;
    this.chatInstance = BigInt(toString(update.chatInstance) as string);
    this.inlineMessageId = '';
    this.inlineMessageId += Util.to32bitBuffer(update.msgId.dcId);
    let id = BigInt(String(update.msgId.id));
    let accessHash = BigInt(String(update.msgId.accessHash));
    //accessHash
    if (accessHash < BigInt(0)) {
      this.inlineMessageId += Util.to64bitBuffer(accessHash * BigInt(-1));
    } else {
      this.inlineMessageId += Util.to64bitBuffer(accessHash);
    }
    //id
    if (id < BigInt(0)) {
      this.inlineMessageId += Util.to64bitBuffer(id * BigInt(-1));
    } else {
      this.inlineMessageId += Util.to64bitBuffer(id);
    }
    this.inlineMessageId = Util.base64UrlEncode(Util.rleEncode(this.inlineMessageId));
    this.from = new From();
    await this.from.init(BigInt(toString(update.userId) as string), SnakeClient);
    return this;
  }
}
