import { Snake } from 'tgsnake';

const client = new Snake();

client.cmd('start', async (ctx) => {
  const conversation = client.conversation.create(ctx.message.chat.id);
  await ctx.message.reply('Input A');
  const response_1 = await conversation.wait('msg.text');
  await response_1.message.reply('Input B');
  const response_2 = await conversation.wait('msg.text', (update) => {
    if (update.message.text.toLowerCase() === 'b') {
      return true;
    }
    update.message.reply('Input B');
    return false;
  });
  response_2.message.reply('Done');
});

client.run();
