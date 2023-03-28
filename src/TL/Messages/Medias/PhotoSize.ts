/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2023 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { TLObject } from '../../TL';
import { Raw, Helpers } from '@tgsnake/core';
import type { Snake } from '../../../Client';
import { FileId, FileType, ThumbnailSource, FileTypeUniqueId } from '@tgsnake/fileid';

// https://core.telegram.org/bots/api#photosize
export class PhotoSize extends TLObject {
  fileId!: string;
  fileUniqueId!: string;
  width!: number;
  height!: number;
  fileSize?: number;
  constructor(
    {
      fileId,
      fileUniqueId,
      width,
      height,
      fileSize,
    }: {
      fileId: string;
      fileUniqueId: string;
      width: number;
      height: number;
      fileSize?: number;
    },
    client: Snake
  ) {
    super(client);
    this.className = 'PhotoSize';
    this.classType = 'type';
    this.constructorId = 0x75c78e60;
    this.subclassOfId = 0x17cc29d9;
    this.fileId = fileId;
    this.fileUniqueId = fileUniqueId;
    this.width = width;
    this.height = height;
    this.fileSize = fileSize;
  }
  static parse(
    client: Snake,
    photoSize: Raw.PhotoSize,
    mediaId: bigint,
    accessHash: bigint,
    fileReference: Buffer,
    dcId: number
  ): PhotoSize {
    let file = FileId.encode({
      version: 4,
      subVersion: 32,
      fileType: FileType.THUMBNAIL,
      thumbnailSource: ThumbnailSource.THUMBNAIL,
      thumbnailFileType: FileType.THUMBNAIL,
      thumbnailSize: photoSize.type,
      fileTypeUniqueId: FileTypeUniqueId.DOCUMENT,
      volumeId: BigInt(0),
      localId: 0,
      dcId: dcId,
      id: mediaId,
      accessHash: accessHash,
      fileReference: fileReference,
    });
    return new PhotoSize(
      {
        fileId: file.fileId,
        fileUniqueId: file.fileUniqueId,
        width: photoSize.w,
        height: photoSize.h,
        fileSize: photoSize.size,
      },
      client
    );
  }
}
