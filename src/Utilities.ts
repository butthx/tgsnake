/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2025 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { exec } from 'node:child_process';
import {
  Raw,
  Helpers,
  Writer,
  base64_url_encode,
  mimetypes,
  type Readable,
  type Files,
  fs,
  Buffer,
  Parser,
  type Entities,
} from './platform.deno.ts';
import { Message } from './TL/Messages/Message.ts';
import type { Snake } from './Client/Snake.ts';

export type TypeChat = Raw.Chat | Raw.Channel;
export type TypeUser = Raw.User;
export function parseDialog(
  chats: Array<Raw.TypeChat>,
  users: Array<Raw.TypeUser>,
): [chats: Array<TypeChat>, users: Array<TypeUser>] {
  return [
    chats.filter((chat): chat is TypeChat => {
      if (
        chat instanceof Raw.Chat ||
        chat instanceof Raw.ChatEmpty ||
        chat instanceof Raw.ChatForbidden
      )
        return true;
      if (chat instanceof Raw.Channel || chat instanceof Raw.ChannelForbidden) return true;
      return false;
    }),
    users.filter((user): user is TypeUser => {
      return user instanceof Raw.User || user instanceof Raw.UserEmpty;
    }),
  ];
}
// adapted from https://stackoverflow.com/a/49013356
export function open(url: string) {
  if (process.platform === 'darwin') {
    return exec(`open ${url}`);
  }
  if (process.platform === 'win32') {
    return exec(`start ${url}`);
  }
  return exec(`xdg-open ${url}`);
}
// adapted from https://github.com/pyrogram/pyrogram/blob/abed55aea9d6687a8054282d8ee2d964ec39e23a/pyrogram/utils.py#L87
export async function parseMessages(
  client: Snake,
  messages: Raw.messages.Messages,
  replies: number = 1,
): Promise<Array<Message>> {
  let [chats, users] = parseDialog(messages.chats, messages.users);
  const parsedMessages: Array<Message> = [];
  if ('messages' in messages) {
    for (let message of messages.messages) {
      parsedMessages.push(await Message.parse(client, message, chats, users, 0));
    }
    if (replies) {
      let messagesWithReplies: Map<number, number> = new Map();
      for (let message of messages.messages) {
        if (
          !(message instanceof Raw.MessageEmpty) &&
          message.replyTo &&
          message.replyTo instanceof Raw.MessageReplyHeader &&
          message.replyTo.replyToMsgId
        ) {
          messagesWithReplies.set(
            message.id,
            (message.replyTo as Raw.MessageReplyHeader).replyToMsgId as unknown as number,
          );
        }
      }
      if (messagesWithReplies.size) {
        let chatId = BigInt(0);
        for (let message of parsedMessages) {
          if (message.chat) {
            chatId = message.chat.id;
            break;
          }
        }
        let replyMsgs = await client.api.getMessages(
          chatId,
          [],
          [...messagesWithReplies.keys()],
          replies - 1,
        );
        for (let msg of parsedMessages) {
          let replyId = messagesWithReplies.get(msg.id);
          for (let reply of replyMsgs) {
            if (reply.id == replyId) {
              msg.replyToMessage = reply;
            }
          }
        }
      }
    }
  }
  return parsedMessages;
}
export function getId(peer: Raw.TypePeer): bigint | undefined {
  if (peer instanceof Raw.PeerUser) return (peer as Raw.PeerUser).userId;
  if (peer instanceof Raw.PeerChannel) return (peer as Raw.PeerChannel).channelId;
  if (peer instanceof Raw.PeerChat) return (peer as Raw.PeerChat).chatId;
  return;
}
export function getPeerId(peer: Raw.TypePeer): bigint | undefined {
  if (peer instanceof Raw.PeerUser) return (peer as Raw.PeerUser).userId;
  if (peer instanceof Raw.PeerChat) return BigInt(-(peer as Raw.PeerChat).chatId);
  if (peer instanceof Raw.PeerChannel)
    return BigInt(Helpers.MAX_CHANNEL_ID - (peer as Raw.PeerChannel).channelId);
  return;
}
export function createInlineMsgId(
  msgId: Raw.InputBotInlineMessageID | Raw.InputBotInlineMessageID64,
) {
  if (msgId instanceof Raw.InputBotInlineMessageID) {
    const writer = new Writer();
    writer.writeInt(msgId.dcId).writeBigInt(msgId.id).writeBigInt(msgId.accessHash);
    return base64_url_encode(writer.results());
  }
  const writer = new Writer();
  writer
    .writeInt(msgId.dcId)
    .writeBigInt(msgId.ownerId)
    .writeInt(msgId.id)
    .writeBigInt(msgId.accessHash);
  return base64_url_encode(writer.results());
}
export function findMimeType(file: string) {
  if (/tgs$/.test(file)) {
    return 'application/x-tgsticker';
  }
  const mime = mimetypes(file);
  if (mime) {
    return mime;
  }
  return 'application/zip';
}
export function uploadThumbnail(client: Snake, thumb: string | Buffer | Readable | Files.File) {
  if (typeof thumb !== 'string' && 'pipe' in thumb) {
    return client.core.saveFileStream({
      source: thumb,
    });
  }
  if (Buffer.isBuffer(thumb)) {
    return client.core.saveFile({
      source: thumb as Buffer,
    });
  }
  return client.core.saveFileStream({
    source: fs.createReadStream(thumb),
  });
}
export function parseArgObjAsStr(arg: { [key: string]: any }) {
  let res = '';
  for (let [key, value] of Object.entries(arg)) {
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        value = '[array]';
      } else if (Buffer.isBuffer(value)) {
        value = '[buffer]';
      } else {
        value = '[object]';
      }
    } else if (typeof value !== 'undefined' && typeof value !== 'boolean') {
      value = `${typeof value}[${String(value).length}](${
        String(value).length >= 10 ? `${String(value).slice(0, 5)}...` : value
      })`;
    }
    res += `${key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)} ${value} `;
  }
  return res.trim();
}

export interface ReplyParameters {
  /**
   * Identifier of the message that will be replied to in the current chat, or in the chat chat_id if it is specified
   */
  messageId: number;
  /**
   * If the message to be replied to is from a different chat, unique identifier for the chat or username of the channel (in the format @channelusername)
   */
  chatId?: bigint | string;
  /**
   * Quoted part of the message to be replied to; 0-1024 characters after entities parsing. The quote must be an exact substring of the message to be replied to, including bold, italic, underline, strikethrough, spoiler, and custom_emoji entities. The message will fail to send if the quote isn't found in the original message.
   */
  quote?: string;
  /**
   * Mode for parsing entities in the quote.
   */
  quoteParseMode?: 'markdown' | 'html';
  /**
   * A JSON-serialized list of special entities that appear in the quote. It can be specified instead of quoteParseMode.
   */
  quoteEntities?: Array<Entities>;
  /**
   * Position of the quote in the original message in UTF-16 code units.
   */
  quotePosition?: number;
}
export async function buildReply(
  client: Snake,
  replyParameters: ReplyParameters,
  messageThreadId?: number,
): Promise<Raw.InputReplyToMessage> {
  if (
    'quoteParseMode' in replyParameters &&
    !('quoteEntities' in replyParameters) &&
    'quote' in replyParameters
  ) {
    const [t, e] = await Parser.parse(replyParameters.quote ?? '', replyParameters.quoteParseMode!);
    replyParameters.quoteEntities = e;
    replyParameters.quote = t;
  }
  const peer =
    'chatId' in replyParameters
      ? await client._client.resolvePeer(replyParameters.chatId!)
      : undefined;
  return new Raw.InputReplyToMessage({
    replyToMsgId: replyParameters.messageId,
    topMsgId: messageThreadId,
    replyToPeerId: peer,
    quoteText: replyParameters.quote ?? '',
    quoteEntities: replyParameters.quoteEntities
      ? await Parser.toRaw(client._client, replyParameters.quoteEntities!)
      : undefined,
    quoteOffset: replyParameters.quotePosition,
  });
}

export function getChannelId(update: Raw.TypeUpdate): bigint {
  if ('channelId' in update && 'pts' in update) {
    return BigInt(Helpers.getChannelId(update.channelId));
  }
  if (
    update instanceof Raw.UpdateNewChannelMessage ||
    update instanceof Raw.UpdateEditChannelMessage
  ) {
    return getPeerId(update.message.peerId!) ?? BigInt(0);
  }
  return BigInt(0);
}
