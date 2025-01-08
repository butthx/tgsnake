/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2025 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { TLObject } from '../../TL.ts';
import { Raw, FileId, FileType, FileTypeUniqueId } from '../../../platform.deno.ts';
import type { Snake } from '../../../Client/index.ts';
import { PhotoSize } from './PhotoSize.ts';
import { type sendStickerParams } from '../../../Methods/Messages/SendSticker.ts';

export class Sticker extends TLObject {
  fileId!: string;
  fileUniqueId!: string;
  date!: Date;
  dcId!: number;
  isAnimated!: boolean;
  isVideo!: boolean;
  size!: bigint;
  thumb!: Array<PhotoSize>;
  width!: number;
  height!: number;
  mimeType?: string;
  emoji?: string;
  constructor(
    {
      fileId,
      fileUniqueId,
      date,
      dcId,
      isAnimated,
      isVideo,
      size,
      thumb,
      width,
      height,
      mimeType,
      emoji,
    }: {
      fileId: string;
      fileUniqueId: string;
      date: Date;
      dcId: number;
      isAnimated: boolean;
      isVideo: boolean;
      size: bigint;
      thumb: Array<PhotoSize>;
      width: number;
      height: number;
      mimeType?: string;
      emoji?: string;
    },
    client: Snake,
  ) {
    super(client);
    this.fileId = fileId;
    this.fileUniqueId = fileUniqueId;
    this.date = date;
    this.dcId = dcId;
    this.isAnimated = isAnimated;
    this.isVideo = isVideo;
    this.size = size;
    this.thumb = thumb;
    this.width = width;
    this.height = height;
    this.mimeType = mimeType;
    this.emoji = emoji;
  }
  static parse(client: Snake, document: Raw.Document): Sticker {
    const { fileId, fileUniqueId } = FileId.encode({
      version: 4,
      subVersion: 32,
      dcId: document.dcId,
      fileType: FileType.STICKER,
      fileTypeUniqueId: FileTypeUniqueId.DOCUMENT,
      volumeId: BigInt(0),
      localId: 0,
      id: document.id,
      accessHash: document.accessHash,
      fileReference: document.fileReference,
    });
    let thumb: Array<PhotoSize> = [];
    let image: Raw.DocumentAttributeImageSize | undefined = undefined;
    let video: Raw.DocumentAttributeVideo | undefined = undefined;
    let sticker: Raw.DocumentAttributeSticker | Raw.DocumentAttributeCustomEmoji | undefined =
      undefined;
    for (let attribute of document.attributes) {
      if (!image && attribute instanceof Raw.DocumentAttributeImageSize) {
        image = attribute as Raw.DocumentAttributeImageSize;
      }
      if (!video && attribute instanceof Raw.DocumentAttributeVideo) {
        video = attribute as Raw.DocumentAttributeVideo;
      }
      if (!sticker && attribute instanceof Raw.DocumentAttributeSticker) {
        sticker = attribute as Raw.DocumentAttributeSticker;
      }
      if (!sticker && attribute instanceof Raw.DocumentAttributeCustomEmoji) {
        sticker = attribute as Raw.DocumentAttributeCustomEmoji;
      }
    }
    if (document.thumbs) {
      for (let t of document.thumbs) {
        if (t instanceof Raw.PhotoSize) {
          thumb.push(
            PhotoSize.parse(
              client,
              t as Raw.PhotoSize,
              document.id,
              document.accessHash,
              document.fileReference,
              document.dcId,
            ),
          );
        }
      }
    }
    return new Sticker(
      {
        fileId,
        fileUniqueId,
        thumb,
        date: new Date(document.date * 1000),
        dcId: document.dcId,
        isAnimated: document.mimeType === 'application/x-tgsticker',
        isVideo: document.mimeType === 'video/webm',
        size: BigInt(document.size),
        mimeType: document.mimeType,
        emoji: sticker ? sticker.alt : undefined,
        width: image ? image.w : video ? video.w : 512,
        height: image ? image.h : video ? video.h : 512,
      },
      client,
    );
  }
  /**
   * Resend this sticker to a different chat.
   * @param { bigint | string } chatId - Destination.
   * @param { sendStickerParams } more - Extra param for sending message, like parseMode, replyToMsgId, etc..
   */
  resend(chatId: bigint | string, more: sendStickerParams) {
    return this.api.sendSticker(chatId, this.fileId, more);
  }
}
