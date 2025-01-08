/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2025 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { sendMedia } from './SendMedia.ts';
import {
  FileId,
  FileType,
  Raw,
  type Readable,
  type Files,
  type Entities,
  fs,
  path,
  Buffer,
} from '../../platform.deno.ts';
import { findMimeType, parseArgObjAsStr } from '../../Utilities.ts';
import type { Snake } from '../../Client/index.ts';
import { Logger } from '../../Context/Logger.ts';
import type { TypeReplyMarkup } from '../../TL/Messages/ReplyMarkup.ts';
import type { sendDocumentParams } from './SendDocument.ts';
export type sendStickerParams = Omit<
  sendDocumentParams,
  keyof {
    replyMarkup?: TypeReplyMarkup;
    entities?: Array<Entities>;
    parseMode?: 'html' | 'markdown';
    caption?: string;
    invertMedia?: boolean;
    thumbnail?: string | Buffer | Readable | Files.File;
    forceDocument?: boolean;
  }
>;
export async function sendSticker(
  client: Snake,
  chatId: bigint | string,
  file: string | Buffer | Readable | Files.File,
  more: sendStickerParams = {},
) {
  Logger.debug(
    `exec: send_sticker chat ${typeof chatId} (${chatId}) ${parseArgObjAsStr({
      file,
    })} ${parseArgObjAsStr(more)}`,
  );
  var {
    disableNotification,
    replyToMessageId,
    replyToStoryId,
    messageThreadId,
    scheduleDate,
    sendAsChannel,
    protectContent,
    filename,
    progress,
    mimetype,
    hasSpoiler,
  } = more;
  if (typeof file === 'string') {
    file as string;
    if (/^http/i.test(file)) {
      var savedFile: Raw.TypeInputMedia = new Raw.InputMediaDocumentExternal({
        spoiler: hasSpoiler,
        url: file,
      });
    } else if (/^(\/|\.\.?\/|~\/)/i.test(file)) {
      var savedFile: Raw.TypeInputMedia = new Raw.InputMediaUploadedDocument({
        file: (await client.core.saveFileStream({
          source: fs.createReadStream(file),
          fileName: filename ?? path.basename(file),
          progress: progress,
        }))!,
        mimeType: mimetype ?? findMimeType(filename ?? path.basename(file) ?? '') ?? 'image/webp',
        forceFile: false,
        spoiler: hasSpoiler,
        attributes: [
          new Raw.DocumentAttributeFilename({
            fileName: filename ?? path.basename(file) ?? `tg-${Date.now()}`,
          }),
        ],
      });
    } else {
      const media = FileId.decodeFileId(file);
      if (media.fileType === FileType.STICKER) {
        var savedFile: Raw.TypeInputMedia = new Raw.InputMediaDocument({
          spoiler: hasSpoiler,
          id: new Raw.InputDocument({
            id: media.id,
            accessHash: media.accessHash,
            fileReference: media.fileReference!,
          }),
        });
      } else {
        throw new Error('invalid file id');
      }
    }
  } else if (Buffer.isBuffer(file)) {
    file as Buffer;
    var savedFile: Raw.TypeInputMedia = new Raw.InputMediaUploadedDocument({
      file: (await client.core.saveFile({
        source: file,
        fileName: filename,
        progress: progress,
      }))!,
      mimeType: mimetype ?? findMimeType(filename ?? '') ?? 'image/webp',
      forceFile: false,
      spoiler: hasSpoiler,
      attributes: [
        new Raw.DocumentAttributeFilename({
          fileName: filename ?? `tg-${Date.now()}`,
        }),
      ],
    });
  } else if ('pipe' in file) {
    var savedFile: Raw.TypeInputMedia = new Raw.InputMediaUploadedDocument({
      file: (await client.core.saveFileStream({
        source: file,
        fileName: filename,
        progress: progress,
      }))!,
      mimeType: mimetype ?? findMimeType(filename ?? '') ?? 'image/webp',
      forceFile: false,
      spoiler: hasSpoiler,
      attributes: [
        new Raw.DocumentAttributeFilename({
          fileName: filename ?? `tg-${Date.now()}`,
        }),
      ],
    });
  } else {
    throw new Error('unknown file');
  }
  return sendMedia(client, chatId, savedFile, {
    disableNotification,
    replyToMessageId,
    replyToStoryId,
    messageThreadId,
    scheduleDate,
    sendAsChannel,
    protectContent,
  });
}
