/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2023 butthx <https://github.com/butthx>
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
  DOCUMENT_TYPES,
  Raw,
  type Readable,
  type Files,
  fs,
  path,
} from '../../platform.deno.ts';
import { findMimeType, uploadThumbnail, parseArgObjAsStr } from '../../Utilities.ts';
import type { Snake } from '../../Client/index.ts';
import type { sendVideoParams } from './SendVideo.ts';
import { Logger } from '../../Context/Logger.ts';

export async function sendAnimation(
  client: Snake,
  chatId: bigint | string,
  file: string | Buffer | Readable | Files.File,
  more: sendVideoParams = {},
) {
  Logger.debug(
    `exec: send_animation chat ${typeof chatId} (${chatId}) ${parseArgObjAsStr({
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
    width,
    height,
    supportsStreaming,
    preloadPrefixSize,
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
        mimeType: mimetype ?? findMimeType(filename ?? path.basename(file) ?? '') ?? 'video/mp4',
        forceFile: forceDocument,
        spoiler: hasSpoiler,
        attributes: [
          new Raw.DocumentAttributeFilename({
            fileName: filename ?? path.basename(file) ?? `tg-${Date.now()}`,
          }),
          new Raw.DocumentAttributeVideo({
            roundMessage: false,
            supportsStreaming: supportsStreaming,
            nosound: true,
            duration: duration ?? 0,
            w: length ?? 0,
            h: length ?? 0,
            preloadPrefixSize,
          }),
          new Raw.DocumentAttributeAnimated(),
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
      mimeType: mimetype ?? findMimeType(filename ?? '') ?? 'video/mp4',
      forceFile: forceDocument,
      spoiler: hasSpoiler,
      attributes: [
        new Raw.DocumentAttributeFilename({
          fileName: filename ?? `tg-${Date.now()}`,
        }),
        new Raw.DocumentAttributeVideo({
          roundMessage: true,
          supportsStreaming: supportsStreaming,
          nosound: true,
          duration: duration ?? 0,
          w: length ?? 0,
          h: length ?? 0,
          preloadPrefixSize,
        }),
        new Raw.DocumentAttributeAnimated(),
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
      mimeType: mimetype ?? findMimeType(filename ?? '') ?? 'video/mp4',
      forceFile: forceDocument,
      spoiler: hasSpoiler,
      attributes: [
        new Raw.DocumentAttributeFilename({
          fileName: filename ?? `tg-${Date.now()}`,
        }),
        new Raw.DocumentAttributeVideo({
          roundMessage: false,
          supportsStreaming: supportsStreaming,
          nosound: true,
          duration: duration ?? 0,
          w: length ?? 0,
          h: length ?? 0,
          preloadPrefixSize,
        }),
        new Raw.DocumentAttributeAnimated(),
      ],
      thumb: thumbnail ? await uploadThumbnail(client, thumbnail) : undefined,
    });
  } else {
    throw new Error('unknown file');
  }
  return sendMedia(client, chatId, savedFile, {
    disableNotification,
    replyToMessageId,
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
