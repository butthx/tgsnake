// Tgsnake - Telegram MTProto framework developed based on gram.js.
// Copyright (C) 2021 Butthx <https://guthub.com/butthx>
//
// This file is part of Tgsnake
//
// Tgsnake is a free software : you can redistribute it and/or modify
//  it under the terms of the MIT License as published.
import { Api } from 'telegram';
import { ResultGetEntity } from '../Telegram/Users/GetEntity';
import * as media from './Media';
import { decodeFileId } from 'tg-file-id';
export class ChatPhoto {
  fileId!: string;
  uniqueFileId!: string;
  isBig: boolean = true;
  constructor(photo: Api.ChatPhoto | Api.UserProfilePhoto, resultsGetEntity: ResultGetEntity) {
    let file = media.generateFileId({
      fileType: 'profile_photo',
      typeId: media.typeId.CHAT_PHOTO,
      version: 4,
      subVersion: 30,
      dcId: photo.dcId,
      id: photo.photoId,
      accessHash: BigInt(0),
      photoSizeSource: 'dialogPhoto',
      dialogId: resultsGetEntity.id,
      isSmallDialogPhoto: false,
      photoSizeSourceId: media.thumbTypeId.CHAT_PHOTO_BIG,
      dialogAccessHash: resultsGetEntity.accessHash!,
      volumeId: BigInt(1),
    });
    this.fileId = file.fileId;
    this.uniqueFileId = file.uniqueFileId;
  }
  decode(fileId?: string) {
    let file = fileId || this.fileId;
    if (!file) return `FileId not found!`;
    return decodeFileId(String(file));
  }
}
