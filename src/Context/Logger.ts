/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2025 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { Logger, TypeLogLevel } from '../platform.deno.ts';
const log = new Logger({
  name: 'tgsnake',
  level: ['debug'] as Array<TypeLogLevel>,
  customColor: {
    name: '#f0ffff',
  },
});

export { log as Logger };
