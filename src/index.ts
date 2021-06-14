import {Logger} from 'telegram/extensions';
import {TelegramClient} from 'telegram';
import {StringSession} from 'telegram/sessions';
import {NewMessage} from 'telegram/events';
import {NewMessageEvent} from 'telegram/events/NewMessage';
import {Message} from 'telegram/tl/custom/message';
import {tele} from "./snake/tele"
import {shortcut} from "./snake/shortcut"
import {message} from "./snake/rewritejson"
const input = require("input")


export class snake {
  client:any
  api_hash:any
  api_id:any
  session:any
  bot_token:any
  telegram:any
  connection_retries:number
  constructor(options:any){
    //default options
    this.api_hash = undefined 
    this.api_id = undefined
    this.session = ""
    this.bot_token = undefined
    this.connection_retries = 5
    // custom options
    if(options.logger){
      Logger.setLevel(options.logger)
    }else{
      Logger.setLevel("none")
    }
    if(options.api_hash){
      this.api_hash = options.api_hash
    }
    if(options.api_id){
      this.api_id = options.api_id
    }
    if(options.session){
      this.session = options.session
    }
    if(options.bot_token){
      this.bot_token = options.bot_token
    }
    if(options.connection_retries){
      this.connection_retries = options.connection_retries
    }
  }
  async run(){
    if(!this.api_hash || !this.api_id){
      throw "api_hash or api_id not found!."
    }else{
      this.client = new TelegramClient(
          new StringSession(this.session),
          Number(this.api_id),
          String(this.api_hash),
          { connectionRetries: this.connection_retries }
        )
      this.telegram = new tele(this.client)
      if(this.session == ""){
        if(!this.bot_token){
          await this.client.start({
            phoneNumber: async () => await input.text('Input your number with country format'),
            password: async () => await input.text('Input your 2FA password'),
            phoneCode: async () => await input.text('Input Telegram verifications code'),
            onError: (err:any) => { throw err },
          })
          this.session = await this.client.session.save()
          console.log(`Your Sessions : ${this.session}`)
        }else{
          await this.client.start({
            botAuthToken : this.bot_token
          })
          this.session = await this.client.session.save()
          console.log(`Your Sessions : ${this.session}`)
        }
      }else{
        await this.client.connect()
      }
      await this.client.getMe()
      console.log("🐍 Running..")
    }
    process.once('SIGINT', () => console.log("🐍 Killing.."))
    process.once('SIGTERM', () => console.log("🐍 Killing.."))
  }
  async onNewMessage(next:any){
    this.client.addEventHandler((event:NewMessageEvent)=>{
      let cut = new shortcut(this.client,event)
      return next(cut,new message(cut.message,event))
    },new NewMessage({}))
  }
}