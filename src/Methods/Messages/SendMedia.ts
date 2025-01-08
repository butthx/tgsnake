/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2025 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { Parser, type Entities, Raw } from '../../platform.deno.ts';
import * as ReplyMarkup from '../../TL/Messages/ReplyMarkup.ts';
import type { Snake } from '../../Client/index.ts';
import { Message } from '../../TL/Messages/index.ts';
import { Chat } from '../../TL/Advanced/index.ts';
import { parseArgObjAsStr, ReplyParameters, buildReply } from '../../Utilities.ts';
import { Logger } from '../../Context/Logger.ts';

export interface sendMediaParams {
  /**
   * Send a message silently.
   */
  disableNotification?: boolean;
  /**
   * If the message is a reply, ID of the original message.
   */
  replyToMessageId?: number;
  /**
   * Sent the message as a replied user's stories. ID of the story to reply.
   */
  replyToStoryId?: number;
  /**
   * Describes reply parameters for the message that is being sent.
   */
  replyParameters?: ReplyParameters;
  /**
   * Unique identifier for the target message thread (topic) of the forum; for forum supergroups only.
   */
  messageThreadId?: number;
  /**
   * Date when the message will be automatically sent.
   */
  scheduleDate?: Date;
  /**
   * Send the message as a channel. You must be an owner of that channel first and Your account must subscribe to Telegram Premium.
   * The channel id, must be known in cache.
   */
  sendAsChannel?: bigint | string;
  /**
   * Protects the contents of the sent message from forwarding and saving.
   */
  protectContent?: boolean;
  /**
   * Additional interface options. A JSON-serialized object for an inline keyboard, custom reply keyboard, instructions to remove reply keyboard or to force a reply from the user.
   */
  replyMarkup?: ReplyMarkup.TypeReplyMarkup;
  /**
   * A JSON-serialized list of special entities that appear in the caption, which can be specified instead of parseMode.
   */
  entities?: Array<Entities>;
  /**
   * Mode for parsing entities in the video caption. See @tgsnake/parse for formatting options and more details.
   */
  parseMode?: 'html' | 'markdown';
  /**
   * Media caption (may also be used when resending videos by file_id), 0-1024 characters after entities parsing.
   */
  caption?: string;
  /**
   * If set, any eventual webpage preview will be shown on top of the message instead of at the bottom.
   */
  invertMedia?: boolean;
}
export async function sendMedia(
  client: Snake,
  chatId: bigint | string,
  media: Raw.TypeInputMedia,
  more: sendMediaParams = {},
) {
  Logger.debug(
    `exec: send_media chat ${typeof chatId} (${chatId}) ${media.className} ${parseArgObjAsStr(
      more,
    )}`,
  );
  var {
    disableNotification,
    replyToMessageId,
    replyToStoryId,
    replyParameters,
    messageThreadId,
    scheduleDate,
    sendAsChannel,
    protectContent,
    replyMarkup,
    entities,
    parseMode,
    caption,
    invertMedia,
  } = more;
  const peer = await client._client.resolvePeer(chatId);
  if (caption && parseMode && !entities) {
    const [t, e] = await Parser.parse(caption, parseMode);
    entities = e;
    caption = t;
  }
  const res = await client._client.invoke(
    new Raw.messages.SendMedia({
      silent: disableNotification,
      clearDraft: true,
      noforwards: protectContent,
      peer: peer,
      replyTo:
        replyToMessageId || replyParameters
          ? await buildReply(
              client,
              replyParameters ? replyParameters : { messageId: replyToMessageId as number },
              messageThreadId,
            )
          : replyToStoryId
            ? new Raw.InputReplyToStory({
                peer: peer,
                storyId: replyToStoryId,
              })
            : undefined,
      message: caption || '',
      media: media,
      randomId: client._rndMsgId.getMsgId(),
      replyMarkup: replyMarkup
        ? await ReplyMarkup.buildReplyMarkup(replyMarkup!, client)
        : undefined,
      entities: entities ? await Parser.toRaw(client._client, entities!) : undefined,
      scheduleDate: scheduleDate ? scheduleDate.getTime() / 1000 : undefined,
      sendAs: sendAsChannel ? await client._client.resolvePeer(sendAsChannel!) : undefined,
      updateStickersetsOrder: true,
      invertMedia: invertMedia,
    }),
  );
  if (res instanceof Raw.UpdateShortSentMessage) {
    let peerId = BigInt(0);
    let peerType = 'private';
    if (peer instanceof Raw.InputPeerUser) {
      peerId = (peer as Raw.InputPeerUser).userId;
    } else if (peer instanceof Raw.InputPeerChat) {
      peerId = BigInt(-(peer as Raw.InputPeerChat).chatId);
      peerType = 'group';
    }
    return new Message(
      {
        id: (res as Raw.UpdateShortSentMessage).id,
        chat: new Chat(
          {
            id: peerId,
            type: peerType,
            accessHash: BigInt(0),
          },
          client,
        ),
        date: new Date((res as Raw.UpdateShortSentMessage).date * 1000),
        empty: false,
        caption,
        replyMarkup,
        entities,
      },
      client,
    );
  }
  if ('updates' in res) {
    for (const update of res.updates) {
      if (
        update instanceof Raw.UpdateNewMessage ||
        update instanceof Raw.UpdateNewChannelMessage ||
        update instanceof Raw.UpdateNewScheduledMessage
      ) {
        return await Message.parse(client, update.message, res.chats || [], res.users || []);
      }
    }
  }
  return new Message(
    {
      id: 'id' in res ? res.id : 0,
      outgoing: true,
      empty: true,
    },
    client,
  );
}
