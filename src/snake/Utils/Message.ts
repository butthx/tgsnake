// Tgsnake - Telegram MTProto framework developed based on gram.js.
// Copyright (C) 2021 Butthx <https://guthub.com/butthx>
//
// This file is part of Tgsnake
//
// Tgsnake is a free software : you can redistribute it and/or modify
//  it under the terms of the MIT License as published.

import { Api } from 'telegram';
import { Snake } from '../client';
import { RestrictionReason } from './RestrictionReason';
import { BigInteger } from 'big-integer';
import { MessageAction } from './MessageAction';
import { Chat } from './Chat';
import { From } from './From';
import { ReplyToMessageContext } from '../Context/ReplyToMessageContext';
import { Entities } from './Entities';
import { ForwardMessage } from './ForwardMessage';
import { Media } from './Media';
import { Message as MessageEvent } from 'telegram/tl/custom/message';
import {Telegram} from "../Telegram"
export class Message {
  out?: boolean;
  mentioned?: boolean;
  mediaUnread?: boolean;
  silent?: boolean;
  post?: boolean;
  legacy?: boolean;
  id!: number;
  from!: From;
  chat!: Chat;
  replyToMessage?: ReplyToMessageContext;
  date?: number | Date;
  action?: MessageAction;
  ttlPeriod?: number;
  fromScheduled?: boolean;
  editHide?: boolean;
  pinned?: boolean;
  fwdFrom?: ForwardMessage;
  viaBotId?: number;
  text?: string;
  media?: Media;
  replyMarkup?: Api.TypeReplyMarkup;
  entities?: Entities[];
  views?: number;
  forwards?: number;
  replies?: Api.TypeMessageReplies | number;
  editDate?: number;
  postAuthor?: string;
  mediaGroupId?: BigInteger | number;
  restrictionReason?: RestrictionReason[];
  SnakeClient!: Snake;
  telegram!:Telegram
  constructor() {}
  async init(message: MessageEvent | Api.MessageService | Api.Message, SnakeClient: Snake) {
    this.SnakeClient = SnakeClient;
    this.telegram = SnakeClient.telegram
    if (message instanceof MessageEvent || message.className == 'Message') {
      return await this.parseMessage(message as MessageEvent);
    }
    if (message instanceof Api.Message) {
      return await this.parseMessage(message as Api.Message);
    }
    if (message instanceof Api.MessageService) {
      return await this.parseMessageService(message as Api.MessageService);
    }
  }
  // only parse Message Service
  private async parseMessageService(message: Api.MessageService) {
    this.out = message.out;
    this.mentioned = message.mentioned;
    this.mediaUnread = message.mediaUnread;
    this.silent = message.silent;
    this.legacy = message.legacy;
    this.id = message.id;
    this.date = message.date;
    this.post = message.post;
    let messageAction = new MessageAction();
    await messageAction.init(message.action);
    this.action = messageAction;
    this.ttlPeriod = message.ttlPeriod;
    if (message.fromId) {
      let from = new From();
      await from.init(message.fromId, this.SnakeClient);
      this.from = from;
    }
    if (message.peerId) {
      let chat = new Chat();
      await chat.init(message.peerId, this.SnakeClient);
      this.chat = chat;
    }
    if (message.replyTo) {
      let replyTo = new ReplyToMessageContext();
      await replyTo.init(message.replyTo, this.SnakeClient, this.chat.id);
      this.replyToMessage = replyTo;
    }
    return this;
  }
  // only parse Message
  private async parseMessage(message: Api.Message | MessageEvent) {
    if (message instanceof Api.Message) {
      message as Api.Message;
    } else {
      message as MessageEvent;
    }
    this.out = message.out;
    this.mentioned = message.mentioned;
    this.mediaUnread = message.mediaUnread;
    this.silent = message.silent;
    this.legacy = message.legacy;
    this.id = message.id;
    this.date = message.date;
    this.post = message.post;
    this.fromScheduled = message.fromScheduled;
    this.editHide = message.editHide;
    this.pinned = message.pinned;
    this.viaBotId = message.viaBotId;
    this.text = message.message;
    this.views = message.views;
    this.forwards = message.forwards;
    this.postAuthor = message.postAuthor;
    this.mediaGroupId = message.groupedId;
    this.ttlPeriod = message.ttlPeriod;
    this.editDate = message.editDate;
    if (message.fromId) {
      let from = new From();
      await from.init(message.fromId, this.SnakeClient);
      this.from = from;
    }
    if (message.peerId) {
      let chat = new Chat();
      await chat.init(message.peerId, this.SnakeClient);
      this.chat = chat;
    }
    if (message.media) {
      let media = new Media();
      await media.encode(await media.parseMedia(message.media));
      this.media = media;
    }
    if (message.replyTo) {
      let replyTo = new ReplyToMessageContext();
      await replyTo.init(message.replyTo, this.SnakeClient, this.chat.id);
      this.replyToMessage = replyTo;
    }
    if (message.fwdFrom) {
      let forward = new ForwardMessage();
      await forward.init(message.fwdFrom, this.SnakeClient);
      this.fwdFrom = forward;
    }
    if (message.entities) {
      let temp: Entities[] = [];
      message.entities.forEach((item) => {
        temp.push(new Entities(item!));
      });
      this.entities = temp;
    }
    if (message.restrictionReason) {
      let temp: RestrictionReason[] = [];
      for (let i = 0; i < message.restrictionReason.length; i++) {
        temp.push(new RestrictionReason(message.restrictionReason[i]));
      }
      this.restrictionReason = temp;
    }
    // todo
    // change the replyMarkup json and replies json.
    if (message.replyMarkup) {
      this.replyMarkup = message.replyMarkup;
    }
    if (message.replies) {
      this.replies = message.replies;
    }
    return this;
  }
}
