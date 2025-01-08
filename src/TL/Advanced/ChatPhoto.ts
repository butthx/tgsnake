/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2025 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { TLObject } from '../TL.ts';
import { Raw, FileId, FileType, ThumbnailSource, FileTypeUniqueId } from '../../platform.deno.ts';
import type { Snake } from '../../Client/index.ts';

export class ChatPhoto extends TLObject {
  smallFileId!: string;
  smallUniqueId!: string;
  bigFileId!: string;
  bigUniqueId!: string;
  constructor(
    {
      smallFileId,
      smallUniqueId,
      bigFileId,
      bigUniqueId,
    }: {
      smallFileId: string;
      smallUniqueId: string;
      bigFileId: string;
      bigUniqueId: string;
    },
    client: Snake,
  ) {
    super(client);
    this.smallUniqueId = smallUniqueId;
    this.smallFileId = smallFileId;
    this.bigFileId = bigFileId;
    this.bigUniqueId = bigUniqueId;
  }
  static parse(
    client: Snake,
    chatPhoto?: Raw.TypeChatPhoto | Raw.TypeUserProfilePhoto,
    chatId?: bigint,
    chatAccessHash?: bigint,
  ): ChatPhoto | undefined {
    if (!chatPhoto) return;
    if (chatPhoto instanceof Raw.ChatPhoto) {
      chatPhoto as Raw.ChatPhoto;
      if (chatPhoto.photoId && chatPhoto.dcId && chatId && chatAccessHash) {
        let bigFileId = FileId.encode({
          version: 4,
          subVersion: 32,
          fileType: FileType.CHAT_PHOTO,
          thumbnailSource: ThumbnailSource.CHAT_PHOTO_BIG,
          thumbnailFileType: FileType.CHAT_PHOTO,
          fileTypeUniqueId: FileTypeUniqueId.DOCUMENT,
          id: chatPhoto.photoId,
          dcId: chatPhoto.dcId,
          accessHash: BigInt(0),
          volumeId: BigInt(0),
          localId: 0,
          chatId: chatId,
          chatAccessHash: chatAccessHash,
        });
        let smallFileId = FileId.encode({
          version: 4,
          subVersion: 32,
          fileType: FileType.CHAT_PHOTO,
          thumbnailSource: ThumbnailSource.CHAT_PHOTO_SMALL,
          thumbnailFileType: FileType.CHAT_PHOTO,
          fileTypeUniqueId: FileTypeUniqueId.DOCUMENT,
          id: chatPhoto.photoId,
          dcId: chatPhoto.dcId,
          accessHash: BigInt(0),
          volumeId: BigInt(0),
          localId: 0,
          chatId: chatId!,
          chatAccessHash: chatAccessHash!,
        });
        return new ChatPhoto(
          {
            smallFileId: smallFileId.fileId,
            smallUniqueId: smallFileId.fileUniqueId,
            bigFileId: bigFileId.fileId,
            bigUniqueId: bigFileId.fileUniqueId,
          },
          client,
        );
      }
    }
    if (chatPhoto instanceof Raw.UserProfilePhoto) {
      chatPhoto as Raw.UserProfilePhoto;
      let bigFileId = FileId.encode({
        version: 4,
        subVersion: 32,
        fileType: FileType.CHAT_PHOTO,
        thumbnailSource: ThumbnailSource.CHAT_PHOTO_BIG,
        thumbnailFileType: FileType.CHAT_PHOTO,
        fileTypeUniqueId: FileTypeUniqueId.DOCUMENT,
        id: chatPhoto.photoId,
        dcId: chatPhoto.dcId,
        accessHash: BigInt(0),
        volumeId: BigInt(0),
        localId: 0,
        chatId,
        chatAccessHash,
      });
      let smallFileId = FileId.encode({
        version: 4,
        subVersion: 32,
        fileType: FileType.CHAT_PHOTO,
        thumbnailSource: ThumbnailSource.CHAT_PHOTO_SMALL,
        thumbnailFileType: FileType.CHAT_PHOTO,
        fileTypeUniqueId: FileTypeUniqueId.DOCUMENT,
        id: chatPhoto.photoId,
        dcId: chatPhoto.dcId,
        accessHash: BigInt(0),
        volumeId: BigInt(0),
        localId: 0,
        chatId,
        chatAccessHash,
      });
      return new ChatPhoto(
        {
          smallFileId: smallFileId.fileId,
          smallUniqueId: smallFileId.fileUniqueId,
          bigFileId: bigFileId.fileId,
          bigUniqueId: bigFileId.fileUniqueId,
        },
        client,
      );
    }
    return;
  }
}
