// Tgsnake - Telegram MTProto framework developed based on gram.js.
// Copyright (C) 2021 Butthx <https://guthub.com/butthx>
//
// This file is part of Tgsnake
//
// Tgsnake is a free software : you can redistribute it and/or modify
//  it under the terms of the MIT License as published

import { Api } from 'telegram';
import { BigInteger } from 'big-integer';
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
   * bot id getting from .getEntity()
   */
  id: number;
  /**
   * Bot access hash
   * access hash getting from .getEntity()
   */
  accessHash: BigInteger;
}

export function BuildReplyMarkup(replyMarkup: TypeReplyMarkup) {
  // inlineKeyboard
  if ('inlineKeyboard' in replyMarkup) {
    return replyMarkupInlineKeyboard(replyMarkup as inlineKeyboard);
  }
  // keyboard
  if ('keyboard' in replyMarkup) {
    return replyMarkupKeyboard(replyMarkup as replyKeyboard);
  }
  // removeKeyboard
  if ('removeKeyboard' in replyMarkup) {
    return replyMarkupRemoveKeyboard(replyMarkup as removeKeyboard);
  }
  // forceReply
  if ('forceReply' in replyMarkup) {
    return replyMarkupForceReply(replyMarkup as forceReplyMarkup);
  }
}
function replyMarkupInlineKeyboard(replyMarkup: inlineKeyboard) {
  let rows: Api.KeyboardButtonRow[] = [];
  for (let row = 0; row < replyMarkup.inlineKeyboard.length; row++) {
    let tempCol: Api.TypeKeyboardButton[] = [];
    for (let col = 0; col < replyMarkup.inlineKeyboard[row].length; col++) {
      let btn: inlineKeyboardButton = replyMarkup.inlineKeyboard[row][col] as inlineKeyboardButton;
      // button url
      if (btn.url) {
        tempCol.push(
          new Api.KeyboardButtonUrl({
            text: String(btn.text),
            url: String(btn.url),
          })
        );
        continue;
      }
      // button login url
      if (btn.loginUrl) {
        tempCol.push(
          new Api.InputKeyboardButtonUrlAuth({
            text: String(btn.text),
            requestWriteAccess: btn.loginUrl?.requestWriteAccess || true,
            fwdText: btn.loginUrl?.forwardText || String(btn.text),
            url: String(btn.loginUrl?.url),
            bot: new Api.InputUser({
              userId: btn.loginUrl?.bot.id!,
              accessHash: btn.loginUrl?.bot.accessHash!,
            }),
          })
        );
        continue;
      }
      // button callbackData
      if (btn.callbackData) {
        tempCol.push(
          new Api.KeyboardButtonCallback({
            text: String(btn.text),
            requiresPassword: false,
            data: Buffer.from(String(btn.callbackData)),
          })
        );
        continue;
      }
      // button switch inline query
      if (btn.switchInlineQuery) {
        tempCol.push(
          new Api.KeyboardButtonSwitchInline({
            text: String(btn.text),
            samePeer: false,
            query: String(btn.switchInlineQuery),
          })
        );
        continue;
      }
      // button switch inline query current peer
      if (btn.switchInlineQueryCurrentChat) {
        tempCol.push(
          new Api.KeyboardButtonSwitchInline({
            text: String(btn.text),
            samePeer: true,
            query: String(btn.switchInlineQueryCurrentChat),
          })
        );
        continue;
      }
      // button game
      if (btn.callbackGame) {
        tempCol.push(
          new Api.KeyboardButtonGame({
            text: String(btn.text),
          })
        );
        continue;
      }
      // button buy
      if (btn.buy) {
        tempCol.push(
          new Api.KeyboardButtonBuy({
            text: String(btn.text),
          })
        );
        continue;
      }
    }
    rows.push(
      new Api.KeyboardButtonRow({
        buttons: tempCol,
      })
    );
  }
  return new Api.ReplyInlineMarkup({
    rows: rows,
  });
}
function replyMarkupKeyboard(replyMarkup: replyKeyboard) {
  let rows: Api.KeyboardButtonRow[] = [];
  for (let row = 0; row < replyMarkup.keyboard.length; row++) {
    let tempCol: Api.TypeKeyboardButton[] = [];
    for (let col = 0; col < replyMarkup.keyboard[row].length; col++) {
      // if string[][]
      if (typeof replyMarkup.keyboard[row][col] == 'string') {
        tempCol.push(
          new Api.KeyboardButton({
            text: String(replyMarkup.keyboard[row][col]),
          })
        );
        continue;
      }
      if (typeof replyMarkup.keyboard[row][col] !== 'string') {
        let btn: replyKeyboardButton = replyMarkup.keyboard[row][col] as replyKeyboardButton;
        // keyboard requestContact
        if (btn.requestContact) {
          tempCol.push(
            new Api.KeyboardButtonRequestPhone({
              text: String(btn.text),
            })
          );
          continue;
        }
        //keyboard requestLocation
        if (btn.requestLocation) {
          tempCol.push(
            new Api.KeyboardButtonRequestGeoLocation({
              text: String(btn.text),
            })
          );
          continue;
        }
        //keyboard requestPoll
        if (btn.requestPoll) {
          tempCol.push(
            new Api.KeyboardButtonRequestPoll({
              text: String(btn.text),
              quiz: Boolean(btn.requestPoll.toLowerCase() == 'quiz'),
            })
          );
          continue;
        }
        // keyboard text
        if (btn.text) {
          if (!btn.requestPoll && !btn.requestLocation && !btn.requestContact) {
            tempCol.push(
              new Api.KeyboardButton({
                text: String(btn.text),
              })
            );
            continue;
          }
        }
      }
    }
    rows.push(
      new Api.KeyboardButtonRow({
        buttons: tempCol,
      })
    );
  }
  return new Api.ReplyKeyboardMarkup({
    rows: rows,
    resize: replyMarkup.resizeKeyboard || undefined,
    singleUse: replyMarkup.oneTimeKeyboard || undefined,
    placeholder: replyMarkup.inputFieldPlaceholder || undefined,
    selective: replyMarkup.selective || undefined,
  });
}
function replyMarkupRemoveKeyboard(replyMarkup: removeKeyboard) {
  return new Api.ReplyKeyboardHide({
    selective: replyMarkup.selective || undefined,
  });
}
function replyMarkupForceReply(replyMarkup: forceReplyMarkup) {
  return new Api.ReplyKeyboardForceReply({
    singleUse: replyMarkup.singleUse || undefined,
    selective: replyMarkup.selective || undefined,
    placeholder: replyMarkup.inputFieldPlaceholder || undefined,
  });
}
