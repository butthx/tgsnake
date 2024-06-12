/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2024 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { Raw } from '../../../platform.deno.ts';
import { TLObject } from '../../TL.ts';
import type { Snake } from '../../../Client/index.ts';

export class LinkPreviewOptions extends TLObject {
  url?: string;
  preferSmallMedia?: boolean;
  preferLargeMedia?: boolean;
  showAboveText?: boolean;
  constructor(
    {
      url,
      preferSmallMedia,
      preferLargeMedia,
      showAboveText,
    }: {
      url?: string;
      preferSmallMedia?: boolean;
      preferLargeMedia?: boolean;
      showAboveText?: boolean;
    },
    client: Snake,
  ) {
    super(client);
    this.url = url;
    this.preferSmallMedia = preferSmallMedia;
    this.preferLargeMedia = preferLargeMedia;
    this.showAboveText = showAboveText;
  }
  static parse(client: Snake, webpage: Raw.MessageMediaWebPage): LinkPreviewOptions {
    const parsed = new LinkPreviewOptions(
      {
        preferLargeMedia: webpage.forceLargeMedia,
        preferSmallMedia: webpage.forceSmallMedia,
      },
      client,
    );
    if (webpage.webpage instanceof Raw.WebPageEmpty) {
      parsed.url = (webpage.webpage as Raw.WebPageEmpty).url;
    } else if (webpage.webpage instanceof Raw.WebPagePending) {
      parsed.url = (webpage.webpage as Raw.WebPagePending).url;
    } else if (webpage.webpage instanceof Raw.WebPage) {
      parsed.url = (webpage.webpage as Raw.WebPage).url;
    }
    return parsed;
  }
}
