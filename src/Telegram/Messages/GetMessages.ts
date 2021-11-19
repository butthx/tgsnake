// Tgsnake - Telegram MTProto framework developed based on gram.js.
// Copyright (C) 2021 Butthx <https://github.com/butthx>
//
// This file is part of Tgsnake
//
// Tgsnake is a free software : you can redistribute it and/or modify
//  it under the terms of the MIT License as published.
import { Api } from 'telegram';
import { Snake } from '../../client';
import BigInt from 'big-integer';
import { MessageContext } from '../../Context/MessageContext';
import * as Update from '../../Update';
import { toBigInt, toNumber } from '../../Utils/ToBigInt';
export async function GetMessages(
  snakeClient: Snake,
  chatId: number | string,
  messageId: number[],
  replies: boolean = false
) {
  try {
    let messageIds: any = messageId;
    let [id, type, peer] = await toBigInt(chatId, snakeClient);
    if (type == 'channel') {
      let results: Api.messages.TypeMessages = await snakeClient.client.invoke(
        new Api.channels.GetMessages({
          channel: peer,
          id: messageIds,
        })
      );
      let final: ResultsGetMessage = new ResultsGetMessage();
      await final.init(results, snakeClient, replies);
      return final;
    } else {
      let results: Api.messages.TypeMessages = await snakeClient.client.invoke(
        new Api.messages.GetMessages({
          id: messageIds,
        })
      );
      let final: ResultsGetMessage = new ResultsGetMessage();
      await final.init(results, snakeClient, replies);
      return final;
    }
  } catch (error) {
    return snakeClient._handleError(
      error,
      `telegram.getMessages(${chatId},${JSON.stringify(messageId)})`
    );
  }
}
export class ResultsGetMessage {
  messages!: MessageContext[];
  date: number | Date = Math.floor(Date.now() / 1000);
  constructor() {}
  async init(results: Api.messages.TypeMessages, SnakeClient: Snake, replies: boolean = false) {
    let tempMessages: MessageContext[] = [];
    if (results instanceof Api.messages.ChannelMessages) {
      for (let i = 0; i < results.messages.length; i++) {
        let msg = results.messages[i] as Api.Message;
        if (!replies) {
          delete msg.replyTo;
        }
        let msgc = new MessageContext();
        await msgc.init(msg, SnakeClient);
        tempMessages.push(msgc);
      }
    }
    if (results instanceof Api.messages.Messages) {
      for (let i = 0; i < results.messages.length; i++) {
        let msg = results.messages[i] as Api.Message;
        if (!replies) {
          delete msg.replyTo;
        }
        let msgc = new MessageContext();
        await msgc.init(msg, SnakeClient);
        tempMessages.push(msgc);
      }
    }
    this.messages = tempMessages;
    return this;
  }
}
