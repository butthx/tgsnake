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
import { Raws } from '../../platform.deno.ts';
import {
  Message,
  InlineQuery,
  ChosenInlineResult,
  ShippingQuery,
  PreCheckoutQuery,
} from '../Messages/index.ts';
import { Poll, PollAnswer } from '../Messages/Medias/Poll.ts';
import { CallbackQuery } from './callbackQuery.ts';
import { ChatMemberUpdated } from './chatMember.ts';
import { ChatJoinRequest } from './chatJoinRequest.ts';
import { Logger } from '../../Context/Logger.ts';
import type { Snake } from '../../Client/index.ts';
import type { Telegram } from '../../Methods/Telegram.ts';

export interface TypeUpdate {
  message?: Message;
  editedMessage?: Message;
  channelPost?: Message;
  editedChannelPost?: Message;
  inlineQuery?: InlineQuery;
  chosenInlineResult?: ChosenInlineResult;
  callbackQuery?: CallbackQuery;
  shippingQuery?: ShippingQuery;
  preCheckoutQuery?: PreCheckoutQuery;
  poll?: Poll;
  pollAnswer?: PollAnswer;
  myChatMember?: ChatMemberUpdated;
  chatMember?: ChatMemberUpdated;
  chatJoinRequest?: ChatJoinRequest;
  secretChat?: Raws.UpdateSecretChatMessage;
}
export interface ContextUpdate {
  className: string;
  client: Snake;
  api: Telegram;
  msg?: Message;
  match?: Array<RegExpExecArray>;
  _me: Raws.Raw.User;
}
export class Update extends TLObject {
  message?: Message;
  editedMessage?: Message;
  channelPost?: Message;
  editedChannelPost?: Message;
  inlineQuery?: InlineQuery;
  chosenInlineResult?: ChosenInlineResult;
  callbackQuery?: CallbackQuery;
  shippingQuery?: ShippingQuery;
  preCheckoutQuery?: PreCheckoutQuery;
  poll?: Poll;
  pollAnswer?: PollAnswer;
  chatJoinRequest?: ChatJoinRequest;
  myChatMember?: ChatMemberUpdated;
  chatMember?: ChatMemberUpdated;
  secretChat?: Raws.UpdateSecretChatMessage;
  constructor(
    {
      message,
      editedMessage,
      channelPost,
      editedChannelPost,
      inlineQuery,
      chosenInlineResult,
      callbackQuery,
      shippingQuery,
      preCheckoutQuery,
      poll,
      pollAnswer,
      chatJoinRequest,
      myChatMember,
      chatMember,
      secretChat,
    }: TypeUpdate,
    client: Snake,
  ) {
    super(client);
    this.message = message;
    this.editedMessage = editedMessage;
    this.channelPost = channelPost;
    this.editedChannelPost = editedChannelPost;
    this.inlineQuery = inlineQuery;
    this.chosenInlineResult = chosenInlineResult;
    this.callbackQuery = callbackQuery;
    this.shippingQuery = shippingQuery;
    this.preCheckoutQuery = preCheckoutQuery;
    this.poll = poll;
    this.pollAnswer = pollAnswer;
    this.chatJoinRequest = chatJoinRequest;
    this.myChatMember = myChatMember;
    this.chatMember = chatMember;
    this.secretChat = secretChat;
  }
  static async parse(
    client: Snake,
    update: Raws.Raw.TypeUpdate,
    chats: Array<Raws.Raw.TypeChat>,
    users: Array<Raws.Raw.TypeUser>,
  ): Promise<Update | undefined> {
    Logger.debug(`Parsing update: ${update.className}`);
    if (
      update instanceof Raws.Raw.UpdateNewMessage ||
      update instanceof Raws.Raw.UpdateNewChannelMessage
    ) {
      return Update.updateNewMessage(client, update, chats, users);
    }
    if (
      update instanceof Raws.Raw.UpdateEditMessage ||
      update instanceof Raws.Raw.UpdateEditChannelMessage
    ) {
      return Update.updateEditMessage(client, update, chats, users);
    }
    if (
      update instanceof Raws.Raw.UpdateBotCallbackQuery ||
      update instanceof Raws.Raw.UpdateInlineBotCallbackQuery
    ) {
      return new Update(
        {
          callbackQuery: await CallbackQuery.parse(client, update, chats, users),
        },
        client,
      );
    }
    if (update instanceof Raws.UpdateSecretChatMessage) {
      return new Update(
        {
          secretChat: update,
        },
        client,
      );
    }
    if (
      update instanceof Raws.Raw.UpdateChannelParticipant ||
      update instanceof Raws.Raw.UpdateChatParticipant
    ) {
      const chatmember = ChatMemberUpdated.parse(client, update, chats, users);
      if (chatmember.from.isSelf) {
        return new Update(
          {
            myChatMember: chatmember,
          },
          client,
        );
      }
      return new Update(
        {
          chatMember: chatmember,
        },
        client,
      );
    }
    if (update instanceof Raws.Raw.UpdateBotChatInviteRequester) {
      return new Update(
        {
          chatJoinRequest: await ChatJoinRequest.parse(
            client,
            update as Raws.Raw.UpdateBotChatInviteRequester,
            chats,
            users,
          ),
        },
        client,
      );
    }
    if (update instanceof Raws.Raw.UpdateMessagePoll) {
      return new Update(
        {
          poll: Poll.parse(client, update as Raws.Raw.UpdateMessagePoll),
        },
        client,
      );
    }
    if (update instanceof Raws.Raw.UpdateMessagePollVote) {
      return new Update(
        {
          pollAnswer: PollAnswer.parseUpdate(
            client,
            update as Raws.Raw.UpdateMessagePollVote,
            chats,
            users,
          ),
        },
        client,
      );
    }
    if (update instanceof Raws.Raw.UpdateBotInlineQuery) {
      return new Update(
        {
          inlineQuery: InlineQuery.parse(client, update as Raws.Raw.UpdateBotInlineQuery, users),
        },
        client,
      );
    }
    if (update instanceof Raws.Raw.UpdateBotInlineSend) {
      return new Update(
        {
          chosenInlineResult: ChosenInlineResult.parse(
            client,
            update as Raws.Raw.UpdateBotInlineSend,
            users,
          ),
        },
        client,
      );
    }
    if (update instanceof Raws.Raw.UpdateBotShippingQuery) {
      return new Update(
        {
          shippingQuery: ShippingQuery.parse(
            client,
            update as Raws.Raw.UpdateBotShippingQuery,
            users,
          ),
        },
        client,
      );
    }
    if (update instanceof Raws.Raw.UpdateBotPrecheckoutQuery) {
      return new Update(
        {
          preCheckoutQuery: PreCheckoutQuery.parse(client, update, users),
        },
        client,
      );
    }
    return;
  }
  static async updateNewMessage(
    client: Snake,
    update: Raws.Raw.UpdateNewMessage | Raws.Raw.UpdateNewChannelMessage,
    chats: Array<Raws.Raw.TypeChat>,
    users: Array<Raws.Raw.TypeUser>,
  ): Promise<Update> {
    if (update.message instanceof Raws.Raw.Message && (update.message as Raws.Raw.Message).post) {
      return new Update(
        {
          channelPost: await Message.parse(client, update.message, chats, users),
        },
        client,
      );
    }
    return new Update(
      {
        message: await Message.parse(client, update.message, chats, users),
      },
      client,
    );
  }
  static async updateEditMessage(
    client: Snake,
    update: Raws.Raw.UpdateEditMessage | Raws.Raw.UpdateEditChannelMessage,
    chats: Array<Raws.Raw.TypeChat>,
    users: Array<Raws.Raw.TypeUser>,
  ): Promise<Update> {
    if (update instanceof Raws.Raw.UpdateEditChannelMessage) {
      return new Update(
        {
          editedChannelPost: await Message.parse(client, update.message, chats, users),
        },
        client,
      );
    }
    return new Update(
      {
        editedMessage: await Message.parse(client, update.message, chats, users),
      },
      client,
    );
  }

  /* shorthand */
  get msg(): Message | undefined {
    if (this.channelPost) return this.channelPost;
    if (this.editedChannelPost) return this.editedChannelPost;
    if (this.editedMessage) return this.editedMessage;
    if (this.message) return this.message;
    if (this.callbackQuery?.message) return this.callbackQuery.message;
    return;
  }
  get _me(): Raws.Raw.User {
    return this.client._me;
  }
}
