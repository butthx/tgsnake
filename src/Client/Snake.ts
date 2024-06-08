/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2024 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import {
  Raw,
  Client,
  Storages,
  Clients,
  Sessions,
  TypeLogLevel,
  path,
  cwd,
  isDeno,
  isBrowser,
  sysprc,
} from '../platform.deno.ts';
import fs from 'node:fs';
import { SnakeSession, generateName } from './SnakeSession.ts';
import { BrowserSession } from './BrowserSession.ts';
import { Options, LoginWithSession } from './Options.ts';
import { LoginWithCLI } from './Login/Cli.ts';
import * as Version from '../Version.deno.ts';
import { Logger, MainContext } from '../Context/index.ts';
import { Telegram } from '../Methods/Telegram.ts';
import type { Message } from '../TL/Messages/Message.ts';
import type { ConversationManager } from '../Conversation/manager.ts';

export class Snake<T = {}> extends MainContext<T> {
  _options!: Options;
  _client!: Client;
  _cacheMessage!: Map<bigint, Map<number, Message>>;
  _me!: Raw.User;
  _rndMsgId!: Sessions.MsgId;
  api!: Telegram;
  constructor(options?: Options) {
    super();
    this._options = options!;
  }
  private async _init() {
    let options = this._options;
    Logger.log(`Welcome to tgsnake!`);
    Logger.log(`Using version: ${Version.version} - ${Version.getType()}`);
    Logger.log(`Thanks for using tgsnake`);
    if (!options) {
      if (fs.existsSync(path.join(cwd(), 'tgsnake.config.js'))) {
        if (isBrowser) {
          Logger.error(`Config file is not supported on browser!`);
        } else {
          Logger.info(`Found config file: ${path.join(cwd(), 'tgsnake.config.js')}`);
          if (isDeno) {
            options = (await import(path.join(cwd(), 'tgsnake.config.js'))).default;
          } else {
            // @ts-ignore
            options = require(path.join(cwd(), 'tgsnake.config.js'));
          }
        }
      } else {
        // @ts-ignore
        options = {};
      }
    }
    if (options) {
      // assign field of _options.
      this._options = Object.assign(
        {
          logLevel: [sysprc.env.LOGLEVEL || 'debug'],
          experimental: {},
        },
        options,
      );
      // assign default app version.
      this._options.clientOptions = Object.assign(
        {
          appVersion: Version.version.replace(
            /(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/gm,
            '',
          ),
        },
        this._options.clientOptions,
      );
      // assign default login options
      this._options.login = Object.assign(
        {
          session: '',
          forceDotSession: true,
          sessionName: 'tgsnake',
        },
        this._options.login,
      );

      this._options.experimental = Object.assign(
        {
          alwaysOnline: false,
          onlineOnStart: false,
          shutdown: true,
          syncEvery: 10000,
          alwaysSync: false,
          customPath: {},
        },
        this._options.experimental,
      );
      this._options.experimental.customPath = Object.assign(
        {
          loginDir: cwd(),
          loginExt: 'session',
          cacheDir: cwd(),
          cacheExt: 'cache',
        },
        this._options.experimental.customPath,
      );
      // validate session.
      if (this._options.login.session !== undefined) {
        if (typeof this._options.login.session === 'string') {
          this._options.login.session as string;
          if (this._options.login.session === '') {
            if (this._options.login.forceDotSession) {
              if (!options.login.sessionName) {
                this._options.login.sessionName = generateName(
                  this._options.login.sessionName!,
                  this._options.experimental!.customPath!.loginDir!,
                  this._options.experimental!.customPath!.loginExt!,
                  this._options.experimental!.customPath!.cacheDir!,
                  this._options.experimental!.customPath!.cacheExt!,
                );
                Logger.info(
                  `Creating \`${this._options.login.sessionName}\` dot session. Change default sessionName to \`${this._options.login.sessionName}\` for login in next time.`,
                );
              }
              if (isBrowser) {
                this._options.login.session = new BrowserSession(this._options.login.sessionName!);
              } else {
                this._options.login.session = new SnakeSession(
                  this._options.login.sessionName!,
                  this._options.experimental!.customPath!.loginDir!,
                  this._options.experimental!.customPath!.loginExt!,
                  this._options.experimental!.customPath!.cacheDir!,
                  this._options.experimental!.customPath!.cacheExt!,
                );
              }
            } else {
              this._options.login.session = new Storages.StringSession(this._options.login.session);
            }
          } else {
            const _session = new Storages.StringSession(this._options.login.session);
            if (this._options.login.forceDotSession) {
              this._options.login.sessionName = generateName(
                this._options.login.sessionName!,
                this._options.experimental!.customPath!.loginDir!,
                this._options.experimental!.customPath!.loginExt!,
                this._options.experimental!.customPath!.cacheDir!,
                this._options.experimental!.customPath!.cacheExt!,
              );
              Logger.info(
                `Creating \`${this._options.login.sessionName}\` dot session. Change default sessionName to \`${this._options.login.sessionName}\` for login in next time.`,
              );
              if (isBrowser) {
                this._options.login.session = new BrowserSession(this._options.login.sessionName!);
              } else {
                this._options.login.session = new SnakeSession(
                  this._options.login.sessionName!,
                  this._options.experimental!.customPath!.loginDir!,
                  this._options.experimental!.customPath!.loginExt!,
                  this._options.experimental!.customPath!.cacheDir!,
                  this._options.experimental!.customPath!.cacheExt!,
                );
              }
              _session.move(this._options.login.session);
            } else {
              this._options.login.session = _session;
            }
          }
        }
      }
      // setting up a log level
      if (typeof this._options.logLevel === 'string') {
        this._options.logLevel = String(this._options?.logLevel).split('|') as Array<TypeLogLevel>;
      }
      // @ts-ignore
      Logger.setLogLevel(this._options.logLevel);

      if (options.experimental) {
        Logger.warning(
          'If you use the experimental option, we strongly do not recommend using this function.',
        );
      }
    }
    this._cacheMessage = new Map();
    this.api = new Telegram(this);
    this._rndMsgId = new Sessions.MsgId();
    if (this._options.plugins && this._options.plugins?.length) {
      Logger.debug('Registering plugin.');
      for (const plugin of this._options.plugins) {
        if (typeof plugin === 'function') {
          try {
            await plugin(this._plugin);
          } catch (error: any) {
            Logger.error(`Failed to initialize plug-in: ${plugin.name}`, error);
          }
        } else if (typeof plugin === 'object' && 'init' in plugin) {
          try {
            await plugin.init(this._plugin);
          } catch (error: any) {
            Logger.error(`Failed to initialize plug-in: ${plugin.constructor.name}`, error);
          }
        }
      }
    }
  }
  async stop() {
    Logger.info('Gracefully Stop.');
    if (this._options.login?.session && typeof this._options.login.session !== 'string') {
      Logger.info('Saving session before killed.');
      await this._options.login.session.save();
    }
    if (this._plugin.getEventHandler('gracefullyStop').length) {
      Logger.debug(
        `Running ${this._plugin.getEventHandler('gracefullyStop').length} gracefully stop handler plugin.`,
      );
      for (const plugin of this._plugin.getEventHandler('gracefullyStop')) {
        try {
          await plugin({ client: this });
        } catch (error: any) {
          Logger.error(`Failed to running plug-in (gracefullyStop) ${plugin.name}`, error);
        }
      }
    }
    await this._client._session.stop();
  }
  async run() {
    await this._init();
    if (this._options.experimental!.shutdown) {
      shutdown(this);
    }
    if (this._plugin.getEventHandler('beforeStart').length) {
      Logger.debug(
        `Running ${this._plugin.getEventHandler('beforeStart').length} before start handler plugin.`,
      );
      for (const plugin of this._plugin.getEventHandler('beforeStart')) {
        try {
          await plugin({ client: this });
        } catch (error: any) {
          Logger.error(`Failed to running plug-in (beforeStart) ${plugin.name}`, error);
        }
      }
    }
    if (this._plugin.getEventHandler('onLogin').length) {
      if (this._plugin.getEventHandler('onLogin').length > 1) {
        Logger.info(
          `The plug-in of login handler is more than one, to prevent several undesirable things, only the last plug-in will be used. {${this._plugin.getEventHandler('onLogin').length}}`,
        );
      }
      const plugin =
        this._plugin.getEventHandler('onLogin')[this._plugin.getEventHandler('onLogin').length - 1];
      try {
        let user = await plugin({ client: this });
        if (user) {
          this._me = (user as unknown as Raw.users.UserFull).users[0] as Raw.User;
        }
      } catch (error: any) {
        Logger.error(`Failed to running plug-in (onLogin) ${plugin.name}`, error);
      }
    } else {
      let user = await LoginWithCLI(this);
      if (user) {
        this._me = (user as Raw.users.UserFull).users[0] as Raw.User;
      }
    }
    this._client.addHandler((update) => this.handleUpdate(update, this));
    if (this._options!.experimental!.alwaysSync) {
      this.syncChannelUpdate(this)();
    }
    Logger.info('Client is running');
    if (this._me) {
      Logger.log(
        `Loggined as : ${
          this._me.lastName ? `${this._me.firstName} ${this._me.lastName}` : this._me.firstName
        } - ${this._me.id}`,
      );
      if (this._options.experimental!.onlineOnStart) {
        await this._client.invoke(new Raw.account.UpdateStatus({ offline: false }));
      }
    }
    if (this._plugin.getEventHandler('afterStart').length) {
      Logger.debug(
        `Running ${this._plugin.getEventHandler('afterStart').length} after start handler plugin.`,
      );
      for (const plugin of this._plugin.getEventHandler('afterStart')) {
        try {
          await plugin({ client: this });
        } catch (error: any) {
          Logger.error(`Failed to running plug-in (afterStart) ${plugin.name}`, error);
        }
      }
    }
    return true;
  }

  restart() {
    this._client._session.restart();
    this._cacheMessage = new Map();
    this._rndMsgId = new Sessions.MsgId();
    this._commonBox = new Map();
    this._localPtsChat = new Map();
  }

  get core(): Client {
    return this._client;
  }
  get conversation(): ConversationManager<T> {
    return this._conversation;
  }
}
/**
 * Function to deactivate the client when the program is killed by SIGTERM or SIGINT.
 * @param {Array<Snake>} clients - client to be shutting down.
 */
export function shutdown(...clients: Array<Snake>) {
  const handler = async () => {
    for (const client of clients) {
      await client.stop();
    }
    return sysprc.exit();
  };
  sysprc.on('SIGINT', handler);
  sysprc.on('SIGTERM', handler);
  Logger.info(`Gracefull Stop enable for ${clients.length} clients`);
}
