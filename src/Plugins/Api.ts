/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2024 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { type Raw } from '../platform.deno.ts';
import type { Snake } from '../Client/Snake.ts';
import type { Update } from '../TL/Updates/Update.ts';

/**
 * A callback function that will be executed as a handler according to the events registered.
 * @param {ApiParams} props - Interactable Api.
 */
export type CallbackFn = (props: ApiParams) => any | Promise<any>;
/**
 * A callback function that will be executed as a handler according to the events registered.
 * The callback function must be return Raw.users.UserFull.
 * @param {ApiParams} props - Interactable Api.
 */
export type CallbackFnLogin = (
  props: ApiParams,
) => Raw.users.UserFull | Promise<Raw.users.UserFull>;
/**
 * A callback function that will be executed as a handler according to the events registered.
 * The callback function must be return extended class from Update or class from TypeUpdates.
 * @param {ApiParams} props - Interactable Api.
 */
export type CallbackFnUpdate = (
  props: ApiParams,
) => Array<Update | Raw.TypeUpdates> | Promise<Array<Update | Raw.TypeUpdates>>;
/**
 * A function for plug-in initiation, this function must register a callback function as an event handler.
 * @param {TgsnakeApi} PluginApi - Api plug-in class for registering callback functions in an event.
 */
export type PluginApiFn = (PluginApi: TgsnakeApi) => any | Promise<any>;
/**
 * A object for plug-in initiation, this object must have a 'init' function to be called. The 'init' function must register a callback function as an event handler.
 */
export type PluginApiObj = { init: PluginApiFn };

export interface ListGetterEventHandler {
  /**
   * Register the handler before the client running.
   */
  beforeStart: ReadonlyArray<CallbackFn>;
  /**
   * Register the handler function to run after the client successfully connects to the Telegram server.
   */
  afterStart: ReadonlyArray<CallbackFn>;
  /**
   * Register the handler function to modified the default login logic. If you have more than 1 plug-in for this, then only the last plugin will be used.
   */
  onLogin: ReadonlyArray<CallbackFnLogin>;
  /**
   * Register the handler function that will be executed when the client is terminated and after the session is saved.
   * You don't need to do process.exit() in the handler.
   */
  gracefullyStop: ReadonlyArray<CallbackFn>;
  /**
   * When receiving the latest update from Telegram and before being executed by the 'default parser' the registered function will be called.
   */
  beforeParseUpdate: ReadonlyArray<CallbackFn>;
  /**
   * The registered function will replace the 'default parser', so the handler function must return an object.
   */
  onParseUpdate: ReadonlyArray<CallbackFnUpdate>;
  /**
   * When receiving the latest update from Telegram and after being executed by the 'default parser' or 'onParseUpdate plugin' the registered function will be called.
   */
  afterParseUpdate: ReadonlyArray<CallbackFn>;
}
export interface ListSetterEventHandler {
  /**
   * Register the handler before the client running.
   */
  beforeStart: CallbackFn;
  /**
   * Register the handler function to run after the client successfully connects to the Telegram server.
   */
  afterStart: CallbackFn;
  /**
   * Register the handler function to modified the default login logic. If you have more than 1 plug-in for this, then only the last plugin will be used.
   */
  onLogin: CallbackFnLogin;
  /**
   * Register the handler function that will be executed when the client is terminated and after the session is saved.
   * You don't need to do process.exit() in the handler.
   */
  gracefullyStop: CallbackFn;
  /**
   * When receiving the latest update from Telegram and before being executed by the 'default parser' the registered function will be called.
   */
  beforeParseUpdate: CallbackFn;
  /**
   * The registered function will replace the 'default parser', so the handler function must return an object.
   */
  onParseUpdate: CallbackFnUpdate;
  /**
   * When receiving the latest update from Telegram and after being executed by the 'default parser' or 'onParseUpdate plugin' the registered function will be called.
   */
  afterParseUpdate: CallbackFn;
}
export interface ApiParams {
  /**
   * Modifiable tgsnake client.
   */
  client: Snake;
  /**
   * Updates provided from Telegram to be parsed.
   */
  update?: Raw.TypeUpdates;
}
/**
 * Plugin construction that allows other developers to access the api from tgsnake.
 */
export class TgsnakeApi {
  private _beforeStartHandler: Array<CallbackFn> = [];
  private _afterStartHandler: Array<CallbackFn> = [];
  private _onLoginHandler: Array<CallbackFnLogin> = [];
  private _gracefullyStopHandler: Array<CallbackFn> = [];
  private _beforeParseUpdateHandler: Array<CallbackFn> = [];
  private _onParseUpdateHandler: Array<CallbackFnUpdate> = [];
  private _afterParseUpdateHandler: Array<CallbackFn> = [];
  constructor() {}
  addEventHandler<K extends keyof ListSetterEventHandler>(
    filter: K,
    func: ListGetterEventHandler[K],
  ): void {
    if ('beforeStart' === filter) {
      this._beforeStartHandler.push(func as unknown as CallbackFn);
    }
    if ('afterStart' === filter) {
      this._afterStartHandler.push(func as unknown as CallbackFn);
    }
    if ('onLogin' === filter) {
      this._onLoginHandler.push(func as unknown as CallbackFnLogin);
    }
    if ('gracefullyStop' === filter) {
      this._gracefullyStopHandler.push(func as unknown as CallbackFn);
    }
    if ('beforeParseUpdate' === filter) {
      this._beforeParseUpdateHandler.push(func as unknown as CallbackFn);
    }
    if ('onParseUpdate' === filter) {
      this._onParseUpdateHandler.push(func as unknown as CallbackFnUpdate);
    }
    if ('afterParseUpdate' === filter) {
      this._afterParseUpdateHandler.push(func as unknown as CallbackFn);
    }
  }
  getEventHandler<K extends keyof ListGetterEventHandler>(filter: K): ListGetterEventHandler[K] {
    if ('beforeStart' === filter) {
      return this._beforeStartHandler;
    }
    if ('afterStart' === filter) {
      return this._afterStartHandler;
    }
    if ('onLogin' === filter) {
      // @ts-ignore
      return this._onLoginHandler;
    }
    if ('gracefullyStop' === filter) {
      return this._gracefullyStopHandler;
    }
    if ('beforeParseUpdate' === filter) {
      return this._beforeParseUpdateHandler;
    }
    if ('onParseUpdate' === filter) {
      // @ts-ignore
      return this._onParseUpdateHandler;
    }
    if ('afterParseUpdate' === filter) {
      return this._afterParseUpdateHandler;
    }
    return [];
  }
  [Symbol.for('nodejs.util.inspect.custom')](): { [key: string]: any } {
    const toPrint: { [key: string]: any } = {
      _: 'TgsnakeApi',
      '[beforeStart]': `${this._beforeStartHandler.length} handler`,
      '[afterStart]': `${this._afterStartHandler.length} handler`,
      '[onLogin]': `${this._onLoginHandler.length} handler`,
      '[gracefullyStop]': `${this._gracefullyStopHandler.length} handler`,
      '[beforeParseUpdate]': `${this._beforeParseUpdateHandler.length} handler`,
      '[onParseUpdate]': `${this._onParseUpdateHandler.length} handler`,
      '[afterParseUpdate]': `${this._afterParseUpdateHandler.length} handler`,
    };
    return toPrint;
  }
  toJSON(): { [key: string]: any } {
    const toPrint: { [key: string]: any } = {
      _: 'TgsnakeApi',
      '[beforeStart]': `${this._beforeStartHandler.length} handler`,
      '[afterStart]': `${this._afterStartHandler.length} handler`,
      '[onLogin]': `${this._onLoginHandler.length} handler`,
      '[gracefullyStop]': `${this._gracefullyStopHandler.length} handler`,
      '[beforeParseUpdate]': `${this._beforeParseUpdateHandler.length} handler`,
      '[onParseUpdate]': `${this._onParseUpdateHandler.length} handler`,
      '[afterParseUpdate]': `${this._afterParseUpdateHandler.length} handler`,
    };
    return toPrint;
  }
  toString() {
    return `[constructor of ${this.constructor.name}] ${JSON.stringify(this, null, 2)}`;
  }
}
