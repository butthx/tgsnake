/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2024 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { TLObject } from '../TL/TL.ts';
import { Raw, type Readable, type Files, Buffer } from '../platform.deno.ts';
import type { Snake } from '../Client/index.ts';
import {
  getMessages,
  sendMessage,
  type sendMessageParams,
  sendDocument,
  type sendDocumentParams,
  sendVideo,
  type sendVideoParams,
  sendVideoNote,
  type sendVideoNoteParams,
  sendAnimation,
  type sendAnimationParams,
  sendSticker,
  type sendStickerParams,
  sendAudio,
  type sendAudioParams,
  download,
  type DownloadParams,
  deleteMessages,
} from './Messages/index.ts';
import { getParticipants, type getParticipantsParams } from './Chats/index.ts';

export class Telegram extends TLObject {
  constructor(client: Snake) {
    super(client);
  }
  /**
   * Downloading document or photo.
   * @param {DownloadParams} params - Parameters required to download files, such as fileId, chatId, fileSize and so on.
   */
  download(params: DownloadParams) {
    return download(this.client!, params);
  }
  /**
   * Delete single message.
   * This function allow you to delete one message.
   * @param {string | bigint} chatId - Chat.
   * @param {number} message - Message id to be deleted.
   * @return {true}
   */
  deleteMessage(chatId: string | bigint, message: number) {
    return deleteMessages(this.client!, chatId, [message]);
  }
  /**
   * Delete multiple messages.
   * This function allow you to delete messages more than one.
   * @param {string | bigint} chatId - Chat.
   * @param {Array} messages - Message id to be deleted.
   * @return {true}
   */
  deleteMessages(chatId: string | bigint, messages: Array<number>) {
    return deleteMessages(this.client!, chatId, messages);
  }
  /**
   * Requesting function using raw api.
   * Raw api is a function constructor which is declared in the telegram schema.
   * @param {T} query - Constructor which will be sent to the Telegram server.
   * @param {number} retries - If the function fails, how many attempts should it run.
   * @param {number} timeout - The maximum time limit for running the <query> function.
   * @param {number} sleepTreshold - Pause sleep time if a flood occurs.
   */
  invoke<T extends Raw.TypesTLRequest>(
    query: T,
    retries?: number,
    timeout?: number,
    sleepTreshold?: number,
  ): Promise<T['__response__']> {
    return this.client._client.invoke(query, retries, timeout, sleepTreshold);
  }
  getMessages(
    chatId: bigint | string,
    msgIds?: Array<number>,
    replyToMsgIds?: Array<number>,
    replies?: number,
  ) {
    return getMessages(this.client!, chatId, msgIds, replyToMsgIds, replies);
  }
  /**
   * Sending a text message.
   * > [message].respond
   * > [message].reply
   *
   * @param { bigint | string } chatId - Destination.
   * @param { string } text - Message which will sending.
   * @param { sendMessageParams } more - Extra param for sending message, like parseMode, replyToMsgId, etc..
   */
  sendMessage(chatId: bigint | string, text: string, more?: sendMessageParams) {
    return sendMessage(this.client!, chatId, text, more);
  }
  /**
   * Sending a document message.
   * > Shorthand :
   * > [document].resend
   * > [message].replyWithDoc
   * > [message].rwd
   *
   * @param { bigint | string } chatId - Destination.
   * @param { string | Buffer | Readable | Files.File } document - File to be sent. The file can be a fileId or path where the file is located or a buffer of the file or streamable which can be piped.
   * @param { sendDocumentParams } more - Extra param for sending message, like parseMode, replyToMsgId, etc..
   */
  sendDocument(
    chatId: bigint | string,
    document: string | Buffer | Readable | Files.File,
    more?: sendDocumentParams,
  ) {
    return sendDocument(this.client!, chatId, document, more);
  }
  /**
   * Use this method to send video files.
   * > Shorthand :
   * > [video].resend
   * > [message].replyWithVideo
   * > [message].rwv
   *
   * @param { bigint | string } chatId - Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   * @param { string | Buffer | Readable | Files.File } video - File to be sent. The file can be a fileId or path where the file is located or a buffer of the file or streamable which can be piped.
   * @param { sendVideoParams } more - Extra param for sending message, like parseMode, replyToMsgId, etc..
   */
  sendVideo(
    chatId: bigint | string,
    video: string | Buffer | Readable | Files.File,
    more?: sendVideoParams,
  ) {
    return sendVideo(this.client!, chatId, video, more);
  }
  /**
   * As of v.4.0, Telegram clients support rounded square MPEG4 videos of up to 1 minute long.
   * > Shorthand :
   * > [video note].resend
   * > [message].replyWithVideoNote
   * > [message].rwvn
   *
   * @param { bigint | string } chatId - Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   * @param { string | Buffer | Readable | Files.File } video - File to be sent. The file can be a fileId or path where the file is located or a buffer of the file or streamable which can be piped.
   * @param { sendVideoNoteParams } more - Extra param for sending message, like parseMode, replyToMsgId, etc..
   */
  sendVideoNote(
    chatId: bigint | string,
    video: string | Buffer | Readable | Files.File,
    more?: sendVideoNoteParams,
  ) {
    return sendVideoNote(this.client!, chatId, video, more);
  }
  /**
   * Use this method to send animation files (GIF or H.264/MPEG-4 AVC video without sound).
   * > Shorthand :
   * > [animation].resend
   * > [message].replyWithAnimation
   * > [message].rwa
   *
   * @param { bigint | string } chatId - Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   * @param { string | Buffer | Readable | Files.File } video - File to be sent. The file can be a fileId or path where the file is located or a buffer of the file or streamable which can be piped.
   * @param { sendAnimationParams } more - Extra param for sending message, like parseMode, replyToMsgId, etc..
   */
  sendAnimation(
    chatId: bigint | string,
    video: string | Buffer | Readable | Files.File,
    more?: sendAnimationParams,
  ) {
    return sendAnimation(this.client!, chatId, video, more);
  }
  /**
   * Use this method to send static .WEBP, animated .TGS, or video .WEBM stickers.
   * > Shorthand :
   * > [sticker].resend
   * > [message].replyWithSticker
   * > [message].rws
   *
   * @param { bigint | string } chatId - Destination.
   * @param { string | Buffer | Readable | Files.File } sticker - Sticker to be sent. The file can be a fileId or path where the file is located or a buffer of the file or streamable which can be piped.
   * @param { sendStickerParams } more - Extra param for sending message, like parseMode, replyToMsgId, etc..
   */
  sendSticker(
    chatId: bigint | string,
    sticker: string | Buffer | Readable | Files.File,
    more?: sendStickerParams,
  ) {
    return sendSticker(this.client!, chatId, sticker, more);
  }
  /**
   * Use this method to send audio file.
   * > Shorthand :
   * > [audio].resend
   * > [message].replyWithAudio
   * > [message].rwa
   *
   * @param { bigint | string } chatId - Destination.
   * @param { string | Buffer | Readable | Files.File } audio- Audio file to be sent. The file can be a fileId or path where the file is located or a buffer of the file or streamable which can be piped.
   * @param { sendAudioParams } more - Extra param for sending message, like parseMode, replyToMsgId, etc..
   */
  sendAudio(
    chatId: bigint | string,
    audio: string | Buffer | Readable | Files.File,
    more?: sendAudioParams,
  ) {
    return sendAudio(this.client!, chatId, audio, more);
  }
  getParticipants(chatId: bigint | string, more?: getParticipantsParams) {
    return getParticipants(this.client, chatId, more);
  }
}
