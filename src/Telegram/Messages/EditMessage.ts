// Tgsnake - Telegram MTProto framework developed based on gram.js.
// Copyright (C) 2021 Butthx <https://guthub.com/butthx>
//
// This file is part of Tgsnake
//
// Tgsnake is a free software : you can redistribute it and/or modify
//  it under the terms of the MIT License as published.

import { Api } from 'telegram';
import { Snake } from '../../client';
import { TypeReplyMarkup, BuildReplyMarkup } from '../../Utils/ReplyMarkup';
import { Entities, ParseEntities } from '../../Utils/Entities';
import { _parseMessageText } from 'telegram/client/messageParse';
import BigInt from 'big-integer';
import * as Update from '../../Update';
export interface editMessageMoreParams {
  noWebpage?: boolean;
  media?: Api.TypeInputMedia;
  replyMarkup?: TypeReplyMarkup;
  entities?: Entities[];
  scheduleDate?: number;
  parseMode?: string;
}
export async function EditMessage(
  snakeClient: Snake,
  chatId: number | string,
  messageId: number,
  text: string,
  more?: editMessageMoreParams
) {
  try {
    let parseMode = '';
    let replyMarkup;
    if (more) {
      if (more.parseMode) {
        parseMode = more.parseMode.toLowerCase();
        delete more.parseMode;
      }
    }
    let [parseText, entities] = await _parseMessageText(snakeClient.client, text, parseMode);
    if (more) {
      if (more.entities) {
        entities = await ParseEntities(more.entities);
        parseText = text;
      }
      if (more.replyMarkup) {
        replyMarkup = BuildReplyMarkup(more.replyMarkup!);
        delete more.replyMarkup;
      }
    }
    let results: Api.TypeUpdates = await snakeClient.client.invoke(
      new Api.messages.EditMessage({
        peer: chatId,
        id: messageId,
        message: parseText,
        //@ts-ignore
        entities: entities,
        replyMarkup: replyMarkup,
        ...more,
      })
    );
    return await createResults(results, snakeClient);
  } catch (error) {
    return snakeClient._handleError(
      error,
      `telegram.editMessage(${chatId},${messageId},${text},${
        more ? JSON.stringify(more, null, 2) : ''
      })`
    );
  }
}
async function createResults(results: Api.TypeUpdates, snakeClient: Snake) {
  if (results instanceof Api.Updates) {
    results as Api.Updates;
    if (results.updates?.length > 0) {
      for (let i = 0; i < results.updates.length; i++) {
        if (results.updates[i] instanceof Api.UpdateEditChannelMessage) {
          let arc = results.updates[i] as Api.UpdateEditChannelMessage;
          //todo
          //using UpdateEditChannelMessage
          return arc;
        }
        //todo
        // using UpdateEditMessage
        if (results.updates[i] instanceof Api.UpdateEditMessage) {
          let arc = results.updates[i] as Api.UpdateEditMessage;
          return arc;
        }
      }
    }
  }
}
