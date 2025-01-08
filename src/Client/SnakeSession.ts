/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2025 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { Storages, Raws, Helpers, path, Buffer } from '../platform.deno.ts';
import fs from 'node:fs';
import { Logger } from '../Context/Logger.ts';

export class SnakeSession extends Storages.BaseSession {
  private _name!: string;
  private _sessionDir!: string;
  private _sessionExt!: string;
  private _cacheDir!: string;
  private _cacheExt!: string;
  constructor(
    name: string,
    sessionDir: string,
    sessionExt: string,
    cacheDir: string,
    cacheExt: string,
  ) {
    super();
    this._name = name;
    this._sessionDir = sessionDir;
    this._sessionExt = sessionExt;
    this._cacheDir = cacheDir;
    this._cacheExt = cacheExt;
  }
  override async load() {
    const sessionName = `${this._name}.${this._sessionExt.replace(/^\./, '')}`;
    if (fs.existsSync(path.join(this._sessionDir, sessionName))) {
      const start = Math.floor(Date.now() / 1000);
      const bytes = fs.readFileSync(path.join(this._sessionDir, sessionName));
      Logger.debug(`Session have a ${Buffer.byteLength(bytes)} bytes`);
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
    for (const secretChat of secretChats) {
      this._secretChats.set(secretChat.id, secretChat);
    }
  }
  override async save() {
    const sessionName = `${this._name}.${this._sessionExt.replace(/^\./, '')}`;
    const cacheName = `${this._name}.${this._cacheExt.replace(/^\./, '')}`;
    // save session when it unavailable.
    if (!fs.existsSync(path.join(this._sessionDir, sessionName))) {
      fs.writeFileSync(
        path.join(this._sessionDir, sessionName),
        Buffer.from(Helpers.base64urlTobase64(await this.exportString()), 'base64'),
      );
      Logger.info(`Session saved to: "${path.join(this._sessionDir, sessionName)}".`);
    }
    fs.writeFileSync(path.join(this._cacheDir, cacheName), await this._makeCache());
    Logger.info(`Cache saved to: "${path.join(this._cacheDir, cacheName)}".`);
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
    const peer: Array<
      [id: bigint, accessHash: bigint, type: string, username?: Array<string>, phoneNumber?: string]
    > = [];
    const cacheName = `${this._name}.${this._cacheExt.replace(/^\./, '')}`;
    let e2e: Array<Storages.SecretChat> = [];
    if (fs.existsSync(path.join(this._cacheDir, cacheName))) {
      const buffer = fs.readFileSync(path.join(this._cacheDir, cacheName));
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
      let b = new Raws.BytesIO(bytes.slice(1));
      let length = await Raws.Primitive.Int.read(b);
      // bytes[version + VectorLength + VectorBytes[bytes[contentLength + content]]]
      for (let i = 0; i < length; i++) {
        let count = await Raws.Primitive.Int.read(b);
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
/**
 * Creating valid bytes from peer schema.
 * @param peer {Array} - Peer will be convert to bytes
 */
export function buildBytesFromPeer(
  peer: [
    id: bigint,
    accessHash: bigint,
    type: string,
    username?: Array<string>,
    phoneNumber?: string,
  ],
): Buffer {
  let bytes = new Raws.BytesIO();
  let flags = 0;
  if (peer[3]) {
    flags |= 1 << 6;
  }
  if (peer[4]) {
    flags |= 1 << 5;
  }
  bytes.write(Raws.Primitive.Int.write(flags));
  bytes.write(Raws.Primitive.Long.write(peer[0]));
  bytes.write(Raws.Primitive.Long.write(peer[1]));
  bytes.write(Raws.Primitive.String.write(peer[2]));
  if (peer[3]) {
    bytes.write(Raws.Primitive.Vector.write(peer[3], Raws.Primitive.String));
  }
  if (peer[4]) {
    bytes.write(Raws.Primitive.String.write(peer[4]));
  }
  return bytes.buffer;
}
/**
 * Creating valid peer schema from bytes.
 * @param bytes {Buffer} - Bytes will be converted to peer schema.
 */
export async function buildPeerFromBytes(
  bytes: Buffer,
): Promise<
  [id: bigint, accessHash: bigint, type: string, username?: Array<string>, phoneNumber?: string]
> {
  let b = new Raws.BytesIO(bytes);
  let results: Array<any> = [];
  let flags = await Raws.Primitive.Int.read(b);
  results.push(await Raws.Primitive.Long.read(b));
  results.push(await Raws.Primitive.Long.read(b));
  results.push(await Raws.Primitive.String.read(b));
  if (flags & (1 << 4)) {
    results.push([await Raws.Primitive.String.read(b)]);
  } else if (flags & (1 << 6)) {
    results.push(await Raws.Primitive.Vector.read(b), Raws.Primitive.String);
  }
  if (flags & (1 << 5)) {
    results.push(await Raws.Primitive.String.read(b));
  }
  return results as unknown as [
    id: bigint,
    accessHash: bigint,
    type: string,
    username?: Array<string>,
    phoneNumber?: string,
  ];
}

export function buildBytesFromSecretChat(secretChat: Storages.SecretChat): Buffer {
  const bytes = new Raws.BytesIO();
  let flags = 0;
  if (secretChat.rekeyStep) {
    flags |= 1 << 3;
  }
  if (secretChat.rekeyExchange) {
    flags |= 1 << 4;
  }
  if (secretChat.adminId) {
    flags |= 1 << 5;
  }
  if (secretChat.ttl) {
    flags |= 1 << 6;
  }
  bytes.write(Raws.Primitive.Int.write(flags));
  bytes.write(Raws.Primitive.Int.write(secretChat.id));
  bytes.write(Raws.Primitive.Long.write(secretChat.accessHash));
  bytes.write(Raws.Primitive.Bool.write(secretChat.isAdmin));
  bytes.write(Raws.Primitive.Bytes.write(secretChat.authKey));
  bytes.write(Raws.Primitive.Int.write(secretChat.mtproto));
  bytes.write(Raws.Primitive.Int.write(secretChat.layer));
  bytes.write(Raws.Primitive.Int.write(secretChat.inSeqNo));
  bytes.write(Raws.Primitive.Int.write(secretChat.outSeqNo));
  bytes.write(Raws.Primitive.Int.write(secretChat.inSeqNoX));
  bytes.write(Raws.Primitive.Int.write(secretChat.outSeqNoX));
  bytes.write(Raws.Primitive.Int.write(secretChat.timeRekey));
  bytes.write(Raws.Primitive.Float.write(secretChat.created));
  bytes.write(Raws.Primitive.Float.write(secretChat.changed));
  if (secretChat.rekeyStep) {
    bytes.write(Raws.Primitive.Int.write(secretChat.rekeyStep));
  }
  if (secretChat.rekeyExchange) {
    bytes.write(Raws.Primitive.Long.write(secretChat.rekeyExchange));
  }
  if (secretChat.adminId) {
    bytes.write(Raws.Primitive.Long.write(secretChat.adminId));
  }
  if (secretChat.ttl) {
    bytes.write(Raws.Primitive.Int.write(secretChat.ttl));
  }
  return bytes.buffer;
}
export async function buildSecretChatFromBytes(bytes: Buffer): Promise<Storages.SecretChat> {
  const b = new Raws.BytesIO(bytes);
  const flags = await Raws.Primitive.Int.read(b);
  const id = await Raws.Primitive.Int.read(b);
  const accessHash = await Raws.Primitive.Long.read(b);
  const isAdmin = await Raws.Primitive.Bool.read(b);
  const authKey = await Raws.Primitive.Bytes.read(b);
  const secretChat = new Storages.SecretChat({
    id,
    accessHash,
    isAdmin,
    authKey,
  });
  secretChat.mtproto = await Raws.Primitive.Int.read(b);
  secretChat.layer = await Raws.Primitive.Int.read(b);
  secretChat.inSeqNo = await Raws.Primitive.Int.read(b);
  secretChat.outSeqNo = await Raws.Primitive.Int.read(b);
  secretChat.inSeqNoX = await Raws.Primitive.Int.read(b);
  secretChat.outSeqNoX = await Raws.Primitive.Int.read(b);
  secretChat.timeRekey = await Raws.Primitive.Int.read(b);
  secretChat.created = await Raws.Primitive.Float.read(b);
  secretChat.changed = await Raws.Primitive.Float.read(b);
  if (flags & (1 << 3)) {
    secretChat.rekeyStep = await Raws.Primitive.Int.read(b);
  }
  if (flags & (1 << 4)) {
    secretChat.rekeyExchange = await Raws.Primitive.Long.read(b);
  }
  if (flags & (1 << 5)) {
    secretChat.adminId = await Raws.Primitive.Long.read(b);
  }
  if (flags & (1 << 6)) {
    secretChat.ttl = await Raws.Primitive.Int.read(b);
  }
  return secretChat;
}

export function generateName(
  base: string,
  loginPath: string,
  loginExt: string,
  cachePath: string,
  cacheExt: string,
): string {
  let i = 0;
  while (true) {
    const name = i === 0 ? base : `${base}${i}`;
    if (
      !fs.existsSync(path.join(loginPath, `${name}.${loginExt.replace(/^\./, '')}`)) &&
      !fs.existsSync(path.join(cachePath, `${name}.${cacheExt.replace(/^\./, '')}`))
    ) {
      return name;
    }
    i++;
  }
}
