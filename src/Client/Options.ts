/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2024 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { Clients, Storages, TypeLogLevel } from '../platform.deno.ts';
import type { PluginApiFn, PluginApiObj } from '../Plugins/index.ts';
export interface Options {
  /**
   * App id, you can create one from my.telegram.org
   */
  apiId: number;
  /**
   * App hash, you can create one from my.telegram.org
   */
  apiHash: string;
  /**
   * Login session, you can use custom session class in here.
   */
  login: LoginWithSession;
  /**
   * The logger level, it should be "debug" | "verbose" | "info" | "error" | "warn" | "none". <br/>
   *
   * default is "debug"
   */
  logLevel?: TypeLogLevel | Array<TypeLogLevel>;
  /**
   * Options for @tgsnake/core. It will be using for connection options.
   */
  clientOptions?: Clients.Client.ClientOptions;
  /**
   * Use a special plugin.
   */
  plugins?: Array<PluginApiFn | PluginApiObj>;
  /**
   * Experimental option that may be unstable, we do not recommend using this option. You must bear every risk that might occur.
   */
  experimental?: ExperimentalOptions;
}
export interface LoginWithSession {
  /**
   * String session or import your session class.
   */
  session?: string | Storages.AbstractSession;
  /**
   * Login as bot using bot auth token from bot father. <br/>
   * Only effected when selected session is blank.
   */
  botToken?: string;
  /**
   * Force session to .session file, If session field passed as string. <br/>
   *
   * default is true.
   */
  forceDotSession?: boolean;
  /**
   * The name of session, it will be using to read .session file. <br/>
   *
   * default is "tgsnake"
   */
  sessionName?: string;
}
export interface ExperimentalOptions {
  /**
   * When a user is offline state, the user will automatically be forced to go back online.
   */
  alwaysOnline?: boolean;
  /**
   * When the new client is started, will it display a status user is online.
   */
  onlineOnStart?: boolean;
  /**
   * Implement the shutdown function by default into the client class. By default this option is true.
   */
  shutdown?: boolean;
  /**
   * Apply custom paths for some configurations such as login info and cache.
   */
  customPath?: CustomablePath;
  /**
   * Check the channel every time given. If no updates are received after the 'syncTimeout' timeout it will call the getChannelDifference function for synchronization.
   */
  syncEvery?: number;
  /**
   * Time delay for calling the getChannelDifference function for synchronization.
   */
  syncTimeout?: number;
  /**
   * For supergroups/channels that send messages too often so that after 2 minutes the client is running there are no more updates from Telegram. You can use this option to force the client to synchronize with predefined intervals and delays.
   */
  alwaysSync?: boolean;
}
export interface CustomablePath {
  /**
   * The location or folder where all login information will be stored. This option only works when forceDotSession is active. And don't use special sessions like RedisSession.
   */
  loginDir?: string;
  /**
   * File extension of saved login info. By default the file extension is 'session'. This option only works when forceDotSession is active. And don't use special sessions like RedisSession.
   */
  loginExt?: string;
  /**
   * The location or folder where all cache will be stored. This option only works when forceDotSession is active. And don't use special sessions like RedisSession.
   */
  cacheDir?: string;
  /**
   * File extension of saved cache. By default the file extension is 'cache'. This option only works when forceDotSession is active. And don't use special sessions like RedisSession.
   */
  cacheExt?: string;
}
