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
import { Raw, Helpers } from '../../platform.deno.ts';
import type { Snake } from '../../Client/index.ts';
import { ChatPermission } from './ChatPermission.ts';
import { Restriction } from './Restriction.ts';
import { ChatPhoto } from './ChatPhoto.ts';
import { getId } from '../../Utilities.ts';

export interface TypeChat {
  id: bigint;
  accessHash?: bigint;
  type: string;
  title?: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  photo?: ChatPhoto;
  bio?: string;
  hasPrivateForwards?: boolean;
  joinToSendMessages?: boolean;
  joinByRequest?: boolean;
  description?: string;
  inviteLink?: string;
  pinnedMessage?: TLObject;
  permissions?: ChatPermission;
  slowModeDelay?: number;
  messageAutoDeleteTime?: number;
  hasProtectContent?: boolean;
  stickerSetName?: string;
  canSetStickerSet?: boolean;
  linkedChatId?: bigint;
  location?: TLObject;
  isVerified?: boolean;
  isRestricted?: boolean;
  isCreator?: boolean;
  isScam?: boolean;
  isFake?: boolean;
  isSupport?: boolean;
  dcId?: number;
  membersCount?: number;
  restrictions?: Array<Restriction>;
  sendAsChat?: Chat;
  availableReactions?: Array<string>;
  isLeft?: boolean;
  isInactive?: boolean;
}
// https://core.telegram.org/bots/api#chat
export class Chat extends TLObject {
  /**
   * Unique identifier for this chat.
   */
  id!: bigint;
  /**
   * Unique identifier hash for this chat.
   */
  accessHash?: bigint;
  /**
   * Type of chat, can be either “private”, “group”, “supergroup” or “channel”.
   */
  type!: string;
  /**
   * Title, for supergroups, channels and group chats.
   */
  title?: string;
  /**
   * Username, for private chats, supergroups and channels if available.
   */
  username?: string;
  /**
   * First name of the other party in a private chat.
   */
  firstname?: string;
  /**
   * Last name of the other party in a private chat.
   */
  lastname?: string;
  /**
   * Chat photo. Returned only in getChat.
   */
  photo?: ChatPhoto;
  /**
   * Bio of the other party in a private chat. Returned only in getChat.
   */
  bio?: string;
  /**
   * True, if privacy settings of the other party in the private chat allows to use `tg://user?id=<user_id>` links only in chats with the user. Returned only in getChat.
   */
  hasPrivateForwards?: boolean;
  /**
   * True, if users need to join the supergroup before they can send messages. Returned only in getChat.
   */
  joinToSendMessages?: boolean;
  /**
   * True, if all users directly joining the supergroup need to be approved by supergroup administrators. Returned only in getChat.
   */
  joinByRequest?: boolean;
  /**
   * Description, for groups, supergroups and channel chats. Returned only in getChat.
   */
  description?: string;
  /**
   * Primary invite link, for groups, supergroups and channel chats. Returned only in getChat.
   */
  inviteLink?: string;
  /**
   * The most recent pinned message (by sending date). Returned only in getChat.
   */
  pinnedMessage?: TLObject;
  /**
   * Default chat member permissions, for groups and supergroups. Returned only in getChat.
   */
  permissions?: ChatPermission;
  /**
   * For supergroups, the minimum allowed delay between consecutive messages sent by each unpriviledged user; in seconds. Returned only in getChat.
   */
  slowModeDelay?: number;
  /**
   * The time after which all messages sent to the chat will be automatically deleted; in seconds. Returned only in getChat.
   */
  messageAutoDeleteTime?: number;
  /**
   * True, if messages from the chat can't be forwarded to other chats. Returned only in getChat.
   */
  hasProtectContent?: boolean;
  /**
   * For supergroups, name of group sticker set.
   */
  stickerSetName?: string;
  /**
   * True, if the bot can change the group sticker set. Returned only in getChat.
   */
  canSetStickerSet?: boolean;
  /**
   * Unique identifier for the linked chat, i.e. the discussion group identifier for a channel and vice versa.
   * Returned only in getChat.
   */
  linkedChatId?: bigint;
  /**
   * For supergroups, the location to which the supergroup is connected. Returned only in getChat.
   */
  location?: TLObject;
  /**
   * True, if this chat has been verified by Telegram. Supergroups, channels and bots only.
   */
  isVerified?: boolean;
  /**
   * True, if this chat has been restricted. Supergroups, channels and bots only.<br/>
   * See `restrictions` for details.
   */
  isRestricted?: boolean;
  /**
   * True, if this chat owner is the current user. Supergroups, channels and groups only.
   */
  isCreator?: boolean;
  /**
   * True, if this chat has been flagged for scam.
   */
  isScam?: boolean;
  /**
   * True, if this chat has been flagged for impersonation.
   */
  isFake?: boolean;
  /**
   * True, if this chat is part of the Telegram support team. Users and bots only.
   */
  isSupport?: boolean;
  /**
   * The chat assigned DC (data center). Available only in case the chat has a photo.<br/>
   * Note that this information is approximate; it is based on where Telegram stores the current chat photo.<br/>
   * It is accurate only in case the owner has set the chat photo, otherwise the dcId will be the one assigned to the administrator who set the current chat photo.
   */
  dcId?: number;
  /**
   * Chat members count, for groups, supergroups and channels only. Returned only in getChat.
   */
  membersCount?: number;
  /**
   * The list of reasons why this chat might be unavailable to some users.<br/>
   * This field is available only in case `isRestricted` is true.
   */
  restrictions?: Array<Restriction>;
  /**
   * The default "sendAs" chat. Returned only in getChat.
   */
  sendAsChat?: Chat;
  /**
   * Available reactions in the chat. Returned only in getChat.
   */
  availableReactions?: Array<string>;
  /**
   * Have you left this chat, chances are you are the owner who just logged out and didn't delete the chat.
   */
  isLeft?: boolean;
  /**
   * Has this chat been inactive, this happens if the owner of the chat delete the account.
   */
  isInactive?: boolean;

  constructor(
    {
      id,
      accessHash,
      type,
      title,
      username,
      firstname,
      lastname,
      photo,
      bio,
      hasPrivateForwards,
      joinToSendMessages,
      joinByRequest,
      description,
      inviteLink,
      pinnedMessage,
      permissions,
      slowModeDelay,
      messageAutoDeleteTime,
      hasProtectContent,
      stickerSetName,
      canSetStickerSet,
      linkedChatId,
      location,
      isVerified,
      isRestricted,
      isCreator,
      isScam,
      isFake,
      isSupport,
      dcId,
      membersCount,
      restrictions,
      sendAsChat,
      availableReactions,
      isLeft,
      isInactive,
    }: TypeChat,
    client: Snake,
  ) {
    super(client);
    this.id = id;
    this.accessHash = accessHash;
    this.type = type;
    this.title = title;
    this.username = username;
    this.firstname = firstname;
    this.lastname = lastname;
    this.photo = photo;
    this.bio = bio;
    this.hasPrivateForwards = hasPrivateForwards;
    this.joinToSendMessages = joinToSendMessages;
    this.joinByRequest = joinByRequest;
    this.description = description;
    this.inviteLink = inviteLink;
    this.pinnedMessage = pinnedMessage;
    this.permissions = permissions;
    this.slowModeDelay = slowModeDelay;
    this.messageAutoDeleteTime = messageAutoDeleteTime;
    this.hasProtectContent = hasProtectContent;
    this.stickerSetName = stickerSetName;
    this.canSetStickerSet = canSetStickerSet;
    this.linkedChatId = linkedChatId;
    this.location = location;
    this.isVerified = isVerified;
    this.isRestricted = isRestricted;
    this.isCreator = isCreator;
    this.isScam = isScam;
    this.isFake = isFake;
    this.isSupport = isSupport;
    this.dcId = dcId;
    this.membersCount = membersCount;
    this.restrictions = restrictions;
    this.sendAsChat = sendAsChat;
    this.availableReactions = availableReactions;
    this.isLeft = isLeft;
    this.isInactive = isInactive;
  }
  static parseMessage(
    client: Snake,
    message: Raw.Message | Raw.MessageService,
    users: Array<Raw.TypeUser>,
    chats: Array<Raw.TypeChat>,
    chat?: boolean,
  ): Chat | undefined {
    let peerId = getId(message.peerId);
    let fromId = getId(message.fromId!);
    let chatId = chat ? peerId || fromId : fromId || peerId;
    let merge: Array<Raw.TypeUser | Raw.TypeChat> = [...users, ...chats];
    if (!chatId) return;
    let filtered = merge.filter((c) => c.id === chatId)[0];
    if (filtered) {
      if (filtered instanceof Raw.User || filtered instanceof Raw.UserEmpty) {
        return Chat.parseUser(client, filtered!);
      }
      if (
        filtered instanceof Raw.Chat ||
        filtered instanceof Raw.ChatEmpty ||
        filtered instanceof Raw.ChatForbidden
      ) {
        return Chat.parseChat(client, filtered!);
      }
      return Chat.parseChannel(client, filtered!);
    }
    return;
  }
  static parseChat(
    client: Snake,
    chat?: Raw.ChatEmpty | Raw.Chat | Raw.ChatForbidden,
  ): Chat | undefined {
    if (chat) {
      if (chat instanceof Raw.ChatEmpty) {
        return new Chat(
          {
            id: BigInt(-chat.id),
            type: 'group',
          },
          client,
        );
      }
      if (chat instanceof Raw.ChatForbidden) {
        return new Chat(
          {
            id: BigInt(-chat.id),
            title: chat.title,
            type: 'group',
          },
          client,
        );
      }
      return new Chat(
        {
          id: BigInt(-chat.id),
          type: 'group',
          title: chat.title,
          photo: ChatPhoto.parse(client, chat.photo, -chat.id, BigInt(0)),
          permissions: ChatPermission.parse(client, chat.defaultBannedRights),
          hasProtectContent: chat.noforwards,
          isCreator: chat.creator,
          // @ts-ignore
          dcId: chat.photo && chat.photo.dcId ? chat.photo.dcId : undefined,
          membersCount: chat.participantsCount,
          isInactive: chat.deactivated,
          isLeft: chat.left,
        },
        client,
      );
    }
  }
  static parseChannel(
    client: Snake,
    channel?: Raw.Channel | Raw.ChannelForbidden,
  ): Chat | undefined {
    if (channel) {
      if (channel instanceof Raw.ChannelForbidden) {
        return new Chat(
          {
            id: Helpers.getChannelId(channel.id),
            accessHash: channel.accessHash,
            type: channel.broadcast ? 'channel' : 'supergroup',
            title: channel.title,
          },
          client,
        );
      }
      return new Chat(
        {
          id: Helpers.getChannelId(channel.id),
          accessHash: channel.accessHash,
          type: channel.broadcast ? 'channel' : 'supergroup',
          title: channel.title,
          username: channel.username,
          photo: ChatPhoto.parse(
            client,
            channel.photo,
            Helpers.getChannelId(channel.id),
            channel.accessHash,
          ),
          hasPrivateForwards: channel.noforwards,
          joinToSendMessages: channel.joinToSend,
          joinByRequest: channel.joinRequest,
          permissions: ChatPermission.parse(client, channel.defaultBannedRights),
          hasProtectContent: channel.noforwards,
          isVerified: channel.verified,
          isRestricted: channel.restricted,
          isCreator: channel.creator,
          isScam: channel.scam,
          isFake: channel.fake,
          // @ts-ignore
          dcId: channel.photo && channel.photo.dcId ? channel.photo.dcId : undefined,
          membersCount: channel.participantsCount,
          restrictions: Chat.parseRestrictions(
            client,
            channel.restrictionReason ? channel.restrictionReason : [],
          ),
          isLeft: channel.left,
        },
        client,
      );
    }
  }
  static parseUser(client: Snake, user?: Raw.User | Raw.UserEmpty): Chat | undefined {
    if (user) {
      if (user instanceof Raw.UserEmpty) {
        return new Chat(
          {
            id: user.id,
            type: 'private',
          },
          client,
        );
      }
      return new Chat(
        {
          id: user.id,
          accessHash: user.accessHash,
          type: 'private',
          username: user.username,
          firstname: user.firstName,
          lastname: user.lastName,
          photo: ChatPhoto.parse(client, user.photo, user.id, user.accessHash ?? BigInt(0)),
          isVerified: user.verified,
          isRestricted: user.restricted,
          isSupport: user.support,
          // @ts-ignore
          dcId: user.photo ? user.photo.dcId : undefined,
          restrictions: Chat.parseRestrictions(
            client,
            user.restrictionReason ? user.restrictionReason : [],
          ),
        },
        client,
      );
    }
  }
  static parseDialog(
    client: Snake,
    peer: Raw.TypePeer,
    users: Array<Raw.TypeUser>,
    chats: Array<Raw.TypeChat>,
  ): Chat | undefined {
    let peerId = getId(peer);
    let merge: Array<Raw.TypeUser | Raw.TypeChat> = [...users, ...chats];
    if (!peerId) return;
    let filtered = merge.filter((c) => c.id === peerId)[0];
    if (filtered) {
      if (filtered instanceof Raw.User || filtered instanceof Raw.UserEmpty) {
        return Chat.parseUser(client, filtered!);
      }
      if (
        filtered instanceof Raw.Chat ||
        filtered instanceof Raw.ChatEmpty ||
        filtered instanceof Raw.ChatForbidden
      ) {
        return Chat.parseChat(client, filtered!);
      }
      return Chat.parseChannel(client, filtered!);
    }
  }
  // static parseFull() {}
  // static parse() {}
  /**
   * Parse Reason Restriction.
   * @param restrictions {Object} - List of reason restrictions.
   * @param client {Object} - Snake Client.
   */
  static parseRestrictions(
    client: Snake,
    restrictions: Array<Raw.TypeRestrictionReason>,
  ): Array<Restriction> | undefined {
    let results: Array<Restriction> = [];
    for (let restriction of restrictions) {
      results.push(Restriction.parse(client, restriction));
    }
    return results.length ? results : undefined;
  }
  // bound method should be added here.
  /**
   * Convert Chat class to InputPeer class. <br/>
   * This allows it to be used as a parameter when invoking Raw api.
   */
  get inputPeer(): Raw.TypeInputPeer {
    if (this.type === 'private') {
      return new Raw.InputPeerUser({
        userId: this.id,
        accessHash: this.accessHash ?? BigInt(0),
      });
    } else if (this.type === 'group') {
      return new Raw.InputPeerChat({
        chatId: -this.id,
      });
    } else {
      return new Raw.InputPeerChannel({
        channelId: Helpers.getChannelId(this.id),
        accessHash: this.accessHash ?? BigInt(0),
      });
    }
  }
}
