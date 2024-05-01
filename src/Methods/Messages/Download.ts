/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2024 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */

import { FileId, FileType, Raw, DOCUMENT_TYPES, Files } from '../../platform.deno.ts';
import type { Snake } from '../../Client/index.ts';
import { Logger } from '../../Context/Logger.ts';

export interface DownloadParams {
  fileId: string;
  chatId: bigint | string;
  fileSize: bigint;
  limit?: number;
  offset?: bigint;
  thumbSize?: string;
}
export async function download(
  client,
  { fileId, chatId, fileSize, limit, offset, thumbSize }: DownloadParams,
): Promise<Files.File> {
  const media = FileId.decodeFileId(fileId);
  if (DOCUMENT_TYPES.includes(media.fileType)) {
    return client.core.downloadStream(client.core.resolvePeer(chatId), {
      file: new Raw.InputDocumentFileLocation({
        id: media.id,
        accessHash: media.accessHash,
        fileReference: media.fileReference as Buffer,
        thumbSize: 'y',
      }),
      dcId: media.dcId,
      fileSize,
      limit,
      offset,
    });
  }
  return client.core.downloadStream(client.core.resolvePeer(chatId), {
    file: new Raw.InputPhotoFileLocation({
      id: media.id,
      accessHash: media.accessHash,
      fileReference: media.fileReference as Buffer,
      thumbSize: thumbSize ?? media.thumbnailSize ?? 'y',
    }),
    dcId: media.dcId,
    fileSize,
    limit,
    offset,
  });
}
