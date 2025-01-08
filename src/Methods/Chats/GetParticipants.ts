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

export interface getParticipantsParams {
  offset?: number;
  limit?: number;
  query?: string;
  filter?:
    | 'all'
    | 'kicked'
    | 'restricted'
    | 'bots'
    | 'recents'
    | 'administrators'
    | 'mentions'
    | 'banned'
    | 'contacts';
}
export async function getParticipants(
  client: Snake,
  chatId: bigint | string,
  more: getParticipantsParams = {},
) {
  var { offset, limit, query, filter } = Object.assign(
    {
      offset: 0,
      limit: 200,
      query: '',
      filter: 'all',
    },
    more,
  );
  const { _client } = client;
  const peer = await _client.resolvePeer(chatId);
  if (peer instanceof Raw.InputPeerChat) {
    const results = await _client.invoke(
      new Raw.messages.GetFullChat({
        chatId: (peer as Raw.InputPeerChat).chatId,
      }),
    );
    return ((results as Raw.messages.ChatFull).fullChat as Raw.ChatFull).participants;
  }
  if (peer instanceof Raw.InputPeerChannel) {
    let _filter: Raw.TypeChannelParticipantsFilter = new Raw.ChannelParticipantsSearch({
      q: query,
    });
    switch (filter) {
      case 'recents':
        _filter = new Raw.ChannelParticipantsRecent();
        break;
      case 'administrators':
        _filter = new Raw.ChannelParticipantsAdmins();
        break;
      case 'kicked':
        _filter = new Raw.ChannelParticipantsKicked({ q: query });
        break;
      case 'bots':
        _filter = new Raw.ChannelParticipantsBots();
        break;
      case 'banned':
        _filter = new Raw.ChannelParticipantsBanned({ q: query });
        break;
      case 'contacts':
        _filter = new Raw.ChannelParticipantsContacts({ q: query });
        break;
      case 'mentions':
        _filter = new Raw.ChannelParticipantsMentions({ q: query });
        break;
      default:
    }
    return await _client.invoke(
      new Raw.channels.GetParticipants({
        channel: peer as Raw.InputPeerChannel,
        filter: _filter,
        offset: offset,
        limit: limit,
        hash: BigInt(0),
      }),
    );
  }
}
