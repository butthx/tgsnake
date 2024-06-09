/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2024 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { sendMedia, type sendMediaParams } from './SendMedia.ts';
import {
  FileId,
  DOCUMENT_TYPES,
  Raw,
  type Readable,
  type Files,
  fs,
  path,
  Buffer,
} from '../../platform.deno.ts';
import { findMimeType, uploadThumbnail, parseArgObjAsStr } from '../../Utilities.ts';
import type { Snake } from '../../Client/index.ts';
import { Logger } from '../../Context/Logger.ts';
export interface sendDocumentParams extends sendMediaParams {
  /**
   * The name of the file that will be uploaded to Telegram.
   */
  filename?: string;
  /**
   * Callback function.
   * This function will be called when uploading a file to Telegram.
   */
  progress?: Files.Progress;
  /**
   * Thumbnail of uploaded file.
   * The thumbnail must be a string (file path) or a Buffer or Readable stream.
   */
  thumbnail?: string | Buffer | Readable | Files.File;
  /**
   * Mime-type of a file to be sent to Telegram. This only applies when not using file_id as a file parameter.
   */
  mimetype?: string;
  /**
   * Force send a file as documents.
   */
  forceDocument?: boolean;
  /**
   * Whether files are using spoilers.
   */
  hasSpoiler?: boolean;
}
export async function sendDocument(
  client: Snake,
  chatId: bigint | string,
  file: string | Buffer | Readable | Files.File,
  more: sendDocumentParams = {},
) {
  Logger.debug(
    `exec: send_document chat ${typeof chatId} (${chatId}) ${parseArgObjAsStr({
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
    replyMarkup,
    entities,
    parseMode,
    caption,
    invertMedia,
    filename,
    progress,
    thumbnail,
    mimetype,
    forceDocument,
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
        mimeType:
          mimetype ?? findMimeType(filename ?? path.basename(file) ?? '') ?? 'application/zip',
        forceFile: forceDocument,
        spoiler: hasSpoiler,
        attributes: [
          new Raw.DocumentAttributeFilename({
            fileName: filename ?? path.basename(file) ?? `tg-${Date.now()}`,
          }),
        ],
        thumb: thumbnail ? await uploadThumbnail(client, thumbnail) : undefined,
      });
    } else {
      const media = FileId.decodeFileId(file);
      if (DOCUMENT_TYPES.includes(media.fileType)) {
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
      mimeType: mimetype ?? findMimeType(filename ?? '') ?? 'application/zip',
      forceFile: forceDocument,
      spoiler: hasSpoiler,
      attributes: [
        new Raw.DocumentAttributeFilename({
          fileName: filename ?? `tg-${Date.now()}`,
        }),
      ],
      thumb: thumbnail ? await uploadThumbnail(client, thumbnail) : undefined,
    });
  } else if ('pipe' in file) {
    var savedFile: Raw.TypeInputMedia = new Raw.InputMediaUploadedDocument({
      file: (await client.core.saveFileStream({
        source: file,
        fileName: filename,
        progress: progress,
      }))!,
      mimeType: mimetype ?? findMimeType(filename ?? '') ?? 'application/zip',
      forceFile: forceDocument,
      spoiler: hasSpoiler,
      attributes: [
        new Raw.DocumentAttributeFilename({
          fileName: filename ?? `tg-${Date.now()}`,
        }),
      ],
      thumb: thumbnail ? await uploadThumbnail(client, thumbnail) : undefined,
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
    replyMarkup,
    entities,
    parseMode,
    caption,
    invertMedia,
  });
}
