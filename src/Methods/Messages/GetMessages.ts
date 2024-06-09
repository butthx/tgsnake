/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2024 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { Raw } from '../../platform.deno.ts';
import { parseMessages } from '../../Utilities.ts';
import type { Snake } from '../../Client/index.ts';
import type { Message } from '../../TL/Messages/Message.ts';

export async function getMessages(
  client: Snake,
  chatId: bigint | string,
  messageIds: Array<number> = [],
  replyToMessageIds: Array<number> = [],
  replies: number = 1,
): Promise<Array<Message>> {
  if (!messageIds.length && !replyToMessageIds.length) {
    throw new Error('Missing argument');
  }
  let parsedMsgIds: Array<Raw.InputMessageID | Raw.InputMessageReplyTo> = messageIds.length
    ? messageIds.map((id) => new Raw.InputMessageID({ id: id }))
    : replyToMessageIds.length
      ? replyToMessageIds.map((id) => new Raw.InputMessageReplyTo({ id: id }))
      : [];
  if (replies < 0) replies = (1 << 31) - 1;
  let peer = await client._client.resolvePeer(chatId);
  if (peer instanceof Raw.InputPeerChannel) {
    let msg = await client._client.invoke(
      new Raw.channels.GetMessages({
        channel: peer,
        id: parsedMsgIds,
      }),
    );
    return await parseMessages(client, msg as unknown as Raw.messages.Messages, replies);
  }
  let msg = await client._client.invoke(
    new Raw.messages.GetMessages({
      id: parsedMsgIds,
    }),
  );
  return await parseMessages(client, msg as unknown as Raw.messages.Messages, replies);
}
