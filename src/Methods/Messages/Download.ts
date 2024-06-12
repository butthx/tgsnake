/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2024 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */

import {
  FileId,
  Raw,
  DOCUMENT_TYPES,
  Files,
  FileType,
  ThumbnailSource,
} from '../../platform.deno.ts';
import type { Snake } from '../../Client/index.ts';

export interface DownloadParams {
  fileId: string;
  fileSize: bigint;
  limit?: number;
  offset?: bigint;
  thumbSize?: string;
}
export async function download(
  client: Snake,
  { fileId, limit, offset, thumbSize }: DownloadParams,
): Promise<Files.File> {
  const media = FileId.decodeFileId(fileId);
  if (DOCUMENT_TYPES.includes(media.fileType)) {
    return client.core.downloadStream({
      file: new Raw.InputDocumentFileLocation({
        id: media.id,
        accessHash: media.accessHash,
        fileReference: media.fileReference as Buffer,
        thumbSize: 'y',
      }),
      dcId: media.dcId,
      limit,
      offset,
    });
  }
  if (media.fileType === FileType.CHAT_PHOTO) {
    return client.core.downloadStream({
      file: new Raw.InputPeerPhotoFileLocation({
        photoId: media.id,
        big: media.thumbnailSource === ThumbnailSource.CHAT_PHOTO_BIG,
        peer: await client.core.resolvePeer(media.chatId!),
      }),
      dcId: media.dcId,
      limit,
      offset,
    });
  }
  // photo
  if (media.thumbnailSource === ThumbnailSource.LEGACY) {
    return client.core.downloadStream({
      file: new Raw.InputPhotoLegacyFileLocation({
        id: media.id,
        accessHash: media.accessHash,
        fileReference: media.fileReference as Buffer,
        volumeId: media.volumeId!,
        localId: media.localId!,
        secret: media.secret!,
      }),
      dcId: media.dcId,
      limit,
      offset,
    });
  }
  return client.core.downloadStream({
    file: new Raw.InputPhotoFileLocation({
      id: media.id,
      accessHash: media.accessHash,
      fileReference: media.fileReference as Buffer,
      thumbSize: thumbSize ?? media.thumbnailSize ?? 'y',
    }),
    dcId: media.dcId,
    limit,
    offset,
  });
}
