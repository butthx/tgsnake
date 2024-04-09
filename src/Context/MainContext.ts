/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2024 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */

import { Raw, Raws, Helpers } from '../platform.deno.ts';
import { Composer, run, ErrorHandler, Combine } from './Composer.ts';
import { Logger } from './Logger.ts';
import { Update } from '../TL/Updates/Update.ts';
import { getChannelId } from '../Utilities.ts';
import { TgsnakeApi } from '../Plugins/index.ts';
import type { Snake } from '../Client/Snake.ts';

type TypeChat = Raw.Chat | Raw.Channel;
type TypeUser = Raw.User;
export class MainContext<T> extends Composer<T> {
  /** @hidden */
  protected _errorHandler: ErrorHandler<T> = (error, update) => {
    Logger.error(`Snake error (${error.message}) when processing update :`);
    Logger.error(update);
    throw error;
  };
  protected _plugin: TgsnakeApi = new TgsnakeApi();
  protected _localPtsChat: Map<bigint, Array<number>> = new Map<bigint, Array<number>>();
  protected _commonBox: Map<string, number> = new Map<string, number>();
  constructor() {
    super();
  }
  async handleUpdate(update: Raw.TypeUpdates, client: Snake) {
    if (!update) return false;
    // Plugin: beforeParseUpdate
    if (this._plugin.getEventHandler('beforeParseUpdate').length) {
      Logger.debug(
        `Running ${this._plugin.getEventHandler('beforeParseUpdate').length} before parse update handler plugin.`,
      );
      this._plugin.getEventHandler('beforeParseUpdate').forEach((plugin) => {
        try {
          return plugin({ client, update });
        } catch (error: any) {
          Logger.error(`Failed to running plug-in (beforeParseUpdate) ${plugin.name}`, error);
        }
      });
    }
    Logger.debug(`Receive update: ${update.className}`);
    this.use = () => {
      throw new Error(
        `bot.use is unavailable when bot running. so kill bot first then add bot.use in your source code then running again.`,
      );
    };
    // Plugin: onParseUpdate
    if (this._plugin.getEventHandler('onParseUpdate').length) {
      Logger.debug(
        `Running ${this._plugin.getEventHandler('onParseUpdate').length} on parse update handler plugin, it will replace the default update parser.`,
      );
      const parsed: Array<Update | Raw.TypeUpdates> = [];
      this._plugin.getEventHandler('onParseUpdate').forEach(async (plugin) => {
        try {
          return parsed.push(...(await plugin({ client, update })));
        } catch (error: any) {
          Logger.error(`Failed to running plug-in (onParseUpdate) ${plugin.name}`, error);
        }
      });
      for (const _update of parsed) {
        try {
          // @ts-ignore
          await run<Update>(this.middleware(), _update);
        } catch (error: any) {
          // @ts-ignore
          return this._errorHandler(error, _update);
        }
      }
    } else {
      const parsed = await this.parseUpdate(update, client);
      for (const _update of parsed) {
        try {
          // @ts-ignore
          await run<Update>(this.middleware(), _update);
        } catch (error: any) {
          // @ts-ignore
          return this._errorHandler(error, _update);
        }
      }
    }
    // Plugin: afterParseUpdate
    if (this._plugin.getEventHandler('afterParseUpdate').length) {
      Logger.debug(
        `Running ${this._plugin.getEventHandler('afterParseUpdate').length} after parse update handler plugin.`,
      );
      this._plugin.getEventHandler('afterParseUpdate').forEach((plugin) => {
        try {
          return plugin({ client, update });
        } catch (error: any) {
          Logger.error(`Failed to running plug-in (afterParseUpdate) ${plugin.name}`, error);
        }
      });
    }
  }
  async parseUpdate(update: Raw.TypeUpdates, client: Snake): Promise<Array<object>> {
    // Why Promise<Array<object>> ? because the return of parseUpdate is can by anything, but it must be a class or json object.
    // Possible plugin for make their own parse function.
    const parsedUpdate: Array<Update | Raw.TypeUpdates> = [];
    if (update instanceof Raw.Updates || update instanceof Raw.UpdatesCombined) {
      const { updates, chats, users } = update;
      if ('seq' in update) {
        this._commonBox.set('seq', update.seq);
        this._commonBox.set('date', update.date);
      }
      for (const _update of updates) {
        if ('pts' in _update) {
          const _channelId = getChannelId(_update);
          if (_channelId !== BigInt(0)) {
            this._localPtsChat.set(_channelId, [_update.pts as number, Date.now()]);
          } else {
            this._commonBox.set('pts', _update.pts as number);
          }
        }
        if ('qts' in _update) {
          this._commonBox.set('qts', _update.qts);
        }
        if (_update instanceof Raw.UpdateChannelTooLong) {
          Logger.debug(`Got ${_update.className}`, _update);
          const _channelId = getChannelId(_update);
          if (_channelId !== BigInt(0)) {
            // loop until final get difference
            Logger.debug(`Looping GetChannelDifference`);
            const execGetDiff = async () => {
              const _localPts = this._localPtsChat.get(_channelId);
              if (_localPts) {
                try {
                  const diff = await client.api.invoke(
                    new Raw.updates.GetChannelDifference({
                      channel: await client._client.resolvePeer(_channelId),
                      filter: new Raw.ChannelMessagesFilterEmpty(),
                      pts: _localPts[0],
                      limit: 100,
                    }),
                  );
                  if (!diff) {
                    Logger.error(`Failed to getChannelDifference cause: results undefined`);
                    return;
                  }
                  if (diff instanceof Raw.updates.ChannelDifferenceTooLong) {
                    // handle force sync soon.
                    // Logger.debug(`Skipped getChannelDifference results due to too long difference`);
                    // return;
                    this._localPtsChat.set(_channelId, [
                      ((diff as Raw.updates.ChannelDifferenceTooLong).dialog as Raw.Dialog)
                        .pts as number,
                      Date.now(),
                    ]);
                  } else {
                    // @ts-ignore
                    this._localPtsChat.set(_channelId, [diff.pts, Date.now()]);
                  }
                  if (diff instanceof Raw.updates.ChannelDifferenceEmpty) {
                    Logger.debug(`Skipped getChannelDifference results due to empty difference`);
                  }
                  parsedUpdate.push(...(await this.processChannelDifference(client, diff)));
                  if (!diff.final) {
                    return execGetDiff();
                  }
                  Logger.debug(`Escaping loop getChannelDifference`);
                } catch (error: any) {
                  Logger.error(`Failed to getChannelDifference cause: error`, error);
                  return;
                }
              } else {
                Logger.debug(`Escaping loop getChannelDifference due to no localPts`);
                return;
              }
            };
            execGetDiff();
          } else {
            Logger.debug(`Skipped update: ${_update.className}`);
          }
        } else if (_update instanceof Raw.UpdatesTooLong) {
          Logger.debug(`Got ${_update.className}`, _update);
        } else {
          let _chats, _users;
          if (_update instanceof Raw.UpdateNewChannelMessage) {
            if (!('message' in _update && _update.message instanceof Raw.MessageEmpty)) {
              if (_update.message.peerId && 'channelId' in _update.message.peerId) {
                try {
                  const diff = await client.api.invoke(
                    new Raw.updates.GetChannelDifference({
                      channel: await client._client.resolvePeer(
                        Helpers.getChannelId(_update.message.peerId.channelId),
                      ),
                      filter: new Raw.ChannelMessagesFilter({
                        ranges: [
                          new Raw.MessageRange({
                            minId: _update.message.id,
                            maxId: _update.message.id,
                          }),
                        ],
                      }),
                      pts: _update.pts - _update.ptsCount,
                      limit: _update.pts,
                    }),
                  );
                  if (!(diff instanceof Raw.updates.ChannelDifferenceEmpty)) {
                    if ('pts' in diff) {
                      this._localPtsChat.set(
                        Helpers.getChannelId(_update.message.peerId.channelId),
                        [diff.pts],
                      );
                    }
                    _chats = chats.map((e) => {
                      const newValue = diff.chats.find((o) => o.id === e.id);
                      if (!!newValue) {
                        return newValue;
                      }
                      return e;
                    });
                    _users = users.map((e) => {
                      const newValue = diff.users.find((o) => o.id === e.id);
                      if (!!newValue) {
                        return newValue;
                      }
                      return e;
                    });
                  }
                } catch (error: any) {}
              }
            }
          }
          parsedUpdate.push(await Update.parse(client, _update, _chats ?? chats, _users ?? users));
        }
      }
    } else if (
      update instanceof Raw.UpdateShortMessage ||
      update instanceof Raw.UpdateShortChatMessage
    ) {
      const difference = await client.api.invoke(
        new Raw.updates.GetDifference({
          pts: update.pts - update.ptsCount,
          date: update.date,
          qts: -1,
        }),
      );
      parsedUpdate.push(...(await this.processDifference(client, difference)));
    } else if (update instanceof Raw.UpdateShort) {
      if (update.update instanceof Raw.UpdateUserStatus) {
        if ((update.update as Raw.UpdateUserStatus).userId === client._me.id && !client._me.bot) {
          if (
            (update.update as Raw.UpdateUserStatus).status instanceof Raw.UserStatusOffline &&
            client._options.experimental!.alwaysOnline
          ) {
            await client._client.invoke(new Raw.account.UpdateStatus({ offline: false }));
          }
        }
      }
      parsedUpdate.push(await Update.parse(client, update.update, [], []));
    }
    parsedUpdate.push(update);
    return parsedUpdate;
  }

  syncChannelUpdate(client) {
    return async () => {
      if (client._options!.experimental!.alwaysSync) {
        for (const [channelId, ptsInfo] of this._localPtsChat) {
          // if no update more than 30 second, sync it.
          if (Date.now() - ptsInfo[1] > client._options!.experimental!.syncTimeout) {
            const parsedUpdate: Array<Update | Raw.TypeUpdates> = [];
            // loop until final get difference
            Logger.debug(`Looping GetChannelDifference`);
            const execGetDiff = async () => {
              const _localPts = this._localPtsChat.get(channelId);
              if (_localPts) {
                try {
                  const diff = await client.api.invoke(
                    new Raw.updates.GetChannelDifference({
                      channel: await client._client.resolvePeer(channelId),
                      filter: new Raw.ChannelMessagesFilterEmpty(),
                      pts: _localPts[0],
                      limit: 100,
                    }),
                  );
                  if (!diff) {
                    Logger.error(`Failed to getChannelDifference cause: results undefined`);
                    return;
                  }
                  if (diff instanceof Raw.updates.ChannelDifferenceTooLong) {
                    // handle force sync soon.
                    // Logger.debug(`Skipped getChannelDifference results due to too long difference`);
                    //return;
                    this._localPtsChat.set(channelId, [
                      ((diff as Raw.updates.ChannelDifferenceTooLong).dialog as Raw.Dialog)
                        .pts as number,
                      Date.now(),
                    ]);
                  } else {
                    // @ts-ignore
                    this._localPtsChat.set(channelId, [diff.pts, Date.now()]);
                  }
                  if (diff instanceof Raw.updates.ChannelDifferenceEmpty) {
                    Logger.debug(`Skipped getChannelDifference results due to empty difference`);
                  }
                  parsedUpdate.push(...(await this.processChannelDifference(client, diff)));
                  if (!diff.final) {
                    return execGetDiff();
                  }
                  Logger.debug(`Escaping loop getChannelDifference`);
                } catch (error: any) {
                  Logger.error(`Failed to getChannelDifference cause: error`, error);
                  return;
                }
              } else {
                Logger.debug(`Escaping loop getChannelDifference due to no localPts`);
                return;
              }
            };
            await execGetDiff();
            // send to client
            for (const _update of parsedUpdate) {
              try {
                // @ts-ignore
                await run<Update>(this.middleware(), _update);
              } catch (error: any) {
                // @ts-ignore
                return this._errorHandler(error, _update);
              }
            }
          }
        }
        // schedule sync update every 10s
        setTimeout(this.syncChannelUpdate(client), client._options!.experimental!.syncEvery);
      }
    };
  }

  async processDifference(
    client: Snake,
    difference: Raw.updates.TypeDifference,
  ): Promise<Array<Update | Raw.TypeUpdates>> {
    const parsedUpdate: Array<Update | Raw.TypeUpdates> = [];
    if (
      difference instanceof Raw.updates.Difference ||
      difference instanceof Raw.updates.DifferenceSlice
    ) {
      const { newMessages, otherUpdates, chats, users } = difference;
      if (newMessages) {
        for (const newMessage of newMessages) {
          parsedUpdate.push(
            await Update.parse(
              client,
              new Raw.UpdateNewMessage({
                message: newMessage,
                pts: 0,
                ptsCount: 0,
              }),
              chats,
              users,
            ),
          );
        }
      } else if (otherUpdates) {
        for (const otherUpdate of otherUpdates) {
          parsedUpdate.push(await Update.parse(client, otherUpdate, chats, users));
        }
      }
    }
    return parsedUpdate;
  }
  async processChannelDifference(
    client: Snake,
    difference: Raw.updates.TypeChannelDifference,
  ): Promise<Array<Update | Raw.TypeUpdates>> {
    const parsedUpdate: Array<Update | Raw.TypeUpdates> = [];
    if (difference instanceof Raw.updates.ChannelDifference) {
      const { newMessages, otherUpdates, chats, users } =
        difference as Raw.updates.ChannelDifference;
      if (newMessages) {
        for (const newMessage of newMessages) {
          parsedUpdate.push(
            await Update.parse(
              client,
              new Raw.UpdateNewMessage({
                message: newMessage,
                pts: 0,
                ptsCount: 0,
              }),
              chats,
              users,
            ),
          );
        }
      } else if (otherUpdates) {
        for (const otherUpdate of otherUpdates) {
          parsedUpdate.push(await Update.parse(client, otherUpdate, chats, users));
        }
      }
    }
    if (difference instanceof Raw.updates.ChannelDifferenceTooLong) {
      const { messages, chats, users } = difference as Raw.updates.ChannelDifferenceTooLong;
      if (messages) {
        for (const message of messages) {
          parsedUpdate.push(
            await Update.parse(
              client,
              new Raw.UpdateNewMessage({
                message: message,
                pts: 0,
                ptsCount: 0,
              }),
              chats,
              users,
            ),
          );
        }
      }
    }
    return parsedUpdate;
  }

  catch(errorHandler: ErrorHandler<T>) {
    if (typeof errorHandler === 'function') {
      this._errorHandler = errorHandler;
    }
    return;
  }
}
