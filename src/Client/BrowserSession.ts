/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2025 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { Storages, Raws, Helpers, Buffer } from '../platform.deno.ts';
import { Logger } from '../Context/Logger.ts';
import {
  buildBytesFromPeer,
  buildPeerFromBytes,
  buildBytesFromSecretChat,
  buildSecretChatFromBytes,
} from './SnakeSession.ts';

export class BrowserSession extends Storages.BaseSession {
  private _name!: string;
  constructor(name: string) {
    super();
    this._name = name;
  }
  override async load() {
    const sessionName = `${this._name}.session`;
    if (localStorage.getItem(sessionName) !== null) {
      const start = Math.floor(Date.now() / 1000);
      const bytes = Buffer.from(localStorage.getItem(sessionName) as string, 'base64');
      Logger.debug(`Session have a ${bytes.length} bytes`);
      this._dcId = bytes.readUInt8(0); // 1
      Logger.debug(`Found dcId: ${this._dcId}.`);
      this._apiId = bytes.readUInt32LE(1); // 5
      Logger.debug(`Found apiId: ${this._apiId}.`);
      this._testMode = bytes.readUInt8(5) ? true : false; // 6
      Logger.debug(`Found testMode: ${this._testMode}.`);
      this._authKey = bytes.subarray(6, 262); // 262
      Logger.debug(`Found authKey: ${this._authKey.length} bytes.`);
      this._userId = BigInt(`0x${bytes.subarray(262, 270).toString('hex')}`); // 270
      Logger.debug(`Found userId: ${this._userId}.`);
      this._isBot = bytes.readUInt8(270) ? true : false; // 271
      Logger.debug(`Found isBot: ${this._isBot}.`);
      Logger.debug(`Done parsing string session (${Math.floor(Date.now() / 1000) - start}s)`);
    }
    const [peers, secretChats] = await this._loadCache();
    for (const peer of peers) {
      this._peers.set(peer[0], peer);
    }
    for (let secretChat of secretChats) {
      this._secretChats.set(secretChat.id, secretChat);
    }
  }
  override async save() {
    const sessionName = `${this._name}.session`;
    const cacheName = `${this._name}.cache`;
    // save session when it unavailable.
    if (localStorage.getItem(sessionName) !== null) {
      localStorage.setItem(sessionName, Helpers.base64urlTobase64(await this.exportString()));
      Logger.info(`Session saved to: "localStorage:${sessionName}".`);
    }
    localStorage.setItem(cacheName, (await this._makeCache()).toString('base64'));
    Logger.info(`Cache saved to: "localStorage:${cacheName}".`);
  }
  /**
   * Load the tgsnake peers cache.
   */
  private async _loadCache(): Promise<
    [
      Array<
        [
          id: bigint,
          accessHash: bigint,
          type: string,
          username?: Array<string>,
          phoneNumber?: string,
        ]
      >,
      Array<Storages.SecretChat>,
    ]
  > {
    const peer: Array<any> = [];
    const cacheName = `${this._name}.cache`;
    let e2e: Array<Storages.SecretChat> = [];
    if (localStorage.getItem(cacheName) !== null) {
      const buffer = Buffer.from(localStorage.getItem(cacheName) as string, 'base64');
      if (buffer[0] === 2) {
        Logger.info(`Load cache version: 2`);
        const bytes = new Raws.BytesIO(buffer.subarray(1));
        // bytes[version + CacheBytesLength + CacheBytes[VectorLength + VectorBytes[bytes[contentLength + content]]] + E2EBytesLength + E2E]
        const cacheLength = await Raws.Primitive.Int.read(bytes);
        const cacheBytes = new Raws.BytesIO(await bytes.read(cacheLength));
        const peerLength = await Raws.Primitive.Int.read(cacheBytes);
        const E2ELength = await Raws.Primitive.Int.read(bytes);
        if (E2ELength) {
          e2e = await this._loadE2E(await bytes.read(E2ELength));
        }
        for (let i = 0; i < peerLength; i++) {
          const count = await Raws.Primitive.Int.read(cacheBytes);
          peer.push(await buildPeerFromBytes(cacheBytes.read(count)));
        }
      } else {
        // legacy version
        Logger.info(`Load cache version: 1`);
        const bytes = new Raws.BytesIO(buffer);
        const length = await Raws.Primitive.Int.read(bytes);
        // bytes[VectorLength + VectorBytes[bytes[contentLength + content]]]
        for (let i = 0; i < length; i++) {
          let count = await Raws.Primitive.Int.read(bytes);
          peer.push(await buildPeerFromBytes(bytes.read(count)));
        }
      }
    }
    return [
      peer as unknown as Array<
        [
          id: bigint,
          accessHash: bigint,
          type: string,
          username?: Array<string>,
          phoneNumber?: string,
        ]
      >,
      e2e,
    ];
  }
  private async _loadE2E(bytes: Buffer): Promise<Array<Storages.SecretChat>> {
    const secretChat: Array<Storages.SecretChat> = [];
    if (bytes[0] === 1) {
      const b = new Raws.BytesIO(bytes.slice(1));
      const length = await Raws.Primitive.Int.read(b);
      // bytes[version + VectorLength + VectorBytes[bytes[contentLength + content]]]
      for (let i = 0; i < length; i++) {
        const count = await Raws.Primitive.Int.read(b);
        secretChat.push(await buildSecretChatFromBytes(b.read(count)));
      }
    }
    return secretChat;
  }
  /**
   * Make a bytes cache of peers.
   */
  private async _makeCache(): Promise<Buffer> {
    let count = 0;
    const bytes = new Raws.BytesIO();
    for (const [, value] of this._peers) {
      count += 1;
      const content = await buildBytesFromPeer(value);
      bytes.write(Buffer.concat([Raws.Primitive.Int.write(content.length), content]));
    }
    let e2e = Buffer.alloc(0);
    if (this._secretChats.size) {
      e2e = await this._makeE2E();
    }
    // bytes[version + CacheBytesLength + CacheBytes[VectorLength + VectorBytes[bytes[contentLength + content]]] + E2EBytesLength + E2E]
    const cache = Buffer.concat([Raws.Primitive.Int.write(count), bytes.buffer]);
    return Buffer.concat([
      Buffer.from([2]),
      Raws.Primitive.Int.write(cache.length),
      cache,
      Raws.Primitive.Int.write(e2e.length),
      e2e,
    ]);
  }
  private async _makeE2E(): Promise<Buffer> {
    let count = 0;
    const bytes = new Raws.BytesIO();
    for (const [, value] of this._secretChats) {
      count += 1;
      const content = await buildBytesFromSecretChat(value);
      bytes.write(Buffer.concat([Raws.Primitive.Int.write(content.length), content]));
    }
    // bytes[version + VectorLength - VectorBytes[bytes[contentLength + content]]]
    return Buffer.concat([Buffer.from([1]), Raws.Primitive.Int.write(count), bytes.buffer]);
  }
  /** @hidden */
  [Symbol.for('nodejs.util.inspect.custom')](): { [key: string]: any } {
    const toPrint: { [key: string]: any } = {
      _: this.constructor.name,
    };
    for (const key in this) {
      if (this.hasOwnProperty(key)) {
        const value = this[key];
        if (!key.startsWith('_')) {
          toPrint[key] = value;
        }
      }
    }
    return toPrint;
  }
  /**@hidden*/
  override toJSON(): { [key: string]: any } {
    const toPrint: { [key: string]: any } = {
      _: this.constructor.name,
    };
    for (const key in this) {
      if (this.hasOwnProperty(key)) {
        const value = this[key];
        if (!key.startsWith('_')) {
          toPrint[key] = typeof value === 'bigint' ? String(value) : value;
        }
      }
    }
    return toPrint;
  }
  /** @hidden */
  override toString(): string {
    return `[constructor of ${this.constructor.name}] ${JSON.stringify(this, null, 2)}`;
  }
}
