/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2025 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { Raw } from '../../platform.deno.ts';
import type { Snake } from '../../Client/index.ts';

export async function deleteMessages(
  client: Snake,
  chatId: string | bigint,
  messages: Array<number>,
): Promise<true> {
  const peer = await client.core.resolvePeer(chatId);
  if (peer instanceof Raw.InputPeerChannel) {
    await client.api.invoke(
      new Raw.channels.DeleteMessages({
        channel: new Raw.InputChannel({
          channelId: (peer as Raw.InputPeerChannel).channelId,
          accessHash: (peer as Raw.InputPeerChannel).accessHash,
        }),
        id: messages,
      }),
    );
  } else {
    await client.api.invoke(
      new Raw.messages.DeleteMessages({
        revoke: true,
        id: messages,
      }),
    );
  }
  return true;
}
