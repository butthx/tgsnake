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
import { getId } from '../../Utilities.ts';
import { User } from '../Advanced/User.ts';
import { Chat } from '../Advanced/Chat.ts';
import type { Snake } from '../../Client/index.ts';
// https://core.telegram.org/bots/api#chatmember
export type TypeChatMember =
  | ChatMemberOwner
  | ChatMemberAdministrator
  | ChatMemberMember
  | ChatMemberRestricted
  | ChatMemberLeft
  | ChatMemberBanned;
// https://core.telegram.org/bots/api#chatmemberupdated
export interface TypeChatMemberUpdated {
  chat: Chat;
  from: User;
  date: Date;
  viaChatFolderInviteLink: boolean;
  oldChatMember?: TypeChatMember;
  newChatMember?: TypeChatMember;
  inviteLink?: string;
}
export class ChatMemberUpdated extends TLObject {
  chat!: Chat;
  from!: User;
  date!: Date;
  viaChatFolderInviteLink!: boolean;
  oldChatMember?: TypeChatMember;
  newChatMember?: TypeChatMember;
  inviteLink?: string;
  constructor(
    {
      chat,
      from,
      date,
      viaChatFolderInviteLink,
      oldChatMember,
      newChatMember,
      inviteLink,
    }: TypeChatMemberUpdated,
    client: Snake,
  ) {
    super(client);
    this.chat = chat;
    this.from = from;
    this.date = date;
    this.oldChatMember = oldChatMember;
    this.newChatMember = newChatMember;
    this.viaChatFolderInviteLink = viaChatFolderInviteLink;
    this.inviteLink = inviteLink;
  }
  static parse(
    client: Snake,
    update: Raw.UpdateChannelParticipant | Raw.UpdateChatParticipant,
    chats: Array<Raw.TypeChat>,
    users: Array<Raw.TypeUser>,
  ): ChatMemberUpdated {
    if (update instanceof Raw.UpdateChatParticipant) {
      const chat = Chat.parseChat(
        client,
        chats.find((c) => c.id === (update as Raw.UpdateChatParticipant).chatId),
      ) as unknown as Chat;
      const user = User.parse(
        client,
        users.find((u) => u.id === (update as Raw.UpdateChatParticipant).userId),
      ) as unknown as User;
      return new ChatMemberUpdated(
        {
          chat: chat,
          from: user,
          date: new Date((update as Raw.UpdateChatParticipant).date * 1000),
          oldChatMember: ChatMember(
            client,
            users,
            (update as Raw.UpdateChatParticipant).prevParticipant,
          ),
          newChatMember: ChatMember(
            client,
            users,
            (update as Raw.UpdateChatParticipant).newParticipant,
          ),
          viaChatFolderInviteLink: false,
          // @ts-ignore
          inviteLink: (update as Raw.UpdateChatParticipant).invite?.link,
        },
        client,
      );
    }
    const chat = Chat.parseChannel(
      client,
      // @ts-ignore
      chats.find((c) => c.id === (update as Raw.UpdateChannelParticipant).channelId),
    ) as unknown as Chat;
    const user = User.parse(
      client,
      users.find((u) => u.id === (update as Raw.UpdateChannelParticipant).userId),
    ) as unknown as User;
    return new ChatMemberUpdated(
      {
        chat: chat,
        from: user,
        date: new Date((update as Raw.UpdateChannelParticipant).date * 1000),
        oldChatMember: ChatMember(
          client,
          users,
          (update as Raw.UpdateChannelParticipant).prevParticipant,
        ),
        newChatMember: ChatMember(
          client,
          users,
          (update as Raw.UpdateChannelParticipant).newParticipant,
        ),
        viaChatFolderInviteLink: (update as Raw.UpdateChannelParticipant).viaChatlist ?? false,
        // @ts-ignore
        inviteLink: (update as Raw.UpdateChannelParticipant).invite?.link,
      },
      client,
    );
  }
}
// https://core.telegram.org/bots/api#chatmemberowner
export interface TypeChatMemberOwner {
  status: 'creator';
  user: User;
  isAnonymous: boolean;
  customTitle?: string;
}
export class ChatMemberOwner extends TLObject {
  status!: 'creator';
  user!: User;
  isAnonymous!: boolean;
  customTitle?: string;
  constructor({ status, user, isAnonymous, customTitle }: TypeChatMemberOwner, client: Snake) {
    super(client);
    this.status = status;
    this.user = user;
    this.isAnonymous = isAnonymous;
    this.customTitle = customTitle;
  }
  static parse(
    client: Snake,
    member: Raw.ChannelParticipantCreator | Raw.ChatParticipantCreator,
    users: Array<Raw.TypeUser>,
  ): ChatMemberOwner {
    if (member instanceof Raw.ChatParticipantCreator) {
      const user = User.parse(
        client,
        users.find((u) => u.id === (member as Raw.ChatParticipantCreator).userId),
      ) as unknown as User;
      return new ChatMemberOwner(
        {
          status: 'creator',
          isAnonymous: false,
          user: user,
        },
        client,
      );
    }
    const user = User.parse(
      client,
      users.find((u) => u.id === (member as Raw.ChannelParticipantCreator).userId),
    ) as unknown as User;
    return new ChatMemberOwner(
      {
        status: 'creator',
        user: user,
        customTitle: (member as Raw.ChannelParticipantCreator).rank,
        isAnonymous: (member as Raw.ChannelParticipantCreator).adminRights.anonymous || false,
      },
      client,
    );
  }
}
// https://core.telegram.org/bots/api#chatmemberadministrator
export interface TypeChatMemberAdministrator {
  status: 'administrator';
  user: User;
  canBeEdited: boolean;
  isAnonymous: boolean;
  canManageChat: boolean;
  canDeleteMessages: boolean;
  canRestrictMembers: boolean;
  canManageVideoChats: boolean;
  canPromoteMembers: boolean;
  canChangeInfo: boolean;
  canInviteUsers: boolean;
  joinedDate: Date;
  canPostMessages?: boolean;
  canEditMessages?: boolean;
  canPinMessages?: boolean;
  canManageTopics?: boolean;
  customTitle?: string;
}
export class ChatMemberAdministrator extends TLObject {
  status!: 'administrator';
  user!: User;
  canBeEdited!: boolean;
  isAnonymous!: boolean;
  canManageChat!: boolean;
  canDeleteMessages!: boolean;
  canRestrictMembers!: boolean;
  canManageVideoChats!: boolean;
  canPromoteMembers!: boolean;
  canChangeInfo!: boolean;
  canInviteUsers!: boolean;
  joinedDate!: Date;
  canPostMessages?: boolean;
  canEditMessages?: boolean;
  canPinMessages?: boolean;
  canManageTopics?: boolean;
  customTitle?: string;
  constructor(
    {
      status,
      user,
      canBeEdited,
      isAnonymous,
      canManageChat,
      canDeleteMessages,
      canRestrictMembers,
      canManageVideoChats,
      canPromoteMembers,
      canChangeInfo,
      canInviteUsers,
      joinedDate,
      canPostMessages,
      canEditMessages,
      canPinMessages,
      canManageTopics,
      customTitle,
    }: TypeChatMemberAdministrator,
    client: Snake,
  ) {
    super(client);
    this.status = status;
    this.user = user;
    this.canBeEdited = canBeEdited;
    this.isAnonymous = isAnonymous;
    this.canManageChat = canManageChat;
    this.canDeleteMessages = canDeleteMessages;
    this.canRestrictMembers = canRestrictMembers;
    this.canManageVideoChats = canManageVideoChats;
    this.canPromoteMembers = canPromoteMembers;
    this.canChangeInfo = canChangeInfo;
    this.canInviteUsers = canInviteUsers;
    this.joinedDate = joinedDate;
    this.canPostMessages = canPostMessages;
    this.canEditMessages = canEditMessages;
    this.canPinMessages = canPinMessages;
    this.canManageTopics = canManageTopics;
    this.customTitle = customTitle;
  }
  static parse(
    client: Snake,
    member: Raw.ChatParticipantAdmin | Raw.ChannelParticipantAdmin,
    users: Array<Raw.TypeUser>,
  ): ChatMemberAdministrator {
    if (member instanceof Raw.ChatParticipantAdmin) {
      const user = User.parse(
        client,
        users.find((u) => u.id === (member as Raw.ChatParticipantAdmin).userId),
      ) as unknown as User;
      return new ChatMemberAdministrator(
        {
          status: 'administrator',
          user: user,
          canBeEdited: true,
          isAnonymous: false,
          canManageChat: true,
          canDeleteMessages: true,
          canRestrictMembers: true,
          canManageVideoChats: true,
          canPromoteMembers: true,
          canChangeInfo: true,
          canInviteUsers: true,
          joinedDate: new Date((member as Raw.ChatParticipantAdmin).date * 1000),
        },
        client,
      );
    }
    const user = User.parse(
      client,
      users.find((u) => u.id === (member as Raw.ChannelParticipantAdmin).userId),
    ) as unknown as User;
    return new ChatMemberAdministrator(
      {
        status: 'administrator',
        user: user,
        canBeEdited: (member as Raw.ChannelParticipantAdmin).canEdit ?? true,
        isAnonymous:
          ((member as Raw.ChannelParticipantAdmin).adminRights as Raw.ChatAdminRights).anonymous ??
          false,
        canManageChat:
          ((member as Raw.ChannelParticipantAdmin).adminRights as Raw.ChatAdminRights).other ??
          true,
        canDeleteMessages:
          ((member as Raw.ChannelParticipantAdmin).adminRights as Raw.ChatAdminRights)
            .deleteMessages ?? true,
        canRestrictMembers:
          ((member as Raw.ChannelParticipantAdmin).adminRights as Raw.ChatAdminRights).banUsers ??
          true,
        canManageVideoChats:
          ((member as Raw.ChannelParticipantAdmin).adminRights as Raw.ChatAdminRights).manageCall ??
          true,
        canPromoteMembers:
          ((member as Raw.ChannelParticipantAdmin).adminRights as Raw.ChatAdminRights).addAdmins ??
          true,
        canChangeInfo:
          ((member as Raw.ChannelParticipantAdmin).adminRights as Raw.ChatAdminRights).changeInfo ??
          true,
        canInviteUsers:
          ((member as Raw.ChannelParticipantAdmin).adminRights as Raw.ChatAdminRights)
            .inviteUsers ?? true,
        joinedDate: new Date((member as Raw.ChannelParticipantAdmin).date * 1000),
        canPostMessages: (
          (member as Raw.ChannelParticipantAdmin).adminRights as Raw.ChatAdminRights
        ).postMessages,
        canEditMessages: (
          (member as Raw.ChannelParticipantAdmin).adminRights as Raw.ChatAdminRights
        ).editMessages,
        canPinMessages: ((member as Raw.ChannelParticipantAdmin).adminRights as Raw.ChatAdminRights)
          .pinMessages,
        canManageTopics: (
          (member as Raw.ChannelParticipantAdmin).adminRights as Raw.ChatAdminRights
        ).manageTopics,
        customTitle: (member as Raw.ChannelParticipantAdmin).rank,
      },
      client,
    );
  }
}
// https://core.telegram.org/bots/api#chatmembermember
export interface TypeChatMemberMember {
  status: 'member';
  user: User;
  joinedDate: Date;
}
export class ChatMemberMember extends TLObject {
  status!: 'member';
  user!: User;
  joinedDate!: Date;
  constructor({ status, user, joinedDate }: TypeChatMemberMember, client: Snake) {
    super(client);
    this.status = status;
    this.user = user;
    this.joinedDate = joinedDate;
  }
  static parse(
    client: Snake,
    member: Raw.ChatParticipant | Raw.ChannelParticipant | Raw.ChannelParticipantSelf,
    users: Array<Raw.TypeUser>,
  ): ChatMemberMember {
    if (member instanceof Raw.ChatParticipant) {
      const user = User.parse(
        client,
        users.find((u) => u.id === (member as Raw.ChatParticipant).userId),
      ) as unknown as User;
      return new ChatMemberMember(
        {
          status: 'member',
          user: user,
          joinedDate: new Date((member as Raw.ChatParticipant).date * 1000),
        },
        client,
      );
    }
    if (member instanceof Raw.ChannelParticipantSelf) {
      const user = User.parse(
        client,
        users.find((u) => u.id === (member as Raw.ChannelParticipantSelf).userId),
      ) as unknown as User;
      return new ChatMemberMember(
        {
          status: 'member',
          user: user,
          joinedDate: new Date((member as Raw.ChannelParticipantSelf).date * 1000),
        },
        client,
      );
    }
    const user = User.parse(
      client,
      users.find((u) => u.id === (member as Raw.ChannelParticipant).userId),
    ) as unknown as User;
    return new ChatMemberMember(
      {
        status: 'member',
        user: user,
        joinedDate: new Date((member as Raw.ChannelParticipant).date * 1000),
      },
      client,
    );
  }
}
// https://core.telegram.org/bots/api#chatmemberrestricted
export interface TypeChatMemberRestricted {
  status: 'restricted';
  user: User;
  isMember: boolean;
  canSendMessages: boolean;
  canSendAudios: boolean;
  canSendDocument: boolean;
  canSendPhotos: boolean;
  canSendVideos: boolean;
  canSendVideoNotes: boolean;
  canSendVoiceNotes: boolean;
  canSendPolls: boolean;
  canSendOtherMessages: boolean;
  canAddWebPagePreviews: boolean;
  canChangeInfo: boolean;
  canInviteUsers: boolean;
  canPinMessages: boolean;
  canManageTopics: boolean;
  untilDate: typeof Infinity | Date;
  joinedDate: Date;
}
export class ChatMemberRestricted extends TLObject {
  status!: 'restricted';
  user!: User;
  isMember!: boolean;
  canSendMessages!: boolean;
  canSendAudios!: boolean;
  canSendDocument!: boolean;
  canSendPhotos!: boolean;
  canSendVideos!: boolean;
  canSendVideoNotes!: boolean;
  canSendVoiceNotes!: boolean;
  canSendPolls!: boolean;
  canSendOtherMessages!: boolean;
  canAddWebPagePreviews!: boolean;
  canChangeInfo!: boolean;
  canInviteUsers!: boolean;
  canPinMessages!: boolean;
  canManageTopics!: boolean;
  untilDate!: typeof Infinity | Date;
  joinedDate!: Date;
  constructor(
    {
      status,
      user,
      isMember,
      canSendMessages,
      canSendAudios,
      canSendDocument,
      canSendPhotos,
      canSendVideos,
      canSendVideoNotes,
      canSendVoiceNotes,
      canSendPolls,
      canSendOtherMessages,
      canAddWebPagePreviews,
      canChangeInfo,
      canInviteUsers,
      canPinMessages,
      canManageTopics,
      untilDate,
      joinedDate,
    }: TypeChatMemberRestricted,
    client: Snake,
  ) {
    super(client);
    this.status = status;
    this.user = user;
    this.isMember = isMember;
    this.canSendMessages = canSendMessages;
    this.canSendAudios = canSendAudios;
    this.canSendDocument = canSendDocument;
    this.canSendPhotos = canSendPhotos;
    this.canSendVideos = canSendVideos;
    this.canSendVideoNotes = canSendVideoNotes;
    this.canSendVoiceNotes = canSendVoiceNotes;
    this.canSendPolls = canSendPolls;
    this.canSendOtherMessages = canSendOtherMessages;
    this.canAddWebPagePreviews = canAddWebPagePreviews;
    this.canChangeInfo = canChangeInfo;
    this.canInviteUsers = canInviteUsers;
    this.canPinMessages = canPinMessages;
    this.canManageTopics = canManageTopics;
    this.untilDate = untilDate;
    this.joinedDate = joinedDate;
  }
  static parse(
    client: Snake,
    member: Raw.ChannelParticipantBanned,
    users: Array<Raw.TypeUser>,
  ): ChatMemberRestricted {
    const uid = getId(member.peer) ?? BigInt(0);
    const user = User.parse(
      client,
      users.find((u) => u.id === uid),
    ) as unknown as User;
    return new ChatMemberRestricted(
      {
        status: 'restricted',
        user: user,
        isMember: Boolean(!member.left),
        canSendMessages: Boolean(!member.bannedRights.sendMessages),
        canSendAudios: Boolean(!member.bannedRights.sendMedia && !member.bannedRights.sendAudios),
        canSendDocument: Boolean(!member.bannedRights.sendMedia && !member.bannedRights.sendDocs),
        canSendPhotos: Boolean(!member.bannedRights.sendMedia && !member.bannedRights.sendPhotos),
        canSendVideos: Boolean(!member.bannedRights.sendMedia && !member.bannedRights.sendVideos),
        canSendVideoNotes: Boolean(
          !member.bannedRights.sendMedia && !member.bannedRights.sendRoundvideos,
        ),
        canSendVoiceNotes: Boolean(
          !member.bannedRights.sendMedia && !member.bannedRights.sendVoices,
        ),
        canSendPolls: Boolean(!member.bannedRights.sendMedia && !member.bannedRights.sendPolls),
        canSendOtherMessages: [
          Boolean(!member.bannedRights.sendMedia && !member.bannedRights.sendStickers),
          Boolean(!member.bannedRights.sendMedia && !member.bannedRights.sendGifs),
          Boolean(!member.bannedRights.sendInline),
          Boolean(!member.bannedRights.sendGames),
        ].some((x) => x),
        canAddWebPagePreviews: Boolean(!member.bannedRights.embedLinks),
        canChangeInfo: Boolean(!member.bannedRights.changeInfo),
        canInviteUsers: Boolean(!member.bannedRights.inviteUsers),
        canPinMessages: Boolean(!member.bannedRights.pinMessages),
        canManageTopics: Boolean(!member.bannedRights.manageTopics),
        untilDate:
          member.bannedRights.untilDate < 30
            ? Infinity
            : new Date(member.bannedRights.untilDate * 1000),
        joinedDate: new Date(member.date * 1000),
      },
      client,
    );
  }
}
// https://core.telegram.org/bots/api#chatmemberleft
export interface TypeChatMemberLeft {
  status: 'left';
  user: User;
}
export class ChatMemberLeft extends TLObject {
  status!: 'left';
  user!: User;
  constructor({ status, user }: TypeChatMemberLeft, client: Snake) {
    super(client);
    this.status = status;
    this.user = user;
  }
  static parse(
    client: Snake,
    member: Raw.ChannelParticipantLeft,
    users: Array<Raw.TypeUser>,
  ): ChatMemberLeft {
    const uid = getId(member.peer) ?? BigInt(0);
    const user = User.parse(
      client,
      users.find((u) => u.id === uid),
    ) as unknown as User;
    return new ChatMemberLeft(
      {
        status: 'left',
        user: user,
      },
      client,
    );
  }
}
// https://core.telegram.org/bots/api#chatmemberbanned
export interface TypeChatMemberBanned {
  status: 'kicked' | 'banned';
  user: User;
  untilDate: typeof Infinity | Date;
  joinedDate: Date;
}
export class ChatMemberBanned extends TLObject {
  status!: 'kicked' | 'banned';
  user!: User;
  untilDate!: typeof Infinity | Date;
  joinedDate!: Date;
  constructor({ status, user, untilDate, joinedDate }: TypeChatMemberBanned, client: Snake) {
    super(client);
    this.status = status;
    this.user = user;
    this.untilDate = untilDate;
    this.joinedDate = joinedDate;
  }
  static parse(
    client: Snake,
    member: Raw.ChannelParticipantBanned,
    users: Array<Raw.TypeUser>,
  ): ChatMemberBanned {
    const uid = getId(member.peer) ?? BigInt(0);
    const user = User.parse(
      client,
      users.find((u) => u.id === uid),
    ) as unknown as User;
    return new ChatMemberBanned(
      {
        status: member.bannedRights.viewMessages ? 'banned' : 'kicked',
        user: user,
        untilDate:
          member.bannedRights.untilDate < 30
            ? Infinity
            : new Date(member.bannedRights.untilDate * 1000),
        joinedDate: new Date(member.date * 1000),
      },
      client,
    );
  }
}
export function ChatMember(
  client: Snake,
  users: Array<Raw.TypeUser>,
  member?: Raw.TypeChatParticipant | Raw.TypeChannelParticipant,
): TypeChatMember | undefined {
  if (member) {
    if (
      member instanceof Raw.ChannelParticipantCreator ||
      member instanceof Raw.ChatParticipantCreator
    ) {
      return ChatMemberOwner.parse(client, member!, users);
    }
    if (
      member instanceof Raw.ChannelParticipantAdmin ||
      member instanceof Raw.ChatParticipantAdmin
    ) {
      return ChatMemberAdministrator.parse(client, member!, users);
    }
    if (member instanceof Raw.ChannelParticipantLeft) {
      return ChatMemberLeft.parse(client, member!, users);
    }
    if (member instanceof Raw.ChannelParticipantBanned) {
      if ((member as Raw.ChannelParticipantBanned).left) {
        return ChatMemberBanned.parse(client, member!, users);
      }
      return ChatMemberRestricted.parse(client, member!, users);
    }
    return ChatMemberMember.parse(client, member!, users);
  }
}
