/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2023 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { TLObject } from '../../TL.ts';
import {
  Raw,
  Helpers,
  FileId,
  FileType,
  ThumbnailSource,
  FileTypeUniqueId,
} from '../../../platform.deno.ts';
import type { Snake } from '../../../Client/index.ts';
import { PhotoSize } from './PhotoSize.ts';

// https://core.telegram.org/bots/api#voice
export class Voice extends TLObject {
  fileId!: string;
  fileUniqueId!: string;
  duration!: number;
  thumb!: Array<PhotoSize>;
  date!: Date;
  dcId!: number;
  performer?: string;
  title?: string;
  filename?: string;
  mimeType?: string;
  fileSize?: bigint;
  constructor(
    {
      fileId,
      fileUniqueId,
      duration,
      thumb,
      date,
      dcId,
      performer,
      title,
      filename,
      mimeType,
      fileSize,
    }: {
      fileId: string;
      fileUniqueId: string;
      duration: number;
      thumb: Array<PhotoSize>;
      date: Date;
      dcId: number;
      performer?: string;
      title?: string;
      filename?: string;
      mimeType?: string;
      fileSize?: bigint;
    },
    client: Snake,
  ) {
    super(client);
    this.className = 'voice';
    this.classType = 'types';
    this.constructorId = 0x8fd4c4d8; // Raw.Document
    this.subclassOfId = 0x211fe820; // Raw.Document
    this.fileId = fileId;
    this.fileUniqueId = fileUniqueId;
    this.duration = duration;
    this.thumb = thumb;
    this.date = date;
    this.dcId = dcId;
    this.performer = performer;
    this.title = title;
    this.filename = filename;
    this.mimeType = mimeType;
    this.fileSize = fileSize;
  }
  static parse(client: Snake, document: Raw.Document): Voice {
    const { fileId, fileUniqueId } = FileId.encode({
      version: 4,
      subVersion: 32,
      dcId: document.dcId,
      fileType: FileType.VOICE,
      fileTypeUniqueId: FileTypeUniqueId.DOCUMENT,
      volumeId: BigInt(0),
      localId: 0,
      id: document.id,
      accessHash: document.accessHash,
      fileReference: document.fileReference,
    });
    let duration: number = 0;
    let thumb: Array<PhotoSize> = [];
    let performer: string | undefined;
    let title: string | undefined;
    let filename: string | undefined;
    for (let attribute of document.attributes) {
      if (attribute instanceof Raw.DocumentAttributeAudio) {
        attribute as Raw.DocumentAttributeAudio;
        duration = attribute.duration;
        title = attribute.title;
        performer = attribute.performer;
      }
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
    return new Voice(
      {
        fileId,
        fileUniqueId,
        duration,
        thumb,
        performer,
        title,
        filename,
        mimeType: document.mimeType,
        fileSize: document.size,
        dcId: document.dcId,
        date: new Date(document.date * 1000),
      },
      client,
    );
  }
}
