import {Logger} from 'telegram/extensions';
import {TelegramClient} from 'telegram';
import {StringSession} from 'telegram/sessions';
import {NewMessage} from 'telegram/events';
import {NewMessageEvent} from 'telegram/events/NewMessage';
import {Message} from 'telegram/tl/custom/message';
import {Api} from "telegram"
import * as define from "telegram/define"
import * as reResults from "./rewriteresults"
import BigInt from "big-integer"
import { computeCheck } from "telegram/Password";
import {CustomFile} from "telegram/client/uploads"
import path from "path"
import fs from "fs"
import axios from "axios"
import FileType from "file-type"
import {_parseMessageText} from "telegram/client/messageParse"
import * as Interface from "./interface"

export let client:TelegramClient

async function getFinnalId(chat_id:number|string){
  if(typeof(chat_id) == "string"){
    let entity = await client.getEntity(chat_id)
    return Number(entity.id)
  }
  if(typeof(chat_id) == "number"){
    return Number(chat_id)
  }
}

export class Telegram {
  className:string = "telegram"
  /**
   * Generate simple method from raw api gramjs 
   * parameters : 
   * @param tgclient - gramjs client 
   * @example 
   * ```ts 
   * import {Telegram} from "tgsnake"
   * import {TelegramClient} from "telegram" 
   * import {StringSession} from "telegram/sessions"
   * let client = new TelegramClient(
   *  new StringSession(""),
   *  api_id,
   *  api_hash,
   *  {
        connection_retries : 5
      }
   * )
   * let method = new Telegram(
   *  client
   * )
   * ``` 
   * now you can use this class with gramjs.
  */
  constructor(tgclient:TelegramClient){
    client = tgclient
  }
  /** @hidden */
  private async isChannel(chat_id:number|string):Promise<boolean>{
    let type = await client.getEntity(chat_id) 
    return Boolean(type.className == "Channel")
  }
  /**
   * Sends a message to a chat.
   * @param chat_id - chat or channel or groups id.
   * @param text - text or message to send. 
   * @param more - Interface.sendMessageMoreParams
   * @return ClassResultSendMessage
  */
  async sendMessage(chat_id:number|string,text:string,more?:Interface.sendMessageMoreParams){
      let parseMode = "markdown"
      if(more){
        if(more.parseMode){
          parseMode = more.parseMode.toLowerCase()
          delete more.parseMode
        }
      }
      let [parseText,entities] = await _parseMessageText(client,text,parseMode)
      if(more){
        if(more.entities){
          entities = more.entities
          parseText = text
        }
      }
      return new reResults.ClassResultSendMessage(
        await client.invoke(
          new Api.messages.SendMessage({
              peer : chat_id,
              message : parseText,
              randomId : BigInt(-Math.floor(Math.random() * 10000000000000)),
              entities : entities,
              ...more
            })
        )
       )
    }
  /**
   * Delete messages in a chat/channel/supergroup 
   * @param chat_id - chat or Channel or groups id 
   * @param message_id - array of number message id to be deleted.
   * @return ClassResultAffectedMessages
  */
  async deleteMessages(chat_id:number|string,message_id:number[]){
    let type = await client.getEntity(chat_id)
    if(type.className == "Channel"){
      return new reResults.ClassResultAffectedMessages(
         await client.invoke(
          new Api.channels.DeleteMessages({
            channel: chat_id,
            id: message_id,
          })
        )
      )
    }else{
      return new reResults.ClassResultAffectedMessages(
        await client.invoke(
          new Api.messages.DeleteMessages({
           revoke: true,
           id: message_id,
         })
        )
       )
    }
  }
  /**
   * Edit message 
   * @param chat_id - chat or channel or groups id. 
   * @param message_id - id from message to be edited.
   * @param text - new message if you need to edit media you can replace this with blank string ("")
   * @param more - Interface.editMessageMoreParams
   * @return ClassResultEditMessage
  */
  async editMessage(chat_id:number|string,message_id:number,text:string,more?:Interface.editMessageMoreParams){
    let parseMode = "markdown"
      if(more){
        if(more.parseMode){
          parseMode = more.parseMode.toLowerCase()
          delete more.parseMode
        }
      }
      let [parseText,entities] = await _parseMessageText(client,text,parseMode)
      if(more){
        if(more.entities){
          entities = more.entities
          parseText = text
        }
      }
    return new reResults.ClassResultEditMessage(
      await client.invoke(
        new Api.messages.EditMessage({
          peer: chat_id,
          id: message_id,
          message: parseText,
          entities : entities,
          ...more
        })
      )
    )
  }
  /**
   * Forwards messages by their IDs.
   * @param chat_id - chat or channel or groups id to be sending forwardMessages (receiver).
   * @param from_chat_id -  chat or channel or groups id which will forwarding messages  (sender).
   * @param message_id - array of number message id to be forward. 
   * @param more - Interface.forwardMessageMoreParams
   * @return ClassResultForwardMessages
  */
  async forwardMessages(chat_id:number|string,from_chat_id:number|string,message_id:number[],more?:Interface.forwardMessageMoreParams){
    let randomId:any = []
    for(let i = 0; i < message_id.length;i++){
      randomId.push(BigInt(Math.floor(Math.random() * 10000000000000)))
    }
    return new reResults.ClassResultForwardMessages(
        await client.invoke(
          new Api.messages.ForwardMessages({
            fromPeer : from_chat_id,
            toPeer : chat_id,
            id : message_id,
            randomId : randomId,
            ...more
        })
      )
    )
  }
  /**
   * Get chat/channel/supergroup messages.
   * @param chat_id - chat or channel or groups id.
   * @param message_id - array of number message id. 
   * @return ClassResultGetMessages
  */
  async getMessages(chat_id:number|string,message_id:any[]){
    let type = await client.getEntity(chat_id)
    if(type.className == "Channel"){
      return new reResults.ClassResultGetMessages(
          await client.invoke(new Api.channels.GetMessages({
          channel : chat_id,
          id : message_id
        }))
      )
    }else{
      return new reResults.ClassResultGetMessages(
          await client.invoke(new Api.messages.GetMessages({
          id : message_id
        }))
      )
    }
  }
  /**
   * Get and increase the view counter of a message sent or forwarded from a channel.
   * @param chat_id - channel id.
   * @param message_id - array of message id. 
   * @param increment - Whether to mark the message as viewed and increment the view counter.
   * @return ClassResultGetMessagesViews
  */
  async getMessagesViews(chat_id:number|string,message_id:number[],increment:boolean=false){
    return new reResults.ClassResultGetMessagesViews(
      await client.invoke(new Api.messages.GetMessagesViews({
        peer : chat_id,
        id : message_id,
        increment : increment
      }))
    )
  }
  /**
   * Returns the list of user photos.
   * @param chat_id - chat or channel or groups id.
   * @param more - Interface.getUserPhotosMoreParams.
  */
  async getUserPhotos(chat_id:number|string,more?:Interface.getUserPhotosMoreParams){
    return client.invoke(
        new Api.photos.GetUserPhotos({
          userId : chat_id,
          ...more
        })
      )
  }
  /**
   * Mark channel/supergroup history as read 
   * @param chat_id - chat or channel or groups id.
   * @param more - Interface.readHistoryMoreParams.
   * @return ClassResultAffectedMessages
  */
  async readHistory(chat_id:number|string,more?:Interface.readHistoryMoreParams){
    let type = await client.getEntity(chat_id)
    if(type.className == "Channel"){
      return new reResults.ClassResultAffectedMessages(
          await client.invoke(
              new Api.channels.ReadHistory({
                channel : chat_id,
                ...more
              })
            )
        )
    }else{
      return new reResults.ClassResultAffectedMessages( 
          await client.invoke(
            new Api.messages.ReadHistory({
              peer : chat_id,
              ...more
            })
          )
      )
    }
  }
  /**
   * Get unread messages where we were mentioned
   * @param chat_id - chat or channel or groups id.
   * @return ClassResultAffectedMessages
  */
  async readMentions(chat_id:number|string){
    return new reResults.ClassResultAffectedMessages(
        await client.invoke(
          new Api.messages.ReadMentions({
            peer : chat_id
          })
        )
      )
  }
  /**
   * Mark channel/supergroup message contents as read 
   * @param message_id - array of message id
   * @return ClassResultAffectedMessages
  */
  async readMessageContents(message_id:number[]){
    return new reResults.ClassResultAffectedMessages(
        await client.invoke(
          new Api.messages.ReadMessageContents({
            id : message_id
          })
        )
      )
  }
  /**
   * Unpin all pinned messages 
   * @param chat_id - chat or channel or groups id.
   * @return ClassResultAffectedMessages
  */
  async unpinAllMessages(chat_id:number|string){
    return new reResults.ClassResultAffectedMessages(
        await client.invoke(
          new Api.messages.UnpinAllMessages({
            peer : chat_id
          })
        )
      )
  }
  /**
   * class pinMessage 
   * Pin a message 
   * parameters : 
   * chat_id : chat or channel or groups id.
   * message_id : The message to pin or unpin 
   * more : Interface.pinMessageMoreParams.
   * results : 
   * ClassResultPinMessage
  */
  async pinMessage(chat_id:number|string,message_id:number,more?:Interface.pinMessageMoreParams){
    return new reResults.ClassResultPinMessage(
        await client.invoke(
          new Api.messages.UpdatePinnedMessage({
            peer:chat_id,
            id:message_id,
            ...more
          })
        )
      )
  }
  /**
   * Delete the history of a supergroup
   * @param chat_id - Supergroup whose history must be deleted 
   * @param more - Interface.deleteHistoryMoreParams
   * @return boolean or ClassResultAffectedMessages
  */
  async deleteHistory(chat_id:number|string,more?:Interface.deleteHistoryMoreParams){
    let type = await client.getEntity(chat_id)
    if(type.className == "Channel"){
      return client.invoke(
        new Api.channels.DeleteHistory({
          channel : chat_id,
          ...more
        })
      )
    }else{
      return new reResults.ClassResultAffectedMessages(
          await client.invoke(
            new Api.messages.DeleteHistory({
              peer : chat_id,
              ...more
            })
          )
        )
    }
  }
  /**
   * Delete all messages sent by a certain user in a supergroup 
   * @param chat_id - channel or groups id. 
   * @param user_id - User whose messages should be deleted 
   * @return ClassResultAffectedMessages
  */
  async deleteUserHistory(chat_id:number|string,user_id:number|string){
    return new reResults.ClassResultAffectedMessages(
        await client.invoke(
          new Api.channels.DeleteUserHistory({
            channel : chat_id,
            userId : user_id
          })
        )
      )
  }
  /**
   * Modify the admin rights of a user in a supergroup/channel.
   * @param chat_id - channel or groups id 
   * @param user_id - id from user which will modify the admin rights
   * @param more - Interface.editAdminMoreParams
   * @return ClassResultEditAdminOrBanned
  */
  async editAdmin(chat_id:number|string,user_id:number|string,more?:Interface.editAdminMoreParams){
    let permissions = {
      changeInfo: more?.changeInfo || true,
      postMessages: more?.postMessages || true,
      editMessages: more?.editMessages || true,
      deleteMessages: more?.deleteMessages || true,
      banUsers: more?.banUsers || true,
      inviteUsers: more?.inviteUsers || true,
      pinMessages: more?.pinMessages || true,
      addAdmins: more?.addAdmins || false,
      anonymous: more?.anonymous || false,
      manageCall: more?.manageCall ||true
    }
    return new reResults.ClassResultEditAdminOrBanned( 
        await client.invoke(
          new Api.channels.EditAdmin({
            channel : chat_id,
            userId : user_id,
            adminRights : new Api.ChatAdminRights(permissions),
            rank : more?.rank || ""
          })
        )
      )
  }
  /**
   * Ban/unban/kick a user in a supergroup/channel.
   * @param chat_id - channel or groups id 
   * @param user_id - id from user which will banned/kicked/unbanned 
   * @param more - Interface.editBannedMoreParams
   * @return ClassResultEditAdminOrBanned
  */
  async editBanned(chat_id:number|string,user_id:number|string,more?:Interface.editBannedMoreParams){
    let permissions = {
      untilDate: more?.untilDate || 0,
      viewMessages: more?.viewMessages || true,
      sendMessages: more?.sendMessages || true,
      sendMedia: more?.sendMedia || true,
      sendStickers: more?.sendStickers || true,
      sendGifs: more?.sendGifs || true,
      sendGames: more?.sendGames || true,
      sendInline: more?.sendInline || true,
      sendPolls: more?.sendPolls || true,
      changeInfo: more?.changeInfo || true,
      inviteUsers: more?.inviteUsers || true,
      pinMessages: more?.pinMessages || true,
      embedLinks: more?.embedLinks || true
    }
    return new reResults.ClassResultEditAdminOrBanned(
        await client.invoke(
          new Api.channels.EditBanned({
            channel : chat_id,
            participant : user_id,
            bannedRights : new Api.ChatBannedRights(permissions)
          })
        )
      )
  }
  /**
   * Change the photo of a channel/Supergroup 
   * @param chat_id - Channel/supergroup whose photo should be edited 
   * @param photo - new photo. 
   * @return ClassResultEditPhotoOrTitle
  */
  async editPhoto(chat_id:number|string,photo:string|Buffer){
    let rr = await this.uploadFile(photo)
    let toUpload = new Api.InputFile({...rr!})
    if(await this.isChannel(chat_id)){
      return new reResults.ClassResultEditPhotoOrTitle(
        await client.invoke(
          new Api.channels.EditPhoto({
            channel : chat_id,
            photo : toUpload
          })
        )
      )
    }else{
      return client.invoke(
          new Api.messages.EditChatPhoto({
            chatId : await getFinnalId(chat_id),
            photo : toUpload
          })
        )
    }
  }
  /**
   * upload file from url or buffer or file path 
   * @param file - file to uploaded 
   * @param more - Interface.uploadFileMoreParams
   * @return ClassResultUploadFile
  */
  async uploadFile(file:string|Buffer,more?: Interface.uploadFileMoreParams){
    if(Buffer.isBuffer(file)){
      let fileInfo = await FileType.fromBuffer(file)
      if(fileInfo){
        let file_name = more?.fileName || `${Date.now()/1000}.${fileInfo.ext}`
        let toUpload = new CustomFile(
            file_name,
            Buffer.byteLength(file),
            "",
            file
          )
        return new reResults.ClassResultUploadFile(
          await client.uploadFile({
            file : toUpload,
            workers : more?.workers || 1,
            onProgress : more?.onProgress
          })
        )
      }
    }else{
      let basename = path.basename(file)
      if(/^http/i.exec(file)){
        let res = await axios.get(file,{
          responseType: "arraybuffer"
        })
        let basebuffer = Buffer.from(res.data, "utf-8")
        let file_name = more?.fileName || basename
        let match = /\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/gmi.exec(file_name)
        if(!match){
          let fileInfo = await FileType.fromBuffer(basebuffer)
          if(fileInfo){
            file_name = `${file_name}.${fileInfo.ext}`
          }
        }
        let toUpload = new CustomFile(
          file_name,
          Buffer.byteLength(basebuffer),
          "",
          basebuffer
        )
        return new reResults.ClassResultUploadFile(
          await client.uploadFile({
            file : toUpload,
            workers : more?.workers || 1,
            onProgress : more?.onProgress
          })
        )
      }
      if(/^(\/|\.\.?\/|~\/)/i.exec(file)){
        let file_name = more?.fileName || basename
        let match = /\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/gmi.exec(file_name)
        if(!match){
          let fileInfo = await FileType.fromFile(file)
          if(fileInfo){
            file_name = `${file_name}.${fileInfo.ext}`
          }
        }
        let toUpload = new CustomFile(
          file_name,
          fs.statSync(file).size,
          file
        )
        return new reResults.ClassResultUploadFile(
          await client.uploadFile({
            file : toUpload,
            workers : more?.workers || 1,
            onProgress : more?.onProgress
          })
        )
      }
    }
  }
  /**
   * Edit the name of a channel/supergroup 
   * @param chat_id - chat or channel or groups id.
   * @param title - new title.
   * ClassResultEditPhotoOrTitle
  */
  async editTitle(chat_id:number|string,title:string){
    if(await this.isChannel(chat_id)){
      return new reResults.ClassResultEditPhotoOrTitle(
          await client.invoke(
              new Api.channels.EditTitle({
                channel : chat_id,
                title : title
              })
            )
        )
    }else{
      return client.invoke(
          new Api.messages.EditChatTitle({
            chatId : await getFinnalId(chat_id),
            title : title
          })
        )
    }
  }
  /**
   * Get link and embed info of a message in a channel/supergroup.
   * @param chat_id - chat or channel or groups id. 
   * @param message_id - message id 
   * @param more - Interface.exportMessageLinkMoreParams
   * @return gramjs ExportedMessageLink
  */
  async exportMessageLink(chat_id:number|string,message_id:number,more?:Interface.exportMessageLinkMoreParams){
    return client.invoke(
        new Api.channels.ExportMessageLink({
          channel : chat_id,
          id : message_id,
          ...more
        })
      )
  }
  /**
   * Get channels/supergroups/geogroups we're admin in. Usually called when the user exceeds the limit for owned public channels/supergroups/geogroups, and the user is given the choice to remove one of his channels/supergroups/geogroups. 
   * @param by_location - Get geogroups 
   * @patam check_limit - If set and the user has reached the limit of owned public channels/supergroups/geogroups, instead of returning the channel list one of the specified errors will be returned. Useful to check if a new public channel can indeed be created, even before asking the user to enter a channel username to use in channels.checkUsername/channels.updateUsername. 
   * @return ClassResultMessageChat
  */
  async getAdminedPublicChannels(by_location:boolean=true,check_limit:boolean=true){
    return new reResults.ClassResultMessageChat(
        await client.invoke(
          new Api.channels.GetAdminedPublicChannels({
            byLocation : by_location,
            checkLimit : check_limit
          })
        )
      )
  }
  /**
   * Get the admin log of a channel/supergroup 
   * @param chat_id - chat or channel or groups id. 
   * @param more - Interface.getAdminLogMoreParams
   * @return ClassResultGetAdminLog
  */
  async getAdminLog(chat_id:number|string,more?:Interface.getAdminLogMoreParams){
    let filter = {
      join: more?.join || true,
      leave: more?.leave || true,
      invite: more?.invite || true,
      ban: more?.ban || true,
      unban: more?.unban || true,
      kick: more?.kick || true,
      unkick: more?.unkick || true,
      promote: more?.promote || true,
      demote: more?.demote || true,
      info: more?.info || true,
      settings: more?.settings || true,
      pinned: more?.pinned || true,
      groupCall: more?.groupCall || true,
      invites: more?.invites || true,
      edit:more?.edit || true,
      "delete":more?.delete || true
    }
    return new reResults.ClassResultGetAdminLog(
        await client.invoke(
          new Api.channels.GetAdminLog({
            channel : chat_id,
            eventsFilter : new Api.ChannelAdminLogEventsFilter(filter),
            q : more?.q || "",
            maxId: more?.maxId || undefined,
            minId: more?.minId || undefined,
            limit: more?.limit || undefined
          })
        )
      )
  }
  /**
   * Get info about channels/supergroups 
   * @param chat_id - IDs of channels/supergroups to get info about 
   * @return ClassResultMessageChat
  */
  async getChannels(chat_id:number[]|string[]){
    return new reResults.ClassResultMessageChat(
        await client.invoke(
          new Api.channels.GetChannels({
            id : chat_id
          })
        )
      )
  }
  /**
   * Get full info about a channel or chats 
   * parameters : 
   * @param chat_id - IDs of chat/channels/supergroups to get info about 
   * @return gramjs messages.ChatFull
  */
  async getFullChat(chat_id:number|string){
    if(await this.isChannel(chat_id)){
      return client.invoke(
          new Api.channels.GetFullChannel({
            channel : chat_id
          })
        )
    }else{
      return client.invoke(
          new Api.messages.GetFullChat({
            chatId : await getFinnalId(chat_id)
          })
        )
    }
  }
  /**
   * Get all groups that can be used as discussion groups.
   * @return ClassResultMessageChat
  */
  async getGroupsForDiscussion(){
    return new reResults.ClassResultMessageChat(
        await client.invoke(
          new Api.channels.GetGroupsForDiscussion()
        )
      )
  }
  /**
   * Get inactive channels and supergroups 
  */
  async getInactiveChannels(){
    return client.invoke(
        new Api.channels.GetInactiveChannels()
      )
  }
  /**
   * Get a list of channels/supergroups we left.
   * @param offset - Offset for pagination 
  */
  async getLeftChannels(offset:number = 0){
    return client.invoke(
        new Api.channels.GetLeftChannels({
          offset : offset
        })
      )
  }
  /**
   * 
  */
}
