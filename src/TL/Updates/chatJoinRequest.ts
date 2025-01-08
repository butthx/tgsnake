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
import { Raw } from '../../platform.deno.ts';
import { Chat, User } from '../Advanced/index.ts';
import type { Snake } from '../../Client/index.ts';

// https://core.telegram.org/bots/api#chatjoinrequest
export class ChatJoinRequest extends TLObject {
  chat?: Chat;
  from?: User;
  userChatId!: bigint;
  date!: Date;
  bio?: string;
  inviteLink?: Raw.TypeExportedChatInvite;
  constructor(
    {
      chat,
      from,
      userChatId,
      date,
      bio,
      inviteLink,
    }: {
      chat?: Chat;
      from?: User;
      userChatId: bigint;
      date: Date;
      bio?: string;
      inviteLink?: Raw.TypeExportedChatInvite;
    },
    client: Snake,
  ) {
    super(client);
    this.chat = chat;
    this.from = from;
    this.userChatId = userChatId;
    this.date = date;
    this.bio = bio;
    this.inviteLink = inviteLink;
  }
  static async parse(
    client: Snake,
    update: Raw.UpdateBotChatInviteRequester,
    chats: Array<Raw.TypeChat>,
    users: Array<Raw.TypeUser>,
  ): Promise<ChatJoinRequest> {
    return new ChatJoinRequest(
      {
        userChatId: update.userId,
        date: new Date(update.date * 1000),
        bio:
          'bio' in update
            ? (update.bio as string)
            : 'about' in update
              ? (update.about as string)
              : '',
        inviteLink: update.invite,
        from: await User.parse(
          client,
          users.find((user) => user.id === update.userId),
        ),
        chat: await Chat.parseDialog(client, update.peer, users, chats),
      },
      client,
    );
  }
}
