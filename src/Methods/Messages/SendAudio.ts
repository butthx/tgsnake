/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2024 butthx <https://github.com/butthx>
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
  fs,
  path,
  Buffer,
} from '../../platform.deno.ts';
import { findMimeType, uploadThumbnail, parseArgObjAsStr } from '../../Utilities.ts';
import type { Snake } from '../../Client/index.ts';
import type { sendDocumentParams } from './SendDocument.ts';
import { Logger } from '../../Context/Logger.ts';
export interface sendAudioParams extends sendDocumentParams {
  /**
   * The duration of a video.
   */
  duration?: number;
  /**
   * Performer.
   */
  performer?: string;
  /**
   * Track name
   */
  title?: string;
}
export async function sendAudio(
  client: Snake,
  chatId: bigint | string,
  file: string | Buffer | Readable | Files.File,
  more: sendAudioParams = {},
) {
  Logger.debug(
    `exec: send_audio chat ${typeof chatId} (${chatId}) ${parseArgObjAsStr({
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
    duration,
    performer,
    title,
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
        mimeType: mimetype ?? findMimeType(filename ?? path.basename(file) ?? '') ?? 'audio/mp3',
        forceFile: forceDocument,
        spoiler: hasSpoiler,
        attributes: [
          new Raw.DocumentAttributeFilename({
            fileName: filename ?? path.basename(file) ?? `tg-${Date.now()}`,
          }),
          new Raw.DocumentAttributeAudio({
            voice: false,
            duration: duration ?? 0,
            title: title ?? 'Audio',
            performer: performer ?? 'unknown',
          }),
        ],
        thumb: thumbnail ? await uploadThumbnail(client, thumbnail) : undefined,
      });
    } else {
      const media = FileId.decodeFileId(file);
      if (media.fileType === FileType.VIDEO) {
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
      mimeType: mimetype ?? findMimeType(filename ?? '') ?? 'audio/mp3',
      forceFile: forceDocument,
      spoiler: hasSpoiler,
      attributes: [
        new Raw.DocumentAttributeFilename({
          fileName: filename ?? `tg-${Date.now()}`,
        }),
        new Raw.DocumentAttributeAudio({
          voice: false,
          duration: duration ?? 0,
          title: title ?? 'Audio',
          performer: performer ?? 'unknown',
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
      mimeType: mimetype ?? findMimeType(filename ?? '') ?? 'audio/mp3',
      forceFile: forceDocument,
      spoiler: hasSpoiler,
      attributes: [
        new Raw.DocumentAttributeFilename({
          fileName: filename ?? `tg-${Date.now()}`,
        }),
        new Raw.DocumentAttributeAudio({
          voice: false,
          duration: duration ?? 0,
          title: title ?? 'Audio',
          performer: performer ?? 'unknown',
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
