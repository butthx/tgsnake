// Tgsnake - Telegram MTProto framework developed based on gram.js.
// Copyright (C) 2021 Butthx <https://guthub.com/butthx>
//
// This file is part of Tgsnake
//
// Tgsnake is a free software : you can redistribute it and/or modify
//  it under the terms of the MIT License as published.

import { Update } from './Update';
import { Api } from 'telegram';
import { Snake } from '../client';
import { Telegram } from '../Telegram';
import { MessageContext } from '../Context/MessageContext';
export class UpdateNewMessage extends Update {
  message!: MessageContext;
  constructor() {
    super();
    this['_'] = 'UpdateNewMessage';
  }
  async init(update: Api.UpdateNewMessage, SnakeClient: Snake) {
    this.telegram = SnakeClient.telegram;
    let message = new MessageContext();
    if (update.message instanceof Api.Message) {
      await message.init(update.message as Api.Message, SnakeClient);
    }
    if (update.message instanceof Api.MessageService) {
      await message.init(update.message as Api.MessageService, SnakeClient);
    }
    this.message = message;
    return this;
  }
}
