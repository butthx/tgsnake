/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2024 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */

export {
  Raw,
  Helpers,
  Storages,
  Raws,
  Clients,
  Sessions,
  Client,
  Files,
  Cryptos,
  Errors,
} from 'https://deno.land/x/tgsnake_core@1.10.10/src/index.ts';
export {
  Writer,
  base64_url_encode,
  FileId,
  FileType,
  ThumbnailSource,
  FileTypeUniqueId,
  PHOTO_TYPES,
  DOCUMENT_TYPES,
} from 'https://deno.land/x/tgsnake_fileid@2.1.0/src/index.ts';
export { Parser, type Entities } from 'https://deno.land/x/tgsnake_parser@2.0.3/src/index.ts';
export { Logger, type TypeLogLevel } from 'https://deno.land/x/tgsnake_log/src/index.ts';
import { lookup as mimetypes } from 'https://deno.land/x/mrmime@v1.0.1/mod.ts';
import * as path from 'https://deno.land/std@0.182.0/path/mod.ts';
import * as fs from 'node:fs';
import prompts from 'https://esm.sh/prompts@2.4.2';
export { Readable, Writable, Duplex } from 'node:stream';
export { Buffer } from 'node:buffer';
export { path, prompts, fs, mimetypes };
export const { cwd } = Deno;
export const isBrowser = false;
export const isDeno = true;
export const sysprc = {
  exit: Deno.exit,
  env: Deno.env.toObject(),
  on: Deno.addSignalListener,
};
