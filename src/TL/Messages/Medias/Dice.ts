/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2024 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { TLObject } from '../../TL.ts';
import { Raw } from '../../../platform.deno.ts';
import type { Snake } from '../../../Client/index.ts';

// https://core.telegram.org/bots/api#dice
export class Dice extends TLObject {
  emoji!: string;
  value!: number;
  constructor(
    {
      emoji,
      value,
    }: {
      emoji: string;
      value: number;
    },
    client: Snake,
  ) {
    super(client);
    this.emoji = emoji;
    this.value = value;
  }
  static parse(client: Snake, dice: Raw.MessageMediaDice) {
    return new Dice(
      {
        emoji: dice.emoticon,
        value: dice.value,
      },
      client,
    );
  }
}
