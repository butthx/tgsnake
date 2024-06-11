/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2024 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { TLObject } from '../TL.ts';
import {
  Raw,
  Parser,
  Cryptos,
  Buffer,
  type Entities,
  type Readable,
  type Files,
} from '../../platform.deno.ts';
import * as Advanceds from '../Advanced/index.ts';
import * as Medias from './Medias/index.ts';
import * as ReplyMarkup from './ReplyMarkup.ts';
import { getId, getPeerId } from '../../Utilities.ts';
import { Logger } from '../../Context/Logger.ts';
import type { Snake } from '../../Client/index.ts';
import type {
  sendMessageParams,
  sendDocumentParams,
  sendVideoParams,
  sendVideoNoteParams,
  sendAnimationParams,
  sendStickerParams,
} from '../../Methods/Messages/index.ts';

export interface TypeMessage {
  id: number;
  outgoing?: boolean;
  date?: Date;
  chat?: Advanceds.Chat;
  from?: Advanceds.User;
  threadId?: number;
  senderChat?: Advanceds.Chat;
  forwardFrom?: Advanceds.User;
  forwardFromChat?: Advanceds.Chat;
  forwardFromMessageId?: number;
  forwardSignature?: string;
  forwardSenderName?: string;
  forwardDate?: Date;
  isTopicMessage?: boolean;
  isAutomaticForward?: boolean;
  replyToMessage?: Message;
  replyToMessageId?: number;
  replyToTopMessageId?: number;
  mentioned?: boolean;
  empty?: boolean;
  viaBot?: Advanceds.User;
  hasProtectedContent?: boolean;
  mediaGroupId?: bigint;
  authorSignatrure?: string;
  text?: string;
  entities?: Array<Entities>;
  animation?: Medias.Animation;
  audio?: Medias.Audio;
  document?: Medias.Document;
  photo?: Medias.Photo;
  sticker?: Medias.Sticker;
  video?: Medias.Video;
  videoNote?: Medias.VideoNote;
  voice?: Medias.Voice;
  webpage?: Medias.WebPage;
  caption?: string;
  captionEntities?: Array<Entities>;
  hasSpoilerMode?: boolean;
  contact?: Medias.Contact;
  dice?: Medias.Dice;
  game?: Medias.Game;
  poll?: Medias.Poll;
  venue?: Medias.Venue;
  location?: Medias.Location;
  newChatMembers?: Array<Advanceds.User>;
  leftChatMember?: Advanceds.User;
  newChatTitle?: string;
  newChatPhoto?: Medias.Photo;
  deleteChatPhoto?: boolean;
  groupChatCreated?: boolean;
  channelChatCreated?: boolean;
  messageAutoDeleteTimeChanged?: boolean;
  migrateToChatId?: bigint;
  migrateFromChatId?: bigint;
  pinnedMessage?: Message;
  invoice?: any;
  successfulPayment?: any;
  userShared?: any;
  chatShared?: any;
  connectedWebsite?: string;
  writeAccessAllowed?: any;
  passportData?: any;
  forumTopicCreated?: Raw.MessageActionTopicCreate;
  forumTopicEdited?: Raw.MessageActionTopicEdit;
  videoChatScheduled?: Date;
  videoChatEnded?: number;
  videoChatStarted?: boolean;
  videoChatParticipantInvalid?: any;
  videoChatInvited?: Array<Advanceds.User>;
  webAppData?: Advanceds.WebAppData;
  replyMarkup?: ReplyMarkup.TypeReplyMarkup;
  giftPremium?: Raw.MessageActionGiftPremium;
  chatThemeChanged?: Raw.MessageActionSetChatTheme;
  screenshot?: boolean;
  ttl?: number;
  replyToStoryId?: number;
  repliedStoryFrom?: Advanceds.Chat;
}
export class Message extends TLObject {
  id!: number;
  outgoing?: boolean;
  date?: Date;
  chat?: Advanceds.Chat;
  from?: Advanceds.User;
  threadId?: number;
  senderChat?: Advanceds.Chat;
  forwardFrom?: Advanceds.User;
  forwardFromChat?: Advanceds.Chat;
  forwardFromMessageId?: number;
  forwardSignature?: string;
  forwardSenderName?: string;
  forwardDate?: Date;
  isTopicMessage?: boolean;
  isAutomaticForward?: boolean;
  replyToMessage?: Message;
  replyToMessageId?: number;
  replyToTopMessageId?: number;
  mentioned?: boolean;
  empty?: boolean;
  viaBot?: Advanceds.User;
  hasProtectedContent?: boolean;
  mediaGroupId?: bigint;
  authorSignatrure?: string;
  text?: string;
  entities?: Array<Entities>;
  animation?: Medias.Animation;
  audio?: Medias.Audio;
  document?: Medias.Document;
  photo?: Medias.Photo;
  sticker?: Medias.Sticker;
  video?: Medias.Video;
  videoNote?: Medias.VideoNote;
  voice?: Medias.Voice;
  caption?: string;
  captionEntities?: Array<Entities>;
  hasSpoilerMode?: boolean;
  contact?: Medias.Contact;
  dice?: Medias.Dice;
  game?: Medias.Game;
  poll?: Medias.Poll;
  venue?: Medias.Venue;
  location?: Medias.Location;
  webpage?: Medias.WebPage;
  newChatMembers?: Array<Advanceds.User>;
  leftChatMember?: Advanceds.User;
  newChatTitle?: string;
  newChatPhoto?: Medias.Photo;
  deleteChatPhoto?: boolean;
  groupChatCreated?: boolean;
  channelChatCreated?: boolean;
  messageAutoDeleteTimeChanged?: boolean;
  migrateToChatId?: bigint;
  migrateFromChatId?: bigint;
  pinnedMessage?: Message;
  invoice?: any;
  successfulPayment?: any;
  userShared?: any;
  chatShared?: any;
  connectedWebsite?: string;
  writeAccessAllowed?: any;
  passportData?: any;
  forumTopicCreated?: Raw.MessageActionTopicCreate;
  forumTopicEdited?: Raw.MessageActionTopicEdit;
  videoChatScheduled?: Date;
  videoChatEnded?: number;
  videoChatStarted?: boolean;
  videoChatParticipantInvalid?: any;
  videoChatInvited?: Array<Advanceds.User>;
  webAppData?: Advanceds.WebAppData;
  replyMarkup?: ReplyMarkup.TypeReplyMarkup;
  giftPremium?: Raw.MessageActionGiftPremium;
  chatThemeChanged?: Raw.MessageActionSetChatTheme;
  screenshot?: boolean;
  ttl?: number;
  replyToStoryId?: number;
  repliedStoryFrom?: Advanceds.Chat;
  constructor(
    {
      id,
      outgoing,
      date,
      chat,
      from,
      threadId,
      senderChat,
      forwardFrom,
      forwardFromChat,
      forwardFromMessageId,
      forwardSignature,
      forwardSenderName,
      forwardDate,
      isTopicMessage,
      isAutomaticForward,
      replyToMessage,
      replyToMessageId,
      replyToTopMessageId,
      mentioned,
      empty,
      viaBot,
      hasProtectedContent,
      mediaGroupId,
      authorSignatrure,
      text,
      entities,
      animation,
      audio,
      document,
      photo,
      sticker,
      video,
      videoNote,
      voice,
      webpage,
      caption,
      captionEntities,
      hasSpoilerMode,
      contact,
      dice,
      game,
      poll,
      venue,
      location,
      newChatMembers,
      leftChatMember,
      newChatTitle,
      newChatPhoto,
      deleteChatPhoto,
      groupChatCreated,
      channelChatCreated,
      messageAutoDeleteTimeChanged,
      migrateToChatId,
      migrateFromChatId,
      pinnedMessage,
      invoice,
      successfulPayment,
      userShared,
      chatShared,
      connectedWebsite,
      writeAccessAllowed,
      passportData,
      forumTopicCreated,
      forumTopicEdited,
      videoChatScheduled,
      videoChatEnded,
      videoChatStarted,
      videoChatParticipantInvalid,
      videoChatInvited,
      webAppData,
      replyMarkup,
      giftPremium,
      chatThemeChanged,
      screenshot,
      ttl,
      replyToStoryId,
      repliedStoryFrom,
    }: TypeMessage,
    client: Snake,
  ) {
    super(client);
    this.id = id;
    this.outgoing = outgoing;
    this.date = date;
    this.chat = chat;
    this.from = from;
    this.threadId = threadId;
    this.senderChat = senderChat;
    this.forwardFrom = forwardFrom;
    this.forwardFromChat = forwardFromChat;
    this.forwardFromMessageId = forwardFromMessageId;
    this.forwardSignature = forwardSignature;
    this.forwardSenderName = forwardSenderName;
    this.forwardDate = forwardDate;
    this.isTopicMessage = isTopicMessage;
    this.isAutomaticForward = isAutomaticForward;
    this.replyToMessage = replyToMessage;
    this.replyToMessageId = replyToMessageId;
    this.replyToTopMessageId = replyToTopMessageId;
    this.mentioned = mentioned;
    this.empty = empty;
    this.viaBot = viaBot;
    this.hasProtectedContent = hasProtectedContent;
    this.mediaGroupId = mediaGroupId;
    this.authorSignatrure = authorSignatrure;
    this.text = text;
    this.entities = entities;
    this.animation = animation;
    this.audio = audio;
    this.document = document;
    this.photo = photo;
    this.sticker = sticker;
    this.video = video;
    this.videoNote = videoNote;
    this.voice = voice;
    this.webpage = webpage;
    this.caption = caption;
    this.captionEntities = captionEntities;
    this.hasSpoilerMode = hasSpoilerMode;
    this.contact = contact;
    this.dice = dice;
    this.game = game;
    this.poll = poll;
    this.venue = venue;
    this.location = location;
    this.newChatMembers = newChatMembers;
    this.leftChatMember = leftChatMember;
    this.newChatTitle = newChatTitle;
    this.newChatPhoto = newChatPhoto;
    this.deleteChatPhoto = deleteChatPhoto;
    this.groupChatCreated = groupChatCreated;
    this.channelChatCreated = channelChatCreated;
    this.messageAutoDeleteTimeChanged = messageAutoDeleteTimeChanged;
    this.migrateToChatId = migrateToChatId;
    this.migrateFromChatId = migrateFromChatId;
    this.pinnedMessage = pinnedMessage;
    this.invoice = invoice;
    this.successfulPayment = successfulPayment;
    this.userShared = userShared;
    this.chatShared = chatShared;
    this.connectedWebsite = connectedWebsite;
    this.writeAccessAllowed = writeAccessAllowed;
    this.passportData = passportData;
    this.forumTopicCreated = forumTopicCreated;
    this.forumTopicEdited = forumTopicEdited;
    this.videoChatScheduled = videoChatScheduled;
    this.videoChatEnded = videoChatEnded;
    this.videoChatStarted = videoChatStarted;
    this.videoChatParticipantInvalid = videoChatParticipantInvalid;
    this.videoChatInvited = videoChatInvited;
    this.webAppData = webAppData;
    this.replyMarkup = replyMarkup;
    this.giftPremium = giftPremium;
    this.chatThemeChanged = chatThemeChanged;
    this.screenshot = screenshot;
    this.ttl = ttl;
    this.replyToStoryId = replyToStoryId;
    this.repliedStoryFrom = repliedStoryFrom;
  }
  static async parse(
    client: Snake,
    message: Raw.TypeMessage,
    chats: Array<Raw.TypeChat>,
    users: Array<Raw.TypeUser>,
    replies: number = 1,
  ) {
    if (!(message instanceof Raw.MessageEmpty)) {
      const fromId = getId(message.fromId!);
      const peerId = getId(message.peerId!);
      const userId = fromId ?? peerId;
      if (
        message.fromId &&
        message.fromId instanceof Raw.PeerUser &&
        message.peerId instanceof Raw.PeerUser
      ) {
        let hasFromId = users.some((user) => fromId === user.id);
        let hasPeerId = users.some((user) => peerId === user.id);
        if (!hasFromId || !hasPeerId) {
          let user = await client._client.invoke(
            new Raw.users.GetUsers({
              id: [
                await client._client.resolvePeer(fromId!),
                await client._client.resolvePeer(peerId!),
              ],
            }),
          );
          users = users.concat(user);
        }
      }
      if (message instanceof Raw.MessageService) {
        message as Raw.MessageService;
        let from = Advanceds.User.parse(
          client,
          users.find((user) => user.id === userId),
        );
        let senderChat = from
          ? undefined
          : Advanceds.Chat.parseMessage(client, message, users, chats, false);
        let chat = Advanceds.Chat.parseMessage(client, message, users, chats, true);
        let parsedMessage = new Message(
          {
            from,
            senderChat,
            chat,
            outgoing: message.out,
            id: message.id,
            empty: false,
            date: new Date(message.date * 1000),
            mentioned: message.mentioned,
          },
          client,
        );
        if (message.action) {
          const action = message.action;
          if (action instanceof Raw.MessageActionChatCreate) {
            parsedMessage.groupChatCreated = true;
          } else if (action instanceof Raw.MessageActionChatEditTitle) {
            parsedMessage.newChatTitle = (action as Raw.MessageActionChatEditTitle).title;
          } else if (action instanceof Raw.MessageActionChatEditPhoto) {
            if ((action as Raw.MessageActionChatEditPhoto).photo instanceof Raw.Photo) {
              parsedMessage.newChatPhoto = Medias.Photo.parse(
                client,
                (action as Raw.MessageActionChatEditPhoto).photo as Raw.Photo,
              );
            }
          } else if (action instanceof Raw.MessageActionChatDeletePhoto) {
            parsedMessage.deleteChatPhoto = true;
          } else if (action instanceof Raw.MessageActionChatAddUser) {
            parsedMessage.newChatMembers = (action as Raw.MessageActionChatAddUser).users
              .map((id) =>
                Advanceds.User.parse(
                  client,
                  users.find((u) => u.id === id),
                ),
              )
              .filter((u) => u !== undefined) as unknown as Array<Advanceds.User>;
          } else if (action instanceof Raw.MessageActionChatDeleteUser) {
            parsedMessage.leftChatMember = Advanceds.User.parse(
              client,
              users.find((u) => u.id === (action as Raw.MessageActionChatDeleteUser).userId),
            );
          } else if (action instanceof Raw.MessageActionChatJoinedByLink) {
            parsedMessage.newChatMembers = [
              Advanceds.User.parse(
                client,
                users.find((u) => u.id === getId(message.fromId!)),
              ),
            ].filter((u) => u !== undefined) as unknown as Array<Advanceds.User>;
          } else if (action instanceof Raw.MessageActionChannelCreate) {
            parsedMessage.channelChatCreated = true;
          } else if (action instanceof Raw.MessageActionChatMigrateTo) {
            parsedMessage.migrateToChatId = (action as Raw.MessageActionChatMigrateTo).channelId;
          } else if (action instanceof Raw.MessageActionGroupCall) {
            if ((action as Raw.MessageActionGroupCall).duration) {
              parsedMessage.videoChatEnded = (action as Raw.MessageActionGroupCall).duration;
            } else {
              parsedMessage.videoChatStarted = true;
            }
          } else if (action instanceof Raw.MessageActionInviteToGroupCall) {
            parsedMessage.videoChatInvited = (action as Raw.MessageActionInviteToGroupCall).users
              .map((id) =>
                Advanceds.User.parse(
                  client,
                  users.find((u) => u.id === id),
                ),
              )
              .filter((u) => u !== undefined) as unknown as Array<Advanceds.User>;
          } else if (action instanceof Raw.MessageActionGroupCallScheduled) {
            parsedMessage.videoChatScheduled = new Date(
              (action as Raw.MessageActionGroupCallScheduled).scheduleDate * 1000,
            );
          } else if (action instanceof Raw.MessageActionChannelMigrateFrom) {
            parsedMessage.migrateFromChatId = (
              action as Raw.MessageActionChannelMigrateFrom
            ).chatId;
          } else if (action instanceof Raw.MessageActionPinMessage) {
            try {
              parsedMessage.pinnedMessage = (
                await client.api.getMessages(parsedMessage.chat?.id!, [], [message.id], 0)
              )[0];
            } catch (error) {}
          } else if (action instanceof Raw.MessageActionTopicCreate) {
            parsedMessage.forumTopicCreated = action as Raw.MessageActionTopicCreate;
          } else if (action instanceof Raw.MessageActionTopicEdit) {
            parsedMessage.forumTopicEdited = action as Raw.MessageActionTopicEdit;
          }
        }
        if (message.replyTo) {
          if (message.replyTo instanceof Raw.MessageReplyHeader) {
            parsedMessage.isTopicMessage =
              (message.replyTo as Raw.MessageReplyHeader)?.forumTopic ?? false;
            parsedMessage.replyToMessageId = (
              message.replyTo as Raw.MessageReplyHeader
            )?.replyToMsgId;
            parsedMessage.replyToTopMessageId = (
              message.replyTo as Raw.MessageReplyHeader
            )?.replyToTopId;
            if (replies) {
              let cchat = client._cacheMessage.get(parsedMessage.chat?.id!);
              if (cchat) {
                let cmsg = cchat.get(parsedMessage?.replyToMessageId!);
                if (cmsg) {
                  parsedMessage.replyToMessage = cmsg;
                } else {
                  try {
                    let fmsg = await client.api.getMessages(
                      parsedMessage.chat?.id!,
                      [],
                      [message.id],
                      replies - 1,
                    );
                    parsedMessage.replyToMessage = fmsg[0];
                  } catch (error) {}
                }
              }
            }
          }
        }
        if (message.ttlPeriod) {
          parsedMessage.ttl = message.ttlPeriod;
        }
        return parsedMessage;
      }
      if (message instanceof Raw.Message) {
        message as Raw.Message;
        let entities: Array<Entities> = Parser.fromRaw(message.entities ?? []).sort(
          (a, b) => a.offset - b.offset,
        );
        let forwardFrom;
        let forwardFromChat;
        let forwardFromMessageId;
        let forwardSignature;
        let forwardSenderName;
        let forwardDate;
        if (message.fwdFrom) {
          forwardDate = new Date(message.fwdFrom.date * 1000);
          if (message.fwdFrom.fromId) {
            let afromId = getId(message.fwdFrom.fromId!);
            let bfromId = getPeerId(message.fwdFrom.fromId!);
            if (bfromId !== undefined && bfromId > 0) {
              forwardFrom = Advanceds.User.parse(
                client,
                users.find((user) => user.id === afromId),
              );
            } else {
              forwardFromChat = Advanceds.Chat.parseDialog(
                client,
                message.fwdFrom.fromId!,
                users,
                chats,
              );
              forwardFromMessageId = message.fwdFrom.channelPost;
              forwardSignature = message.fwdFrom.postAuthor;
            }
          } else if (message.fwdFrom.fromName) {
            forwardSenderName = message.fwdFrom.fromName;
          }
        }
        let animation;
        let audio;
        let document;
        let photo;
        let sticker;
        let video;
        let videoNote;
        let voice;
        let hasSpoilerMode;
        let contact;
        let dice;
        let game;
        let poll;
        let venue;
        let location;
        let webpage;
        if (message.media && !(message.media instanceof Raw.MessageMediaEmpty)) {
          if (message.media instanceof Raw.MessageMediaPhoto) {
            hasSpoilerMode = (message.media as Raw.MessageMediaPhoto).spoiler ?? false;
            if (message.media.photo instanceof Raw.Photo) {
              photo = Medias.Photo.parse(
                client,
                (message.media as Raw.MessageMediaPhoto).photo as Raw.Photo,
              );
            }
          }
          if (message.media instanceof Raw.MessageMediaGeo) {
            location = Medias.Location.parse(client, (message.media as Raw.MessageMediaGeo).geo);
          }
          if (message.media instanceof Raw.MessageMediaContact) {
            contact = Medias.Contact.parse(client, message.media as Raw.MessageMediaContact);
          }
          if (message.media instanceof Raw.MessageMediaVenue) {
            venue = Medias.Venue.parse(client, message.media as Raw.MessageMediaVenue);
          }
          if (message.media instanceof Raw.MessageMediaGame) {
            if (message.media.game instanceof Raw.Game) {
              game = Medias.Game.parse(
                client,
                (message.media as Raw.MessageMediaGame).game as Raw.Game,
              );
            }
          }
          if (message.media instanceof Raw.MessageMediaPoll) {
            poll = Medias.Poll.parse(client, message.media as Raw.MessageMediaPoll);
          }
          if (message.media instanceof Raw.MessageMediaDice) {
            dice = Medias.Dice.parse(client, message.media as Raw.MessageMediaDice);
          }
          if (message.media instanceof Raw.MessageMediaWebPage) {
            if (message.media.webpage instanceof Raw.WebPage) {
              webpage = Medias.WebPage.parse(
                client,
                (message.media as Raw.MessageMediaWebPage).webpage as Raw.WebPage,
              );
            }
          }
          if (message.media instanceof Raw.MessageMediaDocument) {
            hasSpoilerMode = (message.media as Raw.MessageMediaDocument).spoiler ?? false;
            let doc = (message.media as Raw.MessageMediaDocument).document as Raw.Document;
            if (
              doc.attributes.some((attribute) => attribute instanceof Raw.DocumentAttributeAudio)
            ) {
              let attr = doc.attributes.find(
                (attribute) => attribute instanceof Raw.DocumentAttributeAudio,
              );
              if ((attr as Raw.DocumentAttributeAudio)?.voice) {
                voice = Medias.Voice.parse(client, doc);
              } else {
                audio = Medias.Audio.parse(client, doc);
              }
            } else if (
              doc.attributes.some((attribute) => attribute instanceof Raw.DocumentAttributeAnimated)
            ) {
              animation = Medias.Animation.parse(client, doc);
            } else if (
              doc.attributes.some((attribute) => attribute instanceof Raw.DocumentAttributeVideo)
            ) {
              let attr = doc.attributes.find(
                (attribute) => attribute instanceof Raw.DocumentAttributeVideo,
              );
              if ((attr as Raw.DocumentAttributeVideo)?.roundMessage) {
                videoNote = Medias.VideoNote.parse(client, doc);
              } else {
                video = Medias.Video.parse(client, doc);
              }
            } else if (
              doc.attributes.some((attribute) => attribute instanceof Raw.DocumentAttributeSticker)
            ) {
              sticker = Medias.Sticker.parse(client, doc);
            } else {
              document = Medias.Document.parse(client, doc);
            }
          }
        }
        let from = Advanceds.User.parse(
          client,
          users.find((user) => user.id === userId),
        );
        let senderChat = from
          ? undefined
          : Advanceds.Chat.parseMessage(client, message, users, chats, false);
        let chat = Advanceds.Chat.parseMessage(client, message, users, chats, true);
        let parsedMessage = new Message(
          {
            from,
            senderChat,
            chat,
            forwardFrom,
            forwardFromChat,
            forwardFromMessageId,
            forwardSignature,
            forwardSenderName,
            forwardDate,
            animation,
            audio,
            document,
            photo,
            sticker,
            video,
            videoNote,
            voice,
            hasSpoilerMode,
            contact,
            dice,
            game,
            poll,
            venue,
            location,
            webpage,
            id: message.id,
            text: !message.media ? message.message : undefined,
            caption: message.media ? message.message : undefined,
            captionEntities: message.media ? entities : undefined,
            entities: !message.media ? entities : undefined,
            outgoing: message.out,
            date: new Date(message.date * 1000),
            hasProtectedContent: message.noforwards,
            mentioned: message.mentioned,
            mediaGroupId: message.groupedId,
            authorSignatrure: message.postAuthor,
          },
          client,
        );
        if (message.replyTo) {
          if (message.replyTo instanceof Raw.MessageReplyHeader) {
            parsedMessage.isTopicMessage =
              (message.replyTo as Raw.MessageReplyHeader)?.forumTopic ?? false;
            parsedMessage.replyToMessageId = (
              message.replyTo as Raw.MessageReplyHeader
            )?.replyToMsgId;
            parsedMessage.replyToTopMessageId = (
              message.replyTo as Raw.MessageReplyHeader
            )?.replyToTopId;
            if (replies > 0) {
              let cchat = client._cacheMessage.get(parsedMessage.chat?.id!);
              if (cchat) {
                let cmsg = cchat.get(parsedMessage?.replyToMessageId!);
                if (cmsg) {
                  parsedMessage.replyToMessage = cmsg;
                } else {
                  try {
                    let fmsg = await client.api.getMessages(
                      parsedMessage.chat?.id!,
                      [],
                      [message.id],
                      replies - 1,
                    );
                    parsedMessage.replyToMessage = fmsg[0];
                  } catch (error) {}
                }
              } else {
                try {
                  let fmsg = await client.api.getMessages(
                    parsedMessage.chat?.id!,
                    [],
                    [message.id],
                    replies - 1,
                  );
                  parsedMessage.replyToMessage = fmsg[0];
                } catch (error) {}
              }
            }
          }
          if (message.replyTo instanceof Raw.MessageReplyStoryHeader) {
            parsedMessage.replyToStoryId = (message.replyTo as Raw.MessageReplyStoryHeader).storyId;
            parsedMessage.repliedStoryFrom = Advanceds.Chat.parseDialog(
              client,
              message.replyTo.peer,
              users,
              chats,
            );
          }
        }
        if (message.replyMarkup) {
          parsedMessage.replyMarkup = await ReplyMarkup.convertReplyMarkup(
            message.replyMarkup!,
            client,
          );
        }
        if (!parsedMessage.poll) {
          let cchat: Map<number, Message> | undefined = client._cacheMessage.get(
            parsedMessage.chat?.id!,
          );
          if (cchat) {
            cchat.set(parsedMessage.id, parsedMessage);
          } else {
            let cmsg: Map<number, Message> = new Map();
            cmsg.set(parsedMessage.id, parsedMessage);
            client._cacheMessage.set(parsedMessage.chat?.id!, cmsg);
          }
        }
        if (message.ttlPeriod) {
          parsedMessage.ttl = message.ttlPeriod;
        }
        return parsedMessage;
      }
    }
    return new Message(
      {
        empty: true,
        id: (message as Raw.MessageEmpty).id,
      },
      client,
    );
  }

  // bound method
  /**
   * Sending a message to current chat with reply to current msg id.
   * > Shorthand from api.sendMessage
   *
   * @param { string } text - Message which will sending.
   * @param { sendMessageParams } more - Extra param for sending message, like parseMode, replyToMsgId, etc..
   */
  reply(text: string, more?: sendMessageParams) {
    if (this.chat) {
      return this.api.sendMessage(
        this.chat.id!,
        text,
        Object.assign(
          {
            replyToMessageId: this.id,
          },
          more,
        ),
      );
    }
  }
  /**
   * Sending a message to current chat without reply to current msg id.
   * > Shorthand from api.sendMessage
   *
   * @param { string } text - Message which will sending.
   * @param { sendMessageParams } more - Extra param for sending message, like parseMode, replyToMsgId, etc..
   */
  respond(text: string, more?: sendMessageParams) {
    if (this.chat) {
      return this.api.sendMessage(this.chat.id!, text, more);
    }
  }
  /**
   * Sending a document message.
   * > Shorthand from api.sendDocument 
   *    
   * @param { string | Buffer | Readable | Files.File } file - File to be sent. The file can be a fileId or path where the file is located or a buffer of the file or streamable which can be piped.

   * @param { sendDocumentParams } more - Extra param for sending message, like parseMode, replyToMsgId, etc..
  */
  replyWithDoc(file: string | Buffer | Readable | Files.File, more?: sendDocumentParams) {
    if (this.chat) {
      return this.api.sendDocument(this.chat.id, file, more);
    }
    throw new Error('Chat not found');
  }
  /**
   * Sending a document message.
   * > Shorthand from api.sendDocument
   *
   * @param { string | Buffer | Readable | Files.File } file - File to be sent. The file can be a fileId or path where the file is located or a buffer of the file or streamable which can be piped.
   * @param { sendDocumentParams } more - Extra param for sending message, like parseMode, replyToMsgId, etc..
   */
  rwd(file: string | Buffer | Readable | Files.File, more?: sendDocumentParams) {
    if (this.chat) {
      return this.api.sendDocument(this.chat.id, file, more);
    }
    throw new Error('Chat not found');
  }
  /**
   * Use this method to send video files.
   * > Shorthand from api.sendVideo
   *
   * @param { string | Buffer | Readable | Files.File } file - File to be sent. The file can be a fileId or path where the file is located or a buffer of the file or streamable which can be piped.
   * @param { sendVideoParams } more - Extra param for sending message, like parseMode, replyToMsgId, etc..
   */
  replyWithVideo(file: string | Buffer | Readable | Files.File, more?: sendVideoParams) {
    if (this.chat) {
      return this.api.sendVideo(this.chat.id, file, more);
    }
    throw new Error('Chat not found');
  }
  /**
   * Use this method to send video files.
   * > Shorthand from api.sendVideo
   *
   * @param { string | Buffer | Readable | Files.File } file - File to be sent. The file can be a fileId or path where the file is located or a buffer of the file or streamable which can be piped.
   * @param { sendVideoParams } more - Extra param for sending message, like parseMode, replyToMsgId, etc..
   */
  rwv(file: string | Buffer | Readable | Files.File, more?: sendVideoParams) {
    if (this.chat) {
      return this.api.sendVideo(this.chat.id, file, more);
    }
    throw new Error('Chat not found');
  }
  /**
   * As of v.4.0, Telegram clients support rounded square MPEG4 videos of up to 1 minute long.
   * > Shorthand from api.sendVideoNote
   *
   * @param { string | Buffer | Readable | Files.File } file - File to be sent. The file can be a fileId or path where the file is located or a buffer of the file or streamable which can be piped.
   * @param { sendVideoNoteParams } more - Extra param for sending message, like parseMode, replyToMsgId, etc..
   */
  replyWithVideoNote(file: string | Buffer | Readable | Files.File, more?: sendVideoNoteParams) {
    if (this.chat) {
      return this.api.sendVideoNote(this.chat.id, file, more);
    }
    throw new Error('Chat not found');
  }
  /**
   * As of v.4.0, Telegram clients support rounded square MPEG4 videos of up to 1 minute long.
   * > Shorthand from api.sendVideoNote
   *
   * @param { string | Buffer | Readable | Files.File } file - File to be sent. The file can be a fileId or path where the file is located or a buffer of the file or streamable which can be piped.
   * @param { sendVideoNoteParams } more - Extra param for sending message, like parseMode, replyToMsgId, etc..
   */
  rwvn(file: string | Buffer | Readable | Files.File, more?: sendVideoNoteParams) {
    if (this.chat) {
      return this.api.sendVideoNote(this.chat.id, file, more);
    }
    throw new Error('Chat not found');
  }
  /**
   * Use this method to send animation files (GIF or H.264/MPEG-4 AVC video without sound).
   * > Shorthand from api.sendAnimation
   *
   * @param { string | Buffer | Readable | Files.File } file - File to be sent. The file can be a fileId or path where the file is located or a buffer of the file or streamable which can be piped.
   * @param { sendAnimationParams } more - Extra param for sending message, like parseMode, replyToMsgId, etc..
   */
  replyWithAnimation(file: string | Buffer | Readable | Files.File, more?: sendAnimationParams) {
    if (this.chat) {
      return this.api.sendAnimation(this.chat.id, file, more);
    }
    throw new Error('Chat not found');
  }
  /**
   * Use this method to send animation files (GIF or H.264/MPEG-4 AVC video without sound).
   * > Shorthand from api.sendAnimation
   *
   * @param { string | Buffer | Readable | Files.File } file - File to be sent. The file can be a fileId or path where the file is located or a buffer of the file or streamable which can be piped.
   * @param { sendAnimationParams } more - Extra param for sending message, like parseMode, replyToMsgId, etc..
   */
  rwa(file: string | Buffer | Readable | Files.File, more?: sendAnimationParams) {
    if (this.chat) {
      return this.api.sendAnimation(this.chat.id, file, more);
    }
    throw new Error('Chat not found');
  }
  /**
   * Use this method to send static .WEBP, animated .TGS, or video .WEBM stickers.
   * > Shorthand from api.sendSticker
   *
   * @param { string | Buffer | Readable | Files.File } sticker - Sticker to be sent. The file can be a fileId or path where the file is located or a buffer of the file or streamable which can be piped.
   * @param { sendStickerParams } more - Extra param for sending message, like parseMode, replyToMsgId, etc..
   */
  replyWithSticker(sticker: string | Buffer | Readable | Files.File, more?: sendStickerParams) {
    if (this.chat) {
      return this.api.sendSticker(this.chat.id, sticker, more);
    }
    throw new Error('Chat not found');
  }
  /**
   * Use this method to send static .WEBP, animated .TGS, or video .WEBM stickers.
   * > Shorthand from api.sendSticker
   *
   * @param { string | Buffer | Readable | Files.File } sticker - Sticker to be sent. The file can be a fileId or path where the file is located or a buffer of the file or streamable which can be piped.
   * @param { sendStickerParams } more - Extra param for sending message, like parseMode, replyToMsgId, etc..
   */
  rws(sticker: string | Buffer | Readable | Files.File, more?: sendStickerParams) {
    if (this.chat) {
      return this.api.sendSticker(this.chat.id, sticker, more);
    }
    throw new Error('Chat not found');
  }
  /***/
  async click({
    row,
    col,
    text,
    filter,
    callbackData,
    //    sharePhone,
    //    shareGeo,
    password,
  }: ClickButtonFn) {
    Logger.debug('message.click called');
    if (!this.replyMarkup) {
      throw new Error("Couldn't find any replyMarkup");
    }
    const _filter = async (cb: {
      (
        btn: ReplyMarkup.inlineKeyboardButton | ReplyMarkup.replyKeyboardButton | string,
        r: number,
        c: number,
      ): Promise<boolean> | boolean;
    }) => {
      if (this.replyMarkup) {
        if ('inlineKeyboard' in this.replyMarkup) {
          let _markup: ReplyMarkup.inlineKeyboard = this.replyMarkup;
          for (let _rowIndex = 0; _rowIndex < _markup.inlineKeyboard.length; _rowIndex++) {
            let _row = _markup.inlineKeyboard[_rowIndex];
            for (let _colIndex = 0; _colIndex < _row.length; _colIndex++) {
              if (await cb(_row[_colIndex], _rowIndex, _colIndex)) {
                row = _rowIndex;
                col = _colIndex;
                return true;
              }
            }
          }
        }
        if ('keyboard' in this.replyMarkup) {
          let _markup: ReplyMarkup.replyKeyboard = this.replyMarkup;
          for (let _rowIndex = 0; _rowIndex < _markup.keyboard.length; _rowIndex++) {
            let _row = _markup.keyboard[_rowIndex];
            for (let _colIndex = 0; _colIndex < _row.length; _colIndex++) {
              if (await cb(_row[_colIndex], _rowIndex, _colIndex)) {
                row = _rowIndex;
                col = _colIndex;
                return true;
              }
            }
          }
        }
      }
      return false;
    };
    if (text) {
      let isTrue = await _filter(async (btn, row, col) => {
        let _text = typeof btn === 'string' ? btn : btn.text;
        if (typeof text === 'string') {
          return text === _text;
        }
        if (typeof text === 'function') {
          return text(_text, row, col);
        }
        return false;
      });
      if (!isTrue) return;
    }
    if (filter) {
      let isTrue = await _filter(filter);
      if (!isTrue) return;
    }
    if (callbackData) {
      let isTrue = await _filter(async (btn, _row, _col) => {
        let _cb = typeof btn !== 'string' && 'callbackData' in btn ? btn.callbackData : '';
        return callbackData === _cb;
      });
      if (!isTrue) return;
    }
    if (row !== undefined || col !== undefined) {
      if (this.replyMarkup) {
        if ('inlineKeyboard' in this.replyMarkup) {
          let _markup: ReplyMarkup.inlineKeyboard = this.replyMarkup;
          let keyboard: ReplyMarkup.inlineKeyboardButton | undefined =
            _markup.inlineKeyboard[row ?? 0][col ?? 0];
          /*if (keyboard && keyboard.url) {
          if (String(keyboard.url).startsWith('tg://user?id=')) {
            return await this.core.resolvePeer(
              BigInt(String(keyboard.url).replace('tg://user?id=', ''))
            );
          }
          return keyboard.url;
        }*/
          if (keyboard && 'callbackData' in keyboard) {
            let encryptedPassword;
            if (password !== undefined) {
              let pwd = await this.api.invoke(new Raw.account.GetPassword());
              encryptedPassword = await Cryptos.Password.computePasswordCheck(pwd, password);
            }
            let request = new Raw.messages.GetBotCallbackAnswer({
              peer: this.chat
                ? await this.core.resolvePeer(this.chat.id)
                : new Raw.InputPeerEmpty(),
              msgId: this.id,
              //@ts-ignore
              data: Buffer.from(keyboard.callbackData),
              password: encryptedPassword,
            });
            return await this.api.invoke(request);
          }
          if (keyboard && 'callbackGame' in keyboard) {
            let request = new Raw.messages.GetBotCallbackAnswer({
              peer: this.chat
                ? await this.core.resolvePeer(this.chat.id)
                : new Raw.InputPeerEmpty(),
              msgId: this.id,
              game: true,
            });
            return await this.api.invoke(request);
          }
          if (keyboard && 'switchInlineQuery' in keyboard) {
            let request = new Raw.messages.StartBot({
              bot: this.from ? await this.core.resolvePeer(this.from.id) : new Raw.InputPeerEmpty(),
              peer: this.chat
                ? await this.core.resolvePeer(this.chat.id)
                : new Raw.InputPeerEmpty(),
              startParam: keyboard.switchInlineQuery ?? '',
              randomId: this.client._rndMsgId.getMsgId(),
            });
            return await this.api.invoke(request);
          }
          if (keyboard && 'switchInlineQueryCurrentChat' in keyboard) {
            let request = new Raw.messages.StartBot({
              bot: this.from ? await this.core.resolvePeer(this.from.id) : new Raw.InputPeerEmpty(),
              peer: this.chat
                ? await this.core.resolvePeer(this.chat.id)
                : new Raw.InputPeerEmpty(),
              startParam: keyboard.switchInlineQueryCurrentChat ?? '',
              randomId: this.client._rndMsgId.getMsgId(),
            });
            return await this.api.invoke(request);
          }
        }
        /*if(this.replyMarkup.keyboard){
          let keyboard: inlineKeyboard | undefined = this.replyMarkup.inlineKeyboard[row ?? 0][col ?? 0];
          if (keyboard && typeof keyboard !== 'string') {
          if (keyboard.requestContact) {
            if (
              sharePhone === true ||
              typeof sharePhone === 'string' ||
              sharePhone instanceof Medias.Contact
            ) {
              if (sharePhone instanceof Medias.Contact)
                return this.telegram.sendContact(this.chat.id, sharePhone!, {
                  replyToMsgId: this.id,
                });
              return this.telegram.sendContact(
                this.chat.id,
                {
                  phoneNumber:
                    (sharePhone === true ? this.SnakeClient.aboutMe.phone : sharePhone) ?? '',
                  firstName: this.SnakeClient.aboutMe.firstName ?? 'unknown',
                  lastName: this.SnakeClient.aboutMe.lastName ?? '',
                  vcard: '',
                },
                {
                  replyToMsgId: this.id,
                }
              );
            }
          }
          if (keyboard.requestLocation) {
            if (shareGeo) {
              return this.telegram.sendLocation(this.chat.id, shareGeo!, {
                replyToMsgId: this.id,
              });
            }
          }
        }
        }*/
      }
    }
    return;
  }
}

export interface ClickButtonFn {
  /**
   * Row button position.
   * Row index start with zero.
   * [
   *  row 0 : [ col 0 , col 1],
   *  row 1 : [ col 0 , col 1]
   * ]
   */
  row?: number;
  /**
   * column button position.
   * column index start with zero.
   * [
   *  row 0 : [ col 0 , col 1],
   *  row 1 : [ col 0 , col 1]
   * ]
   */
  col?: number;
  /**
   * find one the button when text of button is matches
   */
  text?: string | { (text: string, row: number, col: number): boolean | Promise<boolean> };
  /**
   * Make a filter to get the row,col of button. it must be returned a boolean.
   */
  filter?: {
    (
      keyboard: ReplyMarkup.replyKeyboardButton | ReplyMarkup.inlineKeyboardButton | string,
      row: number,
      col: number,
    ): boolean | Promise<boolean>;
  };
  /**
   * find one the button when callbackData of button is matches
   */
  callbackData?: string;
  /**
   * Phone will be send when button clicked
   */
  sharePhone?: boolean | string | Medias.Contact;
  /**
   * Location will be send when button clicked
   */
  shareGeo?: { latitude: number; longitude: number } | Medias.Location;
  /**
   * Fill your 2fa password when button clicked.
   */
  password?: string;
}
