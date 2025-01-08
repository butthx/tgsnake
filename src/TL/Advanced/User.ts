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
import { Restriction } from './Restriction.ts';
import { ChatPhoto } from './ChatPhoto.ts';

export interface TypeUser {
  id: bigint;
  accessHash?: bigint;
  isSelf?: boolean;
  isContact?: boolean;
  isMutualContact?: boolean;
  isDeleted?: boolean;
  isBot?: boolean;
  isVerified?: boolean;
  isRestricted?: boolean;
  isScam?: boolean;
  isFake?: boolean;
  isSupport?: boolean;
  isPremium?: boolean;
  firstname?: string;
  lastname?: string;
  status?: string;
  lastOnlineDate?: Date;
  nextOfflineDate?: Date;
  username?: string;
  languageCode?: string;
  dcId?: number;
  phoneNumber?: string;
  photo?: ChatPhoto;
  restrictions?: Array<Restriction>;
  addedToAttachmentMenu?: boolean;
  canJoinGroups?: boolean;
  canReadAllGroupMessages?: boolean;
  supportsInlineQueries?: boolean;
}
// https://core.telegram.org/bots/api#user
export class User extends TLObject {
  /**
   * Unique identifier for this user or bot.
   */
  id!: bigint;
  /**
   * Unique identifier hash for this user or bot.
   */
  accessHash?: bigint;
  /**
   * True, if this user is you yourself.
   */
  isSelf?: boolean;
  /**
   * True, if this user is in your contacts.
   */
  isContact?: boolean;
  /**
   * True, if you both have each other's contact.
   */
  isMutualContact?: boolean;
  /**
   * True, if this user is deleted.
   */
  isDeleted?: boolean;
  /**
   * True, if this user is a bot.
   */
  isBot?: boolean;
  /**
   * True, if this user has been verified by Telegram.
   */
  isVerified?: boolean;
  /**
   * True, if this user has been restricted. Bots only.<br/>
   * See restrictions for details.
   */
  isRestricted?: boolean;
  /**
   * True, if this user has been flagged for scam.
   */
  isScam?: boolean;
  /**
   * True, if this user has been flagged for impersonation.
   */
  isFake?: boolean;
  /**
   * True, if this user is part of the Telegram support team.
   */
  isSupport?: boolean;
  /**
   * True, if this user is a premium user.
   */
  isPremium?: boolean;
  /**
   * User's or bot's first name.
   */
  firstname?: string;
  /**
   * User's or bot's last name.
   */
  lastname?: string;
  /**
   * User last seen
   */
  status?: string;
  /**
   * Last online date of a user. Only available in case status is offline.
   */
  lastOnlineDate?: Date;
  /**
   * Date when a user will automatically go offline. Only available in case status is online
   */
  nextOfflineDate?: Date;
  /**
   * User's or bot's username.
   */
  username?: string;
  /**
   * User's or bot's language code.
   */
  languageCode?: string;
  /**
   * User's or bot's assigned DC (data center). Available only in case the user has set a public profile photo. <br/>
   * Note that this information is approximate; it is based on where Telegram stores a user profile pictures and does not by any means tell you the user location (i.e. a user might travel far away, but will still connect to its assigned DC).
   */
  dcId?: number;
  /**
   * User's phone number.
   */
  phoneNumber?: string;
  /**
   * User's or bot's photo profil.
   */
  photo?: ChatPhoto;
  /**
   * The list of reasons why this bot might be unavailable to some users. <br/>
   * This field is available only in case isRestricted is true.
   */
  restrictions?: Array<Restriction>;
  /**
   * True, if this user added the bot to the attachment menu.
   */
  addedToAttachmentMenu?: boolean;
  /**
   * True, if the bot can be invited to groups. Returned only in getMe.
   */
  canJoinGroups?: boolean;
  /**
   * True, if privacy mode is disabled for the bot. Returned only in getMe.
   */
  canReadAllGroupMessages?: boolean;
  /**
   * True, if the bot supports inline queries. Returned only in getMe.
   */
  supportsInlineQueries?: boolean;
  constructor(
    {
      id,
      accessHash,
      isSelf,
      isContact,
      isMutualContact,
      isDeleted,
      isBot,
      isVerified,
      isRestricted,
      isScam,
      isFake,
      isSupport,
      isPremium,
      firstname,
      lastname,
      status,
      lastOnlineDate,
      nextOfflineDate,
      username,
      languageCode,
      dcId,
      phoneNumber,
      photo,
      restrictions,
      addedToAttachmentMenu,
      canJoinGroups,
      canReadAllGroupMessages,
      supportsInlineQueries,
    }: TypeUser,
    client: Snake,
  ) {
    super(client);
    this.id = id;
    this.accessHash = accessHash;
    this.isSelf = isSelf;
    this.isContact = isContact;
    this.isMutualContact = isMutualContact;
    this.isDeleted = isDeleted;
    this.isBot = isBot;
    this.isVerified = isVerified;
    this.isRestricted = isRestricted;
    this.isScam = isScam;
    this.isFake = isFake;
    this.isSupport = isSupport;
    this.isPremium = isPremium;
    this.firstname = firstname;
    this.lastname = lastname;
    this.status = status;
    this.lastOnlineDate = lastOnlineDate;
    this.nextOfflineDate = nextOfflineDate;
    this.username = username;
    this.languageCode = languageCode;
    this.dcId = dcId;
    this.phoneNumber = phoneNumber;
    this.photo = photo;
    this.restrictions = restrictions;
    this.addedToAttachmentMenu = addedToAttachmentMenu;
    this.canJoinGroups = canJoinGroups;
    this.canReadAllGroupMessages = canReadAllGroupMessages;
    this.supportsInlineQueries = supportsInlineQueries;
  }
  /**
   * Build User class.
   * @param client {Object} - Snake Client.
   * @param user {Object|undefined} - Primitive User class will be using to build modern User class.
   */
  static parse(client: Snake, user?: Raw.TypeUser): User | undefined {
    if (user) {
      if (user instanceof Raw.User) {
        user as Raw.User;
        return new User(
          {
            id: user.id,
            accessHash: user.accessHash,
            isSelf: user.self,
            isContact: user.contact,
            isMutualContact: user.mutualContact,
            isDeleted: user.deleted,
            isBot: user.bot,
            isVerified: user.verified,
            isRestricted: user.restricted,
            isScam: user.scam,
            isFake: user.fake,
            isSupport: user.support,
            isPremium: user.premium,
            firstname: user.firstName,
            lastname: user.lastName,
            ...User.parseStatus(user.status, user.bot),
            username: user.username,
            languageCode: user.langCode,
            // @ts-ignore
            dcId: user.photo && user.photo.dcId ? user.photo.dcId : undefined,
            phoneNumber: user.phone,
            photo: ChatPhoto.parse(client, user.photo, user.id, user.accessHash),
            restrictions: User.parseRestrictions(
              user.restrictionReason ? user.restrictionReason : [],
              client,
            ),
            addedToAttachmentMenu: Boolean(user.botAttachMenu && user.attachMenuEnabled),
            canJoinGroups: !user.botNochats,
            canReadAllGroupMessages: user.botChatHistory,
            supportsInlineQueries: Boolean(user.botInlineGeo && user.botInlinePlaceholder),
          },
          client,
        );
      }
      return new User({ id: user.id }, client);
    }
    return;
  }
  /**
   * Parse Reason Restriction.
   * @param restrictions {Object} - List of reason restrictions.
   * @param client {Object} - Snake Client.
   */
  static parseRestrictions(
    restrictions: Array<Raw.TypeRestrictionReason>,
    client: Snake,
  ): Array<Restriction> {
    let results: Array<Restriction> = [];
    for (let restriction of restrictions) {
      results.push(Restriction.parse(client, restriction));
    }
    return results;
  }
  /**
   * Parse user status to human readable.
   * @param userStatus {Object} - User status will be parsing.
   * @param isBot {Boolean} - Whether the user is a bot or not.
   */
  static parseStatus(
    userStatus?: Raw.TypeUserStatus,
    isBot: boolean = false,
  ): {
    status?: string;
    lastOnlineDate?: Date;
    nextOfflineDate?: Date;
  } {
    if (!userStatus || isBot || userStatus instanceof Raw.UserStatusEmpty) {
      return {
        status: undefined,
        lastOnlineDate: undefined,
        nextOfflineDate: undefined,
      };
    }
    if (userStatus instanceof Raw.UserStatusOnline) {
      userStatus as Raw.UserStatusOnline;
      return {
        status: 'online',
        lastOnlineDate: undefined,
        nextOfflineDate: new Date(userStatus.expires * 1000),
      };
    }
    if (userStatus instanceof Raw.UserStatusOffline) {
      userStatus as Raw.UserStatusOffline;
      return {
        status: 'offline',
        lastOnlineDate: new Date(userStatus.wasOnline * 1000),
        nextOfflineDate: undefined,
      };
    }
    if (userStatus instanceof Raw.UserStatusRecently) {
      userStatus as Raw.UserStatusRecently;
      return {
        status: 'recently',
        lastOnlineDate: undefined,
        nextOfflineDate: undefined,
      };
    }
    if (userStatus instanceof Raw.UserStatusLastWeek) {
      userStatus as Raw.UserStatusLastWeek;
      return {
        status: 'withinWeek',
        lastOnlineDate: undefined,
        nextOfflineDate: undefined,
      };
    }
    if (userStatus instanceof Raw.UserStatusLastMonth) {
      userStatus as Raw.UserStatusLastMonth;
      return {
        status: 'withinMonth',
        lastOnlineDate: undefined,
        nextOfflineDate: undefined,
      };
    }
    return {
      status: 'longTimeAgo',
      lastOnlineDate: undefined,
      nextOfflineDate: undefined,
    };
  }
  /**
   * Parse UpdateUserStatus to User class.
   * @param client {Object} - Snake Client.
   * @param userStatus {Object} - Update content will be convert to User class.
   */
  static parseUpdateStatus(client: Snake, userStatus: Raw.UpdateUserStatus): User {
    return new User(
      {
        id: userStatus.userId,
        ...User.parseStatus(userStatus.status),
      },
      client,
    );
  }
  // bound methods should be added here.
  /**
   * Generate a text mention for this user.
   * You can use `.mention()` to mention the user using their first name (styled using html), or `.mention({ name : "another name" })` for a custom name. <br/>
   * To choose a different style ("html" or "md"/"markdown") use `.mention({ style : "md" })`
   */
  mention({ name, style }: { name?: string; style?: 'html' | 'md' | 'markdown' } = {}): string {
    let _name = name ?? this.firstname;
    let _style = style ?? 'html';
    if (_style.toLowerCase() === 'md' || _style.toLowerCase() === 'markdown') {
      return `[${_name}](tg://user?id=${this.id})`;
    }
    return `<a href="tg://user?id=${this.id}">${_name}</a>`;
  }
  /**
   * Convert User class to InputPeer class. <br/>
   * This allows it to be used as a parameter when invoking Raw api.
   */
  get inputPeer(): Raw.InputPeerUser | Raw.InputPeerSelf {
    if (this.isSelf) {
      return new Raw.InputPeerSelf();
    }
    return new Raw.InputPeerUser({
      userId: this.id,
      accessHash: this.accessHash ?? BigInt(0),
    });
  }
}
