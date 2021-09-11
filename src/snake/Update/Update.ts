// Tgsnake - Telegram MTProto framework developed based on gram.js.
// Copyright (C) 2021 Butthx <https://guthub.com/butthx>
//
// This file is part of Tgsnake
//
// Tgsnake is a free software : you can redistribute it and/or modify
//  it under the terms of the MIT License as published.
import { Telegram } from '../Telegram';
import { sendMessageMoreParams } from '../Telegram/Messages/sendMessage';
export type TypeUpdates =
  | 'UpdateNewMessage'
  | 'UpdateMessageID'
  | 'UpdateDeleteMessages'
  | 'UpdateUserTyping'
  | 'UpdateChatUserTyping'
  | 'UpdateChatParticipants'
  | 'UpdateUserStatus'
  | 'UpdateUserName'
  | 'UpdateUserPhoto'
  | 'UpdateNewEncryptedMessage'
  | 'UpdateEncryptedChatTyping'
  | 'UpdateEncryption'
  | 'UpdateEncryptedMessagesRead'
  | 'UpdateChatParticipantAdd'
  | 'UpdateChatParticipantDelete'
  | 'UpdateDcOptions'
  | 'UpdateNotifySettings'
  | 'UpdateServiceNotification'
  | 'UpdatePrivacy'
  | 'UpdateUserPhone'
  | 'UpdateReadHistoryInbox'
  | 'UpdateReadHistoryOutbox'
  | 'UpdateWebPage'
  | 'UpdateReadMessagesContents'
  | 'UpdateChannelTooLong'
  | 'UpdateChannel'
  | 'UpdateNewChannelMessage'
  | 'UpdateReadChannelInbox'
  | 'UpdateDeleteChannelMessages'
  | 'UpdateChannelMessageViews'
  | 'UpdateChatParticipantAdmin'
  | 'UpdateNewStickerSet'
  | 'UpdateStickerSetsOrder'
  | 'UpdateStickerSets'
  | 'UpdateSavedGifs'
  | 'UpdateBotInlineQuery'
  | 'UpdateBotInlineSend'
  | 'UpdateEditChannelMessage'
  | 'UpdateBotCallbackQuery'
  | 'UpdateEditMessage'
  | 'UpdateInlineBotCallbackQuery'
  | 'UpdateReadChannelOutbox'
  | 'UpdateDraftMessage'
  | 'UpdateReadFeaturedStickers'
  | 'UpdateRecentStickers'
  | 'UpdateConfig'
  | 'UpdatePtsChanged'
  | 'UpdateChannelWebPage'
  | 'UpdateDialogPinned'
  | 'UpdatePinnedDialogs'
  | 'UpdateBotWebhookJSON'
  | 'UpdateBotWebhookJSONQuery'
  | 'UpdateBotShippingQuery'
  | 'UpdateBotPrecheckoutQuery'
  | 'UpdatePhoneCall'
  | 'UpdateLangPackTooLong'
  | 'UpdateLangPack'
  | 'UpdateFavedStickers'
  | 'UpdateChannelReadMessagesContents'
  | 'UpdateContactsReset'
  | 'UpdateChannelAvailableMessages'
  | 'UpdateDialogUnreadMark'
  | 'UpdateMessagePoll'
  | 'UpdateChatDefaultBannedRights'
  | 'UpdateFolderPeers'
  | 'UpdatePeerSettings'
  | 'UpdatePeerLocated'
  | 'UpdateNewScheduledMessage'
  | 'UpdateDeleteScheduledMessages'
  | 'UpdateTheme'
  | 'UpdateGeoLiveViewed'
  | 'UpdateLoginToken'
  | 'UpdateMessagePollVote'
  | 'UpdateDialogFilter'
  | 'UpdateDialogFilterOrder'
  | 'UpdateDialogFilters'
  | 'UpdatePhoneCallSignalingData'
  | 'UpdateChannelMessageForwards'
  | 'UpdateReadChannelDiscussionInbox'
  | 'UpdateReadChannelDiscussionOutbox'
  | 'UpdatePeerBlocked'
  | 'UpdateChannelUserTyping'
  | 'UpdatePinnedMessages'
  | 'UpdatePinnedChannelMessages'
  | 'UpdateChat'
  | 'UpdateGroupCallParticipants'
  | 'UpdateGroupCall'
  | 'UpdatePeerHistoryTTL'
  | 'UpdateChatParticipant'
  | 'UpdateChannelParticipant'
  | 'UpdateBotStopped'
  | 'UpdateGroupCallConnection'
  | 'UpdateBotCommands'
  | 'UpdatesTooLong'
  | 'UpdateShortMessage'
  | 'UpdateShortChatMessage'
  | 'UpdateShort'
  | 'UpdatesCombined'
  | 'Updates'
  | 'UpdateShortSentMessage';
export class Update {
  '_'!: TypeUpdates;
  telegram!: Telegram;
  constructor() {}
  async reply(text: string, more?: sendMessageMoreParams) {
    //@ts-ignore
    if (this.chat) {
      if (this.telegram) {
        //@ts-ignore
        return await this.telegram.sendMessage(this.chat.id, text, more);
      }
    }
  }
}
