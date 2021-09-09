// Tgsnake - Telegram MTProto framework developed based on gram.js.
// Copyright (C) 2021 Butthx <https://guthub.com/butthx>
//
// This file is part of Tgsnake
//
// Tgsnake is a free software : you can redistribute it and/or modify
//  it under the terms of the MIT License as published.

import { ResultAffectedMessages } from './DeleteMessages';
import { Api } from 'telegram';
import { Snake } from '../../client';
export interface readHistoryMoreParams {
  maxId?: number;
}
export async function ReadHistory(
  snakeClient: Snake,
  chatId: number | string,
  more?: readHistoryMoreParams
) {
  try {
    let type = await snakeClient.telegram.getEntity(chatId);
    if (type.type == 'channel') {
      let results = await snakeClient.client.invoke(
        new Api.channels.ReadHistory({
          channel: chatId,
          ...more,
        })
      );
      return new ResultAffectedMessages(results);
    } else {
      let results = await snakeClient.client.invoke(
        new Api.messages.ReadHistory({
          peer: chatId,
          ...more,
        })
      );
      return new ResultAffectedMessages(results);
    }
  } catch (error) {
    return snakeClient._handleError(
      error,
      `telegram.readHistory(${chatId}${more ? ',' + JSON.stringify(more) : ''})`
    );
  }
}
