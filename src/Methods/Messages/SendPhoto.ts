/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2025 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { sendMedia, type sendMediaParams } from './SendMedia.ts';
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
import { parseArgObjAsStr } from '../../Utilities.ts';
import type { Snake } from '../../Client/index.ts';
import { Logger } from '../../Context/Logger.ts';

export interface sendPhotoParams extends sendMediaParams {
  /**
   * Whether this media should be hidden behind a spoiler warning.
   */
  hasSpoiler?: boolean;
}

export async function sendPhoto(
  client: Snake,
  chatId: string | bigint,
  photo: string | Buffer | Readable | Files.File,
  more: sendPhotoParams = {},
) {
  Logger.debug(
    `exec: send_photo chat ${typeof chatId} (${chatId}) ${parseArgObjAsStr({
      photo,
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
    hasSpoiler,
  } = more;
  if (typeof photo === 'string') {
    photo as string;
    if (/^http/i.test(photo)) {
      var savedFile: Raw.TypeInputMedia = new Raw.InputMediaPhotoExternal({
        spoiler: hasSpoiler,
        url: photo,
      });
    } else if (/^(\/|\.\.?\/|~\/)/i.test(photo)) {
      var savedFile: Raw.TypeInputMedia = new Raw.InputMediaUploadedPhoto({
        file: (await client.core.saveFileStream({
          source: fs.createReadStream(photo),
          fileName: path.basename(photo),
        }))!,
        spoiler: hasSpoiler,
      });
    } else {
      const media = FileId.decodeFileId(photo);
      if (media.fileType === FileType.PHOTO) {
        var savedFile: Raw.TypeInputMedia = new Raw.InputMediaPhoto({
          spoiler: hasSpoiler,
          id: new Raw.InputPhoto({
            id: media.id,
            accessHash: media.accessHash,
            fileReference: media.fileReference!,
          }),
        });
      } else {
        throw new Error('invalid file id');
      }
    }
  } else if (Buffer.isBuffer(photo)) {
    photo as Buffer;
    var savedFile: Raw.TypeInputMedia = new Raw.InputMediaUploadedPhoto({
      file: (await client.core.saveFile({
        source: photo,
        fileName: `${Date.now()}.jpeg`,
      }))!,
      spoiler: hasSpoiler,
    });
  } else if ('pipe' in photo) {
    var savedFile: Raw.TypeInputMedia = new Raw.InputMediaUploadedPhoto({
      file: (await client.core.saveFileStream({
        source: photo,
        fileName: `${Date.now()}.jpeg`,
      }))!,
      spoiler: hasSpoiler,
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
