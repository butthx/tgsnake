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

export class Restriction extends TLObject {
  /**
   * The platform the restriction is applied to, e.g. "ios", "android"
   */
  platform!: string;
  /**
   * The restriction reason, e.g. "porn", "copyright".
   */
  reason!: string;
  /**
   * The restriction text.
   */
  text!: string;
  constructor(
    {
      platform,
      reason,
      text,
    }: {
      platform: string;
      reason: string;
      text: string;
    },
    client: Snake,
  ) {
    super(client);
    this.platform = platform;
    this.reason = reason;
    this.text = text;
  }
  /**
   * Build RestrictionReason class.
   * @param client {Object} - Snake Client.
   * @param reason {Object|undefined} - Primitive RestrictionReason class will be using to build modern RestrictionReason class.
   */
  static parse(client: Snake, reason: Raw.RestrictionReason): Restriction {
    return new Restriction(
      {
        platform: reason.platform,
        reason: reason.reason,
        text: reason.text,
      },
      client,
    );
  }
}
