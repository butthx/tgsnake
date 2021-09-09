// Tgsnake - Telegram MTProto framework developed based on gram.js.
// Copyright (C) 2021 Butthx <https://guthub.com/butthx>
//
// This file is part of Tgsnake
//
// Tgsnake is a free software : you can redistribute it and/or modify
//  it under the terms of the MIT License as published.

import { Logger } from 'telegram/extensions';
import { TelegramClient } from 'telegram';
import { StringSession, StoreSession } from 'telegram/sessions';
import { NewMessage } from 'telegram/events';
import { NewMessageEvent } from 'telegram/events/NewMessage';
import { Telegram } from './Telegram';
import { MainContext } from './Context/MainContext';
import prompts from 'prompts';
import { Api } from 'telegram';
import fs from 'fs';
import { Options } from './Interface/Options';
import { CatchError } from './Interface/CatchError';

let api_hash: string;
let api_id: number;
let session: string;
let bot_token: string;
let logger: string;
let tgSnakeLog: boolean | undefined = true;
let connectionRetries: number;
let appVersion: string;
let sessionName: string = 'tgsnake';
let storeSession: boolean = true;
let catchFunct: CatchError;
let isBot: boolean = false;
function log(...args) {
  if (tgSnakeLog) {
    console.log(...args);
  }
}
function makeApiHash(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
function makeApiId(length) {
  var result = '';
  var characters = '0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
export class Snake extends MainContext {
  client!: TelegramClient;
  telegram!: Telegram;
  version: string = '1.2.0';
  connected: Boolean = false;
  constructor(public options?: Options) {
    super();
    if (!options) {
      let dir = fs.readdirSync(process.cwd());
      if (dir.includes('tgsnake.config.js')) {
        let config = require(`${process.cwd()}/tgsnake.config.js`);
        options = config;
      }
    }
    //default options
    session = '';
    connectionRetries = 5;
    logger = 'none';
    // custom options
    if (options) {
      if (options.logger) {
        logger = options.logger;
        delete options.logger;
      }
      if (options.apiHash) {
        api_hash = String(options.apiHash);
        delete options.apiHash;
      }
      if (options.apiId) {
        api_id = Number(options.apiId);
        delete options.apiId;
      }
      if (options.session) {
        session = options.session;
        delete options.session;
      }
      if (options.botToken) {
        bot_token = options.botToken;
        delete options.botToken;
      }
      if (options.connectionRetries) {
        connectionRetries = options.connectionRetries;
        delete options.connectionRetries;
      }
      if (options.appVersion) {
        appVersion = options.appVersion;
        delete options.appVersion;
      }
      if (String(options.tgSnakeLog) == 'false') {
        tgSnakeLog = Boolean(options.tgSnakeLog);
        delete options.tgSnakeLog;
      }
      if (options.tgSnakeLog) {
        delete options.tgSnakeLog;
      }
      if (options.sessionName) {
        sessionName = options.sessionName;
        delete options.sessionName;
      }
      if (options.storeSession) {
        storeSession = Boolean(options.storeSession);
        delete options.storeSession;
      }
    }
    Logger.setLevel(logger);
  }
  private async _convertString() {
    let stringsession = new StringSession(session);
    if (storeSession && session !== '') {
      let storesession = new StoreSession(sessionName);
      await stringsession.load();
      storesession.setDC(stringsession.dcId, stringsession.serverAddress!, stringsession.port!);
      storesession.setAuthKey(stringsession.authKey);
      return storesession;
    } else {
      return stringsession;
    }
  }
  private async _createClient() {
    try {
      if (!api_hash) {
        if (session == '') {
          throw new Error('api_hash required!');
        } else {
          api_hash = makeApiHash(32);
        }
      }
      if (!api_id) {
        if (session == '') {
          throw new Error('api_id required!');
        } else {
          api_id = Number(makeApiId(7));
        }
      }
      if (!bot_token && session == '') {
        throw new Error(
          'bot_token required if you login as bot, session required if you login as user. To get session run generateSession function.'
        );
      }
      this.client = new TelegramClient(
        await this._convertString(),
        Number(api_id),
        String(api_hash),
        {
          connectionRetries: connectionRetries,
          appVersion: appVersion || this.version,
          ...this.options,
        }
      );
      return this.client;
    } catch (error) {
      this._handleError(error, `Snake._createClient()`);
    }
  }
  async run() {
    try {
      process.once('SIGINT', () => {
        log('🐍 Killing..');
        this.client.disconnect();
        process.exit(0);
      });
      process.once('SIGTERM', () => {
        log('🐍 Killing..');
        this.client.disconnect();
        process.exit(0);
      });
      log(`🐍 Welcome To TGSNAKE ${this.version}.`);
      log(`🐍 Setting Logger level to "${logger}"`);
      if (bot_token) {
        if (session == '') {
          storeSession = false;
        }
      }
      if (!this.client) {
        await this._createClient();
      }
      this.telegram = new Telegram(this);
      if (bot_token) {
        if (session == '') {
          await this.client.start({
            botAuthToken: bot_token,
          });
        } else {
          await this.client.connect();
        }
      } else {
        await this.client.connect();
      }
      let me = await this.telegram.getMe();
      isBot = me.bot;
      let name = me.lastName
        ? me.firstName + ' ' + me.lastName + ' [' + me.id + ']'
        : me.firstName + ' [' + me.id + ']';
      this.onNewMessage((update) => {
        return this.handleUpdate(update, this);
      });
      this.onNewEvent((update) => {
        return this.handleUpdate(update, this);
      });
      this.connected = true;
      this.emit('connected', me);
      return log('🐍 Connected as ', name);
    } catch (error) {
      this._handleError(error, `Snake.run()`);
    }
  }
  private async onNewMessage(next: any) {
    try {
      if (!this.client) {
        await this._createClient();
      }
      if (this.client) {
        this.client.addEventHandler(async (event: NewMessageEvent) => {
          if (!isBot) {
            await this.client.getDialogs({});
          }
          return next(event);
        }, new NewMessage({}));
      }
    } catch (error) {
      this._handleError(error, `Snake.onNewMessage([${typeof next}])`);
    }
  }
  private async onNewEvent(next: any) {
    try {
      if (!this.client) {
        await this._createClient();
      }
      if (this.client) {
        this.client.addEventHandler((update: Api.TypeUpdate) => {
          return next(update);
        });
      }
    } catch (error) {
      this._handleError(error, `Snake.onNewEvent([${typeof next}])`);
    }
  }
  async generateSession() {
    try {
      process.once('SIGINT', () => {
        log('🐍 Killing..');
        this.client.disconnect();
        process.exit(0);
      });
      process.once('SIGTERM', () => {
        log('🐍 Killing..');
        this.client.disconnect();
        process.exit(0);
      });
      log(`🐍 Welcome To TGSNAKE ${this.version}.`);
      log(`🐍 Setting Logger level to "${logger}"`);
      if (!api_hash) {
        let input_api_hash = await prompts({
          type: 'text',
          name: 'value',
          message: '🐍 Input your api_hash',
        });
        api_hash = input_api_hash.value;
      }
      if (!api_id) {
        let input_api_id = await prompts({
          type: 'text',
          name: 'value',
          message: '🐍 Input your api_id',
        });
        api_id = input_api_id.value;
      }
      this.client = new TelegramClient(
        new StringSession(session),
        Number(api_id),
        String(api_hash),
        {
          connectionRetries: connectionRetries,
          appVersion: appVersion || this.version,
          ...this.options,
        }
      );
      this.telegram = new Telegram(this);
      if (session == '') {
        if (!bot_token) {
          let loginAsBot = await prompts({
            type: 'confirm',
            name: 'value',
            initial: false,
            message: '🐍 Login as bot?',
          });
          if (!loginAsBot.value) {
            await this.client.start({
              phoneNumber: async () => {
                let value = await prompts({
                  type: 'text',
                  name: 'value',
                  message: '🐍 Input your international phone number',
                });
                return value.value;
              },
              password: async () => {
                let value = await prompts({
                  type: 'text',
                  name: 'value',
                  message: '🐍 Input your 2FA password',
                });
                return value.value;
              },
              phoneCode: async () => {
                let value = await prompts({
                  type: 'text',
                  name: 'value',
                  message: '🐍 Input Telegram verifications code',
                });
                return value.value;
              },
              onError: (err: any) => {
                console.log(err);
              },
            });
            session = String(await this.client.session.save());
            console.log(`🐍 Your string session : ${session}`);
            let me = (await this.client.getMe()) as Api.User;
            await this.telegram.sendMessage(
              me.id,
              `🐍 Your string session : <code>${session}</code>`,
              { parseMode: 'HTML' }
            );
          } else {
            let value = await prompts({
              type: 'text',
              name: 'value',
              message: '🐍 Input your bot_token',
            });
            await this.client.start({
              botAuthToken: value.value,
            });
            session = String(await this.client.session.save());
            console.log(`🐍 Your string session : ${session}`);
          }
        } else {
          await this.client.start({
            botAuthToken: bot_token,
          });
          session = String(await this.client.session.save());
          console.log(`🐍 Your string session : ${session}`);
        }
      } else {
        log(`🐍 You should use the \`Snake.run()\`!`);
      }
      log('🐍 Killing...');
      this.client.disconnect();
      process.exit(0);
    } catch (error) {
      this._handleError(error, `Snake.generateSession()`);
    }
  }
  async catch(next: CatchError) {
    return (catchFunct = next);
  }
  async _handleError(error: any, running?: string) {
    if (catchFunct) {
      return catchFunct(error, this.ctx);
    } else {
      if (this.ctx) {
        console.log(`🐍 Snake Error (${error.message}) When running: `);
        console.log(this.ctx);
        if (running) {
          console.log(`🐍 ${running}`);
        }
      } else {
        console.log(`🐍 Snake Error (${error.message}).`);
        if (running) {
          console.log(`🐍 ${running}`);
        }
      }
      throw new Error(error.message);
    }
  }
}
