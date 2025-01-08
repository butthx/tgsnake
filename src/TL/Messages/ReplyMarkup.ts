/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2025 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { Raw, Buffer } from '../../platform.deno.ts';
import type { Snake } from '../../Client/index.ts';
export type TypeReplyMarkup = inlineKeyboard | replyKeyboard | removeKeyboard | forceReplyMarkup;
/**
 * Upon receiving a message with this object, Telegram clients will display a reply interface to the user (act as if the user has selected the bot's message and tapped 'Reply')
 */
export interface forceReplyMarkup {
  /**
   * Shows reply interface to the user, as if they manually selected the bot's message and tapped 'Reply'
   */
  forceReply: boolean;
  /**
   * The placeholder to be shown in the input field when the reply is active
   */
  inputFieldPlaceholder?: string;
  /**
   * Use this parameter if you want to force reply from specific users only.
   */
  selective?: boolean;
  /**
   * Requests clients to hide the keyboard as soon as it's been used.
   */
  singleUse?: boolean;
}
/**
 * Upon receiving a message with this object, Telegram clients will remove the current custom keyboard and display the default letter-keyboard.
 */
export interface removeKeyboard {
  /**
   * Requests clients to remove the custom keyboard (user will not be able to summon this keyboard
   */
  removeKeyboard: boolean;
  /**
   * Use this parameter if you want to remove the keyboard for specific users only
   */
  selective?: boolean;
}
/**
 * Bot keyboard
 */
export interface replyKeyboard {
  /**
   * Array of array of {@link replyKeyboardButton} or Array of array of string.
   * @example
   * ```ts
   * [["hello"]]
   * ```
   */
  keyboard: replyKeyboardButton[][] | string[][];
  /**
   * Requests clients to resize the keyboard vertically for optimal fit (e.g., make the keyboard smaller if there are just two rows of buttons).
   */
  resizeKeyboard?: boolean;
  /**
   * Requests clients to hide the keyboard as soon as it's been used.
   */
  oneTimeKeyboard?: boolean;
  /**
   * The placeholder to be shown in the input field when the keyboard is active.
   */
  inputFieldPlaceholder?: string;
  /**
   * Use this parameter if you want to show the keyboard to specific users only.
   */
  selective?: boolean;
}
export interface replyKeyboardButton {
  /** keyboard text */
  text: string;
  /** The user's phone number will be sent as a contact when the button is pressed */
  requestContact?: boolean;
  /** The user's current location will be sent when the button is pressed. */
  requestLocation?: boolean;
  /**
   * The user will be asked to create a poll and send it to the bot when the button is pressed. <br/>
   * If _quiz_ is passed, the user will be allowed to create only polls in the quiz mode. <br/>
   * If _regular_ is passed, only regular polls will be allowed. Otherwise, the user will be allowed to create a poll of _any_ type.
   */
  requestPoll?: 'regular' | 'quiz';
}
/**
 * Bot button
 */
export interface inlineKeyboard {
  /**
   * array of array of {@link inlineKeyboardButton}
   * @example
   * ```ts
   * [[{
   *  text : "button", // the text of button
   *  callbackData : "cbdata" // the callback data of button.
   * }]]
   * ```
   */
  inlineKeyboard: inlineKeyboardButton[][];
}
export interface inlineKeyboardButton {
  /** Button text */
  text: string;
  /** Button url */
  url?: string;
  /** loginUrl button*/
  loginUrl?: loginUrl;
  /** callback data button */
  callbackData?: string;
  /** query to fill the inline query */
  switchInlineQuery?: string;
  /** query to fill the inline query */
  switchInlineQueryCurrentChat?: string;
  /** description of game */
  callbackGame?: string;
  /** description of product */
  buy?: string;
  /** Url of WebApp*/
  webApp?: string;
}
export interface loginUrl {
  /**
   * Set this flag to request the permission for your bot to send messages to the user.
   */
  requestWriteAccess?: boolean;
  /**
   * New text of the button in forwarded messages.
   */
  forwardText?: string;
  /**
   * An HTTP URL to be opened with user authorization data added to the query string when the button is pressed. If the user refuses to provide authorization data, the original URL without information about the user will be opened. The data added is the same as described in Receiving authorization data. <br/>
   * NOTE: You must always check the hash of the received data to verify the authentication and the integrity of the data as described in Checking authorization.
   */
  url: string;
  /**
   * id and access hash of a bot, which will be used for user authorization. The url's domain must be the same as the domain linked with the bot.
   */
  bot: BotLoginUrl;
}
export interface BotLoginUrl {
  /**
   * Bot Id.
   */
  id: bigint;
  /**
   * Bot access hash
   */
  accessHash: bigint;
}

export async function buildReplyMarkup(replyMarkup: TypeReplyMarkup, snakeClient: Snake) {
  // inlineKeyboard
  if ('inlineKeyboard' in replyMarkup) {
    return await replyMarkupInlineKeyboard(replyMarkup as inlineKeyboard, snakeClient);
  }
  // keyboard
  if ('keyboard' in replyMarkup) {
    return await replyMarkupKeyboard(replyMarkup as replyKeyboard);
  }
  // removeKeyboard
  if ('removeKeyboard' in replyMarkup) {
    return await replyMarkupRemoveKeyboard(replyMarkup as removeKeyboard);
  }
  // forceReply
  if ('forceReply' in replyMarkup) {
    return await replyMarkupForceReply(replyMarkup as forceReplyMarkup);
  }
}
async function replyMarkupInlineKeyboard(replyMarkup: inlineKeyboard, snakeClient: Snake) {
  let rows: Raw.KeyboardButtonRow[] = [];
  for (let row = 0; row < replyMarkup.inlineKeyboard.length; row++) {
    let tempCol: Raw.TypeKeyboardButton[] = [];
    for (let col = 0; col < replyMarkup.inlineKeyboard[row].length; col++) {
      let btn: inlineKeyboardButton = replyMarkup.inlineKeyboard[row][col] as inlineKeyboardButton;
      // button url
      if ('url' in btn) {
        if (String(btn.url).startsWith('tg://user?id=')) {
          const peer = snakeClient._client.resolvePeer(
            BigInt(String(btn.url).replace('tg://user?id=', '')),
          );
          if (peer && peer instanceof Raw.InputPeerUser) {
            tempCol.push(
              new Raw.InputKeyboardButtonUserProfile({
                text: String(btn.text),
                userId: new Raw.InputUser({
                  userId: (peer as Raw.InputPeerUser).userId,
                  accessHash: (peer as Raw.InputPeerUser).accessHash,
                }),
              }),
            );
          } else {
            continue;
          }
        } else {
          tempCol.push(
            new Raw.KeyboardButtonUrl({
              text: String(btn.text),
              url: String(btn.url),
            }),
          );
        }
        continue;
      }
      // button login url
      if ('loginUrl' in btn) {
        tempCol.push(
          new Raw.InputKeyboardButtonUrlAuth({
            text: String(btn.text),
            requestWriteAccess: btn.loginUrl?.requestWriteAccess || true,
            fwdText: btn.loginUrl?.forwardText || String(btn.text),
            url: String(btn.loginUrl?.url),
            bot: new Raw.InputUser({
              userId: btn.loginUrl?.bot.id!,
              accessHash: btn.loginUrl?.bot.accessHash!,
            }),
          }),
        );
        continue;
      }
      // button callbackData
      if ('callbackData' in btn) {
        tempCol.push(
          new Raw.KeyboardButtonCallback({
            text: String(btn.text),
            requiresPassword: false,
            data: Buffer.from(String(btn.callbackData)),
          }),
        );
        continue;
      }
      // button switch inline query
      if ('switchInlineQuery' in btn) {
        tempCol.push(
          new Raw.KeyboardButtonSwitchInline({
            text: String(btn.text),
            samePeer: false,
            query: String(btn.switchInlineQuery),
          }),
        );
        continue;
      }
      // button switch inline query current peer
      if ('switchInlineQueryCurrentChat' in btn) {
        tempCol.push(
          new Raw.KeyboardButtonSwitchInline({
            text: String(btn.text),
            samePeer: true,
            query: String(btn.switchInlineQueryCurrentChat),
          }),
        );
        continue;
      }
      // button game
      if ('callbackGame' in btn) {
        tempCol.push(
          new Raw.KeyboardButtonGame({
            text: String(btn.text),
          }),
        );
        continue;
      }
      // button buy
      if ('buy' in btn) {
        tempCol.push(
          new Raw.KeyboardButtonBuy({
            text: String(btn.text),
          }),
        );
        continue;
      }
      // button webapp
      if ('webApp' in btn) {
        tempCol.push(
          new Raw.KeyboardButtonWebView({
            text: String(btn.text),
            url: String(btn.webApp),
          }),
        );
      }
    }
    rows.push(
      new Raw.KeyboardButtonRow({
        buttons: tempCol,
      }),
    );
  }
  return new Raw.ReplyInlineMarkup({
    rows: rows,
  });
}
function replyMarkupKeyboard(replyMarkup: replyKeyboard) {
  let rows: Raw.KeyboardButtonRow[] = [];
  for (let row = 0; row < replyMarkup.keyboard.length; row++) {
    let tempCol: Raw.TypeKeyboardButton[] = [];
    for (let col = 0; col < replyMarkup.keyboard[row].length; col++) {
      // if string[][]
      if (typeof replyMarkup.keyboard[row][col] == 'string') {
        tempCol.push(
          new Raw.KeyboardButton({
            text: String(replyMarkup.keyboard[row][col]),
          }),
        );
        continue;
      }
      if (typeof replyMarkup.keyboard[row][col] !== 'string') {
        let btn: replyKeyboardButton = replyMarkup.keyboard[row][col] as replyKeyboardButton;
        // keyboard requestContact
        if ('requestContact' in btn) {
          tempCol.push(
            new Raw.KeyboardButtonRequestPhone({
              text: String(btn.text),
            }),
          );
          continue;
        }
        //keyboard requestLocation
        if ('requestLocation' in btn) {
          tempCol.push(
            new Raw.KeyboardButtonRequestGeoLocation({
              text: String(btn.text),
            }),
          );
          continue;
        }
        //keyboard requestPoll
        if ('requestPoll' in btn) {
          tempCol.push(
            new Raw.KeyboardButtonRequestPoll({
              text: String(btn.text),
              quiz: Boolean(btn.requestPoll?.toLowerCase() == 'quiz'),
            }),
          );
          continue;
        }
        // keyboard text
        if ('text' in btn) {
          if (!btn.requestPoll && !btn.requestLocation && !btn.requestContact) {
            tempCol.push(
              new Raw.KeyboardButton({
                text: String(btn.text),
              }),
            );
            continue;
          }
        }
      }
    }
    rows.push(
      new Raw.KeyboardButtonRow({
        buttons: tempCol,
      }),
    );
  }
  return new Raw.ReplyKeyboardMarkup({
    rows: rows,
    resize: replyMarkup.resizeKeyboard || undefined,
    singleUse: replyMarkup.oneTimeKeyboard || undefined,
    placeholder: replyMarkup.inputFieldPlaceholder || undefined,
    selective: replyMarkup.selective || undefined,
  });
}
function replyMarkupRemoveKeyboard(replyMarkup: removeKeyboard) {
  return new Raw.ReplyKeyboardHide({
    selective: replyMarkup.selective || undefined,
  });
}
function replyMarkupForceReply(replyMarkup: forceReplyMarkup) {
  return new Raw.ReplyKeyboardForceReply({
    singleUse: replyMarkup.singleUse || undefined,
    selective: replyMarkup.selective || undefined,
    placeholder: replyMarkup.inputFieldPlaceholder || undefined,
  });
}

export async function convertReplyMarkup(
  replyMarkup: Raw.TypeReplyMarkup,
  SnakeClient: Snake,
): Promise<TypeReplyMarkup | undefined> {
  // force reply
  if (replyMarkup instanceof Raw.ReplyKeyboardForceReply) {
    replyMarkup as Raw.ReplyKeyboardForceReply;
    let markup: forceReplyMarkup = {
      forceReply: true,
      selective: replyMarkup.selective || undefined,
      singleUse: replyMarkup.singleUse || undefined,
      inputFieldPlaceholder: replyMarkup.placeholder || undefined,
    };
    return markup;
  }
  // removeKeyboard
  if (replyMarkup instanceof Raw.ReplyKeyboardHide) {
    replyMarkup as Raw.ReplyKeyboardHide;
    let markup: removeKeyboard = {
      removeKeyboard: true,
      selective: replyMarkup.selective || undefined,
    };
    return markup;
  }
  // KeyboardButton
  if (replyMarkup instanceof Raw.ReplyKeyboardMarkup) {
    replyMarkup as Raw.ReplyKeyboardMarkup;
    let rows: replyKeyboardButton[][] = [];
    for (let i = 0; i < replyMarkup.rows.length; i++) {
      let col: replyKeyboardButton[] = [];
      let btns: Raw.KeyboardButtonRow = replyMarkup.rows[i];
      for (let j = 0; j < btns.buttons.length; j++) {
        let btn: Raw.TypeKeyboardButton = btns.buttons[j];
        if (btn instanceof Raw.KeyboardButton) {
          btn as Raw.KeyboardButton;
          let cc: replyKeyboardButton = {
            text: btn.text,
          };
          col.push(cc);
        }
        if (btn instanceof Raw.KeyboardButtonRequestPhone) {
          btn as Raw.KeyboardButtonRequestPhone;
          let cc: replyKeyboardButton = {
            text: btn.text,
            requestContact: true,
          };
          col.push(cc);
        }
        if (btn instanceof Raw.KeyboardButtonRequestGeoLocation) {
          btn as Raw.KeyboardButtonRequestGeoLocation;
          let cc: replyKeyboardButton = {
            text: btn.text,
            requestLocation: true,
          };
          col.push(cc);
        }
        if (btn instanceof Raw.KeyboardButtonRequestPoll) {
          btn as Raw.KeyboardButtonRequestPoll;
          let cc: replyKeyboardButton = {
            text: btn.text,
            requestPoll: btn.quiz ? 'quiz' : 'regular',
          };
          col.push(cc);
        }
      }
      rows.push(col);
    }
    let markup: replyKeyboard = {
      keyboard: rows,
      resizeKeyboard: replyMarkup.resize || undefined,
      oneTimeKeyboard: replyMarkup.singleUse || undefined,
      inputFieldPlaceholder: replyMarkup.placeholder || undefined,
      selective: replyMarkup.selective || undefined,
    };
    return markup;
  }
  // inlineKeyboardButton
  if (replyMarkup instanceof Raw.ReplyInlineMarkup) {
    replyMarkup as Raw.ReplyInlineMarkup;
    let rows: inlineKeyboardButton[][] = [];
    for (let i = 0; i < replyMarkup.rows.length; i++) {
      let col: inlineKeyboardButton[] = [];
      let btns: Raw.KeyboardButtonRow = replyMarkup.rows[i];
      for (let j = 0; j < btns.buttons.length; j++) {
        let btn: Raw.TypeKeyboardButton = btns.buttons[j];
        if (btn instanceof Raw.KeyboardButtonUserProfile) {
          btn as Raw.KeyboardButtonUserProfile;
          let cc: inlineKeyboardButton = {
            text: btn.text,
            url: `tg://user?id=${btn.userId}`,
          };
          col.push(cc);
        }
        if (btn instanceof Raw.KeyboardButtonUrl) {
          btn as Raw.KeyboardButtonUrl;
          let cc: inlineKeyboardButton = {
            text: btn.text,
            url: btn.url,
          };
          col.push(cc);
        }
        if (btn instanceof Raw.KeyboardButtonUrlAuth) {
          btn as Raw.KeyboardButtonUrlAuth;
          let me = SnakeClient._me;
          let ee: BotLoginUrl = {
            id: me?.id!,
            accessHash: me?.accessHash!,
          };
          let dd: loginUrl = {
            requestWriteAccess: true,
            forwardText: btn.fwdText || String(btn.text),
            url: String(btn.url),
            bot: ee,
          };
          let cc: inlineKeyboardButton = {
            loginUrl: dd,
            text: btn.text,
          };
          col.push(cc);
        }
        if (btn instanceof Raw.KeyboardButtonCallback) {
          btn as Raw.KeyboardButtonCallback;
          let cc: inlineKeyboardButton = {
            text: btn.text,
            callbackData: btn.data.toString('utf8'),
          };
          col.push(cc);
        }
        if (btn instanceof Raw.KeyboardButtonSwitchInline) {
          btn as Raw.KeyboardButtonSwitchInline;
          if (btn.samePeer) {
            let cc: inlineKeyboardButton = {
              text: btn.text,
              switchInlineQueryCurrentChat: btn.query,
            };
            col.push(cc);
          } else {
            let cc: inlineKeyboardButton = {
              text: btn.text,
              switchInlineQuery: btn.query,
            };
            col.push(cc);
          }
        }
        if (btn instanceof Raw.KeyboardButtonGame) {
          btn as Raw.KeyboardButtonGame;
          let cc: inlineKeyboardButton = {
            text: btn.text,
            callbackGame: btn.text,
          };
          col.push(cc);
        }
        if (btn instanceof Raw.KeyboardButtonBuy) {
          btn as Raw.KeyboardButtonBuy;
          let cc: inlineKeyboardButton = {
            text: btn.text,
            buy: btn.text,
          };
          col.push(cc);
        }
        if (btn instanceof Raw.KeyboardButtonWebView) {
          btn as Raw.KeyboardButtonWebView;
          let cc: inlineKeyboardButton = {
            text: btn.text,
            webApp: btn.url,
          };
          col.push(cc);
        }
        if (btn instanceof Raw.KeyboardButtonSimpleWebView) {
          btn as Raw.KeyboardButtonSimpleWebView;
          let cc: inlineKeyboardButton = {
            text: btn.text,
            webApp: btn.url,
          };
          col.push(cc);
        }
      }
      rows.push(col);
    }
    let markup: inlineKeyboard = {
      inlineKeyboard: rows,
    };
    return markup;
  }
}
