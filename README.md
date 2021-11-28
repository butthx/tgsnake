![tgsnakeicon-flaticon](./media/tgsnake.jpg)  
Hi, **tgsnake** is a framework developed based on gram.js  
[![github-repo](https://img.shields.io/badge/Github-butthx-blue.svg?style=for-the-badge&logo=github)](https://github.com/butthx/tgsnake)
[![telegram-chat](https://img.shields.io/badge/Telegram-Chat-blue.svg?style=for-the-badge&logo=telegram)](https://t.me/tgsnakechat)  
[![telegram-channel](https://img.shields.io/badge/Telegram-Channel-blue.svg?style=for-the-badge&logo=telegram)](https://t.me/tgsnake)
[![generate-session](https://img.shields.io/badge/Generate-Session-blue.svg?style=for-the-badge&logo=replit)](https://replit.com/@butthx/TgSnakeGenerateSessions)  
[![Crowdin](https://badges.crowdin.net/tgsnake/localized.svg)](https://crowdin.com/project/tgsnake)  

> WARNING! <br/>
> Maybe your account will be banned if you login using this framework. I don't know what caused it to happen. I am not responsible if your account is banned!

### Example : 

- Installation :  

```bash 
yarn add tgsnake@latest
```
- Simple Hello World :   

```javascript
const {Snake} = require("tgsnake")
// import {Snake} from "tgsnake"
const bot = new Snake({
  api_hash : "abcde", //your api hash
  api_id : 123456, // your api id
  bot_token : "123457890:abcd", // bot token. if you login using number delete this.
  logger:"none" // gramjs logger
})
/**
 * if you login as user, you must generateSession first! 
 * bot.generateSession()
 * disable bot.run() to generate session!
*/
bot.run() //snake running

bot.on("message",(ctx)=>{ //handle new message event.
  ctx.reply("Hello World") // reply with "Hello World"
  //console.log(ctx) // see json of message.
})
```
More example you can found in example folder or in website.
  
### Contribution  
Welcome, You can contribute to this project. 
#### Guide 
- Fork this repo to your account. 
- Clone your fork repo using git.   
```bash 
git clone <your github repo url> -b "dev"
```
Cloning branch dev in your repo. 
- Edit and make something. 
- Pull new update from branch `dev` original repo (this repo). 
- Push update to your branch `dev` in fork repo.
- Create pull request to branch `dev` original repo from branch `dev` frok repo.
  
### Reference 
- [Pyrogram](https://github.com/pyrogram/pyrogram) 
- [Telethon](https://github.com/LonamiWebs/Telethon) 
- [GramJs](https://github.com/gram-js/gramjs)
- [Telegram Api](https://core.telegram.org/schema) 
- [Grammy](https://github.com/grammyjs/grammyjs)
- [Telegraf](https://github.com/telegraf/telegraf)
  
Thanks to all the frameworks and references that I use, several people who helped in developing this framework that I cannot mention one by one.   
  
Build with ♥️ by [tgsnake dev](https://t.me/+Fdu8unNApTg3ZGU1).