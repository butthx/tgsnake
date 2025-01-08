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
import { type sendDocumentParams } from '../../../Methods/Messages/index.ts';
import { PhotoSize } from './PhotoSize.ts';

// https://core.telegram.org/bots/api#document
export class Document extends TLObject {
  fileId!: string;
  fileUniqueId!: string;
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
      thumb,
      date,
      dcId,
      filename,
      mimeType,
      fileSize,
    }: {
      fileId: string;
      fileUniqueId: string;
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
    this.thumb = thumb;
    this.date = date;
    this.dcId = dcId;
    this.filename = filename;
    this.mimeType = mimeType;
    this.fileSize = fileSize;
  }
  static parse(client: Snake, document: Raw.Document): Document {
    const { fileId, fileUniqueId } = FileId.encode({
      version: 4,
      subVersion: 32,
      dcId: document.dcId,
      fileType: FileType.DOCUMENT,
      fileTypeUniqueId: FileTypeUniqueId.DOCUMENT,
      volumeId: BigInt(0),
      localId: 0,
      id: document.id,
      accessHash: document.accessHash,
      fileReference: document.fileReference,
    });
    let thumb: Array<PhotoSize> = [];
    let filename: string | undefined;
    for (let attribute of document.attributes) {
      if (attribute instanceof Raw.DocumentAttributeFilename) {
        attribute as Raw.DocumentAttributeFilename;
        filename = attribute.fileName;
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
    return new Document(
      {
        fileId,
        fileUniqueId,
        thumb,
        filename,
        mimeType: document.mimeType,
        fileSize: document.size,
        dcId: document.dcId,
        date: new Date(document.date * 1000),
      },
      client,
    );
  }
  /**
   * Resend this document to a different chat.
   * @param { bigint | string } chatId - Destination.
   * @param { sendDocumentParams } more - Extra param for sending message, like parseMode, replyToMsgId, etc..
   */
  resend(chatId: string | bigint, more?: sendDocumentParams) {
    return this.api.sendDocument(chatId, this.fileId, more);
  }
}
