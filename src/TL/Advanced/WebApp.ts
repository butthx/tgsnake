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

export class WebAppData extends TLObject {
  data!: string;
  buttonText!: string;
  constructor(
    {
      data,
      buttonText,
    }: {
      data: string;
      buttonText: string;
    },
    client: Snake,
  ) {
    super(client);
    this.data = data;
    this.buttonText = buttonText;
  }
  static parse(client: Snake, webApp: Raw.MessageActionWebViewDataSentMe) {
    return new WebAppData(
      {
        data: webApp.data,
        buttonText: webApp.text,
      },
      client,
    );
  }
}
