// Tgsnake - Telegram MTProto framework developed based on gram.js.
// Copyright (C) 2021 Butthx <https://guthub.com/butthx>
//
// This file is part of Tgsnake
//
// Tgsnake is a free software : you can redistribute it and/or modify
//  it under the terms of the MIT License as published.

import { Snake } from '../client';
import { Update } from './Update';
import { Telegram } from '../Telegram';
import {
  TypeChatParticipants,
  ChatParticipants,
  ChatParticipantsForbidden,
} from '../Utils/ChatParticipants';
import { Api } from 'telegram';

export class UpdateChatParticipants extends Update {
  participants!: TypeChatParticipants;
  constructor() {
    super();
    this['_'] = 'UpdateChatParticipants';
  }
  async init(update: Api.UpdateChatParticipants, SnakeClient: Snake) {
    this.telegram = SnakeClient.telegram;
    if (update.participants) {
      if (update.participants instanceof Api.ChatParticipants) {
        let participants = new ChatParticipants();
        await participants.init(update.participants as Api.ChatParticipants, SnakeClient);
        this.participants = participants;
      }
      if (update.participants instanceof Api.ChatParticipantsForbidden) {
        let participants = new ChatParticipantsForbidden();
        await participants.init(update.participants as Api.ChatParticipantsForbidden, SnakeClient);
        this.participants = participants;
      }
    }
    return this;
  }
}
