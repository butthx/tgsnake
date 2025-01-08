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
import { type sendAnimationParams } from '../../../Methods/Messages/SendAnimation.ts';
import { PhotoSize } from './PhotoSize.ts';

// https://core.telegram.org/bots/api#animation
export class Animation extends TLObject {
  /**
   * Identifier for this file, which can be used to download or reuse the file.
   */
  fileId!: string;
  /**
   * Unique identifier for this file, which is supposed to be the same over time and for different bots. Can't be used to download or reuse the file.
   */
  fileUniqueId!: string;
  width!: number;
  height!: number;
  duration!: number;
  thumb!: Array<PhotoSize>;
  date!: Date;
  dcId!: number;
  filename?: string;
  mimeType?: string;
  fileSize?: bigint;
  constructor(
    {
      fileId,
      fileUniqueId,
      width,
      height,
      duration,
      thumb,
      date,
      dcId,
      filename,
      mimeType,
      fileSize,
    }: {
      fileId: string;
      fileUniqueId: string;
      width: number;
      height: number;
      duration: number;
      thumb: Array<PhotoSize>;
      date: Date;
      dcId: number;
      filename?: string;
      mimeType?: string;
      fileSize?: bigint;
    },
    client: Snake,
  ) {
    super(client);
    this.fileId = fileId;
    this.fileUniqueId = fileUniqueId;
    this.width = width;
    this.height = height;
    this.duration = duration;
    this.thumb = thumb;
    this.date = date;
    this.dcId = dcId;
    this.filename = filename;
    this.mimeType = mimeType;
    this.fileSize = fileSize;
  }
  static parse(client: Snake, document: Raw.Document) {
    const { fileId, fileUniqueId } = FileId.encode({
      version: 4,
      subVersion: 32,
      dcId: document.dcId,
      fileType: FileType.ANIMATION,
      fileTypeUniqueId: FileTypeUniqueId.DOCUMENT,
      volumeId: BigInt(0),
      localId: 0,
      id: document.id,
      accessHash: document.accessHash,
      fileReference: document.fileReference,
    });
    let width: number = 0;
    let height: number = 0;
    let duration: number = 0;
    let filename: string | undefined;
    let thumb: Array<PhotoSize> = [];
    for (let attribute of document.attributes) {
      if (attribute instanceof Raw.DocumentAttributeVideo) {
        attribute as Raw.DocumentAttributeVideo;
        // supportStreaming = attribute.supportsStreaming ?? false;
        duration = attribute.duration;
        width = attribute.w;
        height = attribute.h;
      }
      if (attribute instanceof Raw.DocumentAttributeFilename) {
        attribute as Raw.DocumentAttributeFilename;
        filename = attribute.fileName;
      }
      // if (attribute instanceof Raw.DocumentAttributeHasStickers) {
      //   attribute as Raw.DocumentAttributeHasStickers;
      //   hasSticker = true;
      // }
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
    return new Animation(
      {
        fileId,
        fileUniqueId,
        width,
        height,
        thumb,
        filename,
        duration,
        fileSize: document.size,
        mimeType: document.mimeType,
        dcId: document.dcId,
        date: new Date(document.date * 1000),
      },
      client,
    );
  }
  /**
   * Resend this animation to a different chat.
   * @param { bigint | string } chatId - Destination.
   * @param { sendAnimationParams } more - Extra param for sending message, like parseMode, replyToMsgId, etc..
   */
  resend(chatId: bigint | string, more: sendAnimationParams) {
    return this.api.sendAnimation(chatId, this.fileId, more);
  }
}
