/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2025 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import type { Snake } from '../Snake.ts';
import { Logger } from '../../Context/Logger.ts';
import { Storages, Client, Raw, prompts, sysprc } from '../../platform.deno.ts';
const onCancel = () => {
  Logger.info('Aborting prompt!!');
  sysprc.exit(1);
  return false;
};
export async function LoginWithCLI(snake: Snake): Promise<Raw.users.UserFull | undefined> {
  Logger.info('Initial login with CLI.');
  if (!snake._options.apiId) {
    Logger.debug('Api Id is missing.');
    await AskApiId(snake);
  }
  if (!snake._options.apiHash) {
    Logger.debug('Api Hash is missing.');
    await AskApiHash(snake);
  }
  Logger.debug('Creating client.');
  snake._client = new Client(
    snake._options.login.session as unknown as Storages.AbstractSession,
    snake._options.apiHash,
    snake._options.apiId,
    snake._options.clientOptions,
  );
  await (snake._options.login.session as unknown as Storages.AbstractSession).load();
  if (!(snake._options.login.session as unknown as Storages.AbstractSession).authKey) {
    if (snake._options.login.botToken) {
      Logger.debug('Login using bot token.');
      const user = await snake._client.start({
        botToken: snake._options.login.botToken!,
      });
      Logger.log(
        `${
          snake._options.login.forceDotSession
            ? `(${snake._options.login.sessionName}.session)`
            : ``
        } Loggined as: `,
      );
      await (snake._options.login.session as unknown as Storages.AbstractSession).save();
      return user;
    }
    const loginAs = await AskLoginAs();
    if (loginAs === 'undefined') return;
    Logger.debug(`Login as: ${loginAs}`);
    if (loginAs === 'bot') {
      await AskBotToken(snake);
      const user = await snake._client.start({
        botToken: snake._options.login.botToken!,
      });
      Logger.log(
        `${
          snake._options.login.forceDotSession
            ? `(${snake._options.login.sessionName}.session)`
            : ``
        } Loggined as: `,
      );
      await (snake._options.login.session as unknown as Storages.AbstractSession).save();
      return user;
    }
    const user = await snake._client.start({
      phoneNumber: AskPhoneNumber,
      password: AskPassword,
      recoveryCode: AskRecoveryCode,
      code: AskOTPCode,
      firstname: AskFirstName,
      lastname: AskLastName,
    });
    Logger.log(
      `${
        snake._options.login.forceDotSession ? `(${snake._options.login.sessionName}.session)` : ``
      } Loggined as: `,
    );
    await (snake._options.login.session as unknown as Storages.AbstractSession).save();
    return user;
  } else {
    await snake.connect();
    return await snake.getMe();
  }
}
async function AskApiId(snake: Snake): Promise<string> {
  const { value } = await prompts(
    {
      type: 'number',
      name: 'value',
      message: 'Input your api id!',
      validate: (value: string) => (value ? true : false),
    },
    { onCancel },
  );
  snake._options.apiId = value;
  Logger.debug(`Setting up Api Id with: ${snake._options.apiId}.`);
  return String(value);
}
async function AskApiHash(snake: Snake): Promise<string> {
  const { value } = await prompts(
    {
      type: 'text',
      name: 'value',
      message: 'Input your api hash!',
      validate: (value: string) => (value ? true : false),
    },
    { onCancel },
  );
  snake._options.apiHash = value;
  Logger.debug(`Setting up Api Hash with: ${snake._options.apiHash}.`);
  return String(value);
}
async function AskLoginAs(): Promise<string> {
  const { value } = await prompts(
    {
      type: 'select',
      name: 'value',
      message: 'Login as?',
      initial: 0,
      choices: [
        {
          title: 'Bot',
          description: 'Login as bot using bot token from bot father.',
          value: 'bot',
        },
        {
          title: 'User',
          description: 'Login as user using phone number.',
          value: 'user',
        },
      ],
    },
    { onCancel },
  );
  return String(value);
}
async function AskBotToken(snake: Snake): Promise<string> {
  const { value } = await prompts(
    {
      type: 'text',
      name: 'value',
      message: 'Input your bot token!',
      validate: (value: string) => (value ? true : false),
    },
    { onCancel },
  );
  snake._options.login.botToken = value;
  const splitedBotToken = String(snake._options.login.botToken).split(':');
  const securedBotToken = `${splitedBotToken[0]}:${splitedBotToken[1]
    .slice(30)
    .padStart(splitedBotToken[1].length, '*')}`;
  Logger.debug(`Setting up Bot Token with: ${securedBotToken}.`);
  return String(value);
}
async function AskPhoneNumber(): Promise<string> {
  const { value } = await prompts(
    {
      type: 'number',
      name: 'value',
      message: 'Input your international phone number!',
      validate: (value: string) => (value ? true : false),
    },
    { onCancel },
  );
  return String(value);
}
async function AskPassword(hint: string): Promise<string> {
  const { value } = await prompts(
    {
      type: 'password',
      name: 'value',
      message: `Input your two factor authentication password!\n\nHint : ${hint}`,
      validate: (value: string) => (value ? true : false),
    },
    { onCancel },
  );
  return String(value);
}
async function AskRecoveryCode(): Promise<string> {
  const { value } = await prompts(
    {
      type: 'number',
      name: 'value',
      message: 'Input your recovery code from your email address!',
      validate: (value: string) => (value ? true : false),
    },
    { onCancel },
  );
  return String(value);
}
async function AskOTPCode(): Promise<string> {
  const { value } = await prompts(
    {
      type: 'number',
      name: 'value',
      message: 'Input your otp code from telegram application or sms!',
      validate: (value: string) => (value ? true : false),
    },
    { onCancel },
  );
  return String(value);
}
async function AskFirstName(): Promise<string> {
  const { value } = await prompts(
    {
      type: 'text',
      name: 'value',
      message: 'Input your first name!',
      validate: (value: string) => (value ? true : false),
    },
    { onCancel },
  );
  return String(value);
}
async function AskLastName(): Promise<string> {
  const { value } = await prompts(
    {
      type: 'text',
      name: 'value',
      message: 'Input your last name!',
      validate: (value: string) => (value ? true : false),
    },
    { onCancel },
  );
  return String(value);
}
