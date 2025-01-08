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
  fs,
  path,
  Buffer,
} from '../../platform.deno.ts';
import { findMimeType, uploadThumbnail, parseArgObjAsStr } from '../../Utilities.ts';
import type { Snake } from '../../Client/index.ts';
import type { sendDocumentParams } from './SendDocument.ts';
import { Logger } from '../../Context/Logger.ts';
export interface sendVideoParams extends sendDocumentParams {
  /**
   * The duration of a video.
   */
  duration?: number;
  /**
   * The width of a video.
   */
  width?: number;
  /**
   * The height of the video.
   */
  height?: number;
  /**
   * Whether the video supports streaming or not, if it does, users don't have to wait until the file has finished downloading to watch it.
   */
  supportsStreaming?: boolean;
  /**
   * Whether the sound from video is muted or not.
   */
  muted?: boolean;
  /**
   * Number of bytes to preload when preloading videos (particularly video stories).
   */
  preloadPrefixSize?: number;
}
export async function sendVideo(
  client: Snake,
  chatId: bigint | string,
  file: string | Buffer | Readable | Files.File,
  more: sendVideoParams = {},
) {
  Logger.debug(
    `exec: send_video chat ${typeof chatId} (${chatId}) ${parseArgObjAsStr({
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
    muted,
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
            nosound: muted,
            duration: duration ?? 0,
            w: width ?? 0,
            h: height ?? 0,
            preloadPrefixSize,
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
          nosound: muted,
          duration: duration ?? 0,
          w: width ?? 0,
          h: height ?? 0,
          preloadPrefixSize,
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
          nosound: muted,
          duration: duration ?? 0,
          w: width ?? 0,
          h: height ?? 0,
          preloadPrefixSize,
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
