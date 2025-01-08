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
import type { Snake } from '../../Client/index.ts';

// https://core.telegram.org/bots/api#chatpermissions
export class ChatPermission extends TLObject {
  /**
   * Optional. True, if the user is allowed to send text messages, contacts, locations and venues.
   */
  canSendMessages?: boolean;
  /**
   * Optional. True, if the user is allowed to send audios, documents, photos, videos, video notes and voice notes, implies canSendMessages.
   */
  canSendMediaMessages?: boolean;
  /**
   * Optional. True, if the user is allowed to send polls, implies canSendMessages.
   */
  canSendPolls?: boolean;
  /**
   * Optional. True, if the user is allowed to send animations, games, stickers and use inline bots, implies canSendMediaMessages.
   */
  canSendOtherMessages?: boolean;
  /**
   * Optional. True, if the user is allowed to add web page previews to their messages, implies canSendMediaMessages.
   */
  canAddWebPagePreview?: boolean;
  /**
   * Optional. True, if the user is allowed to change the chat title, photo and other settings. Ignored in public supergroups.
   */
  canChangeInfo?: boolean;
  /**
   * Optional. True, if the user is allowed to invite new users to the chat.
   */
  canInviteUsers?: boolean;
  /**
   * Optional. True, if the user is allowed to pin messages. Ignored in public supergroups.
   */
  canPinMessages?: boolean;
  constructor(
    {
      canSendMessages,
      canSendMediaMessages,
      canSendPolls,
      canSendOtherMessages,
      canAddWebPagePreview,
      canChangeInfo,
      canInviteUsers,
      canPinMessages,
    }: {
      canSendMessages?: boolean;
      canSendMediaMessages?: boolean;
      canSendPolls?: boolean;
      canSendOtherMessages?: boolean;
      canAddWebPagePreview?: boolean;
      canChangeInfo?: boolean;
      canInviteUsers?: boolean;
      canPinMessages?: boolean;
    },
    client: Snake,
  ) {
    super(client);
    this.canSendMessages = canSendMessages;
    this.canSendMediaMessages = canSendMediaMessages;
    this.canSendPolls = canSendPolls;
    this.canSendOtherMessages = canSendOtherMessages;
    this.canAddWebPagePreview = canAddWebPagePreview;
    this.canChangeInfo = canChangeInfo;
    this.canInviteUsers = canInviteUsers;
    this.canPinMessages = canPinMessages;
  }
  static parse(client: Snake, bannedPermission?: Raw.ChatBannedRights): ChatPermission | undefined {
    if (!bannedPermission) return;
    return new ChatPermission(
      {
        canSendMessages: !bannedPermission.sendMessages,
        canSendMediaMessages: !bannedPermission.sendMedia,
        canSendPolls: !bannedPermission.sendPolls,
        canSendOtherMessages:
          !bannedPermission.sendStickers &&
          !bannedPermission.sendGifs &&
          !bannedPermission.sendGames &&
          !bannedPermission.sendInline,
        canAddWebPagePreview: !bannedPermission.embedLinks,
        canChangeInfo: !bannedPermission.changeInfo,
        canInviteUsers: !bannedPermission.inviteUsers,
        canPinMessages: !bannedPermission.pinMessages,
      },
      client,
    );
  }
}
