// Tgsnake - Telegram MTProto framework developed based on gram.js.
// Copyright (C) 2022 Butthx <https://github.com/butthx>
//
// This file is part of Tgsnake
//
// Tgsnake is a free software : you can redistribute it and/or modify
//  it under the terms of the MIT License as published.

import { Api } from 'telegram';
import { Snake } from '../../Client';
import { TypeReplyMarkup, BuildReplyMarkup } from '../../Utils/ReplyMarkup';
import Parser, { Entities } from '@tgsnake/parser';
import BigInt from 'big-integer';
import * as Update from '../../Update';
import path from 'path';
import { toBigInt, toString, convertId } from '../../Utils/ToBigInt';
import BotError from '../../Context/Error';
import { onProgress } from './UploadFile';
const parser = new Parser(Api);
export interface defaultSendMediaMoreParams {
  silent?: boolean;
  background?: boolean;
  clearDraft?: boolean;
  replyToMsgId?: number;
  scheduleDate?: number;
  noforwards?: boolean;
  sendAs?: string;
  replyMarkup?: TypeReplyMarkup;
}
export interface sendMediaMoreParams extends defaultSendMediaMoreParams {
  entities?: Entities[];
  parseMode?: string;
  caption?: string;
}
/**
 * Sending message media.
 * @param snakeClient - Client
 * @param {number|string|bigint} chatId - Chat/Groups/Channel id.
 * @param {Object} media - Message Media.
 * @param more - more parameters to use.
 */
export async function SendMedia(
  snakeClient: Snake,
  chatId: number | string | bigint,
  media: Api.TypeInputMedia,
  more?: sendMediaMoreParams
) {
  try {
    snakeClient.log.debug('Running telegram.sendMedia');
    if (typeof chatId === 'number')
      snakeClient.log.warning(
        'Type of chatId is number, please switch to BigInt or String for security Ids 64 bit int.'
      );
    let parseMode = '';
    let [id, type, peer] = await toBigInt(chatId, snakeClient);
    if (more) {
      if (more.parseMode) {
        parseMode = more.parseMode.toLowerCase();
        delete more.parseMode;
      }
    }
    let parseText;
    let entities: Api.TypeMessageEntity[] = [];
    let replyMarkup;
    if (more) {
      if (more.entities) {
        snakeClient.log.debug('Building Entities');
        entities = (await parser.toRaw(
          snakeClient.client!,
          more.entities
        )) as Array<Api.TypeMessageEntity>;
        parseText = more.caption || '';
        delete more.entities;
      }
      if (more.caption && !more.entities) {
        snakeClient.log.debug('Building Entities');
        //@ts-ignore
        let [t, e] = parseMode !== '' ? parser.parse(more.caption, parseMode!) : [more.caption, []];
        parseText = t;
        entities = (await parser.toRaw(snakeClient.client!, e!)) as Array<Api.TypeMessageEntity>;
        delete more.caption;
      }
      if (more.replyMarkup) {
        snakeClient.log.debug('Building replyMarkup');
        replyMarkup = BuildReplyMarkup(more.replyMarkup!);
        delete more.replyMarkup;
      }
    }
    return snakeClient.client.invoke(
      new Api.messages.SendMedia({
        peer: peer,
        media: media,
        message: parseText || '',
        randomId: BigInt(-Math.floor(Math.random() * 10000000000000)),
        //@ts-ignore
        entities: entities,
        replyMarkup: replyMarkup,
        ...more,
      })
    );
  } catch (error: any) {
    snakeClient.log.error('Failed to running telegram.sendMedia');
    throw new BotError(
      error.message,
      'telegram.sendMedia',
      `${chatId},${JSON.stringify(media)}${more ? ',' + JSON.stringify(more) : ''}`
    );
  }
}
