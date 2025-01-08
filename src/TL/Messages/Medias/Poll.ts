/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2025 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { Raw, Parser, type Entities } from '../../../platform.deno.ts';
import { TLObject } from '../../TL.ts';
import { Chat, User } from '../../Advanced/index.ts';
import { getId } from '../../../Utilities.ts';
import type { Snake } from '../../../Client/index.ts';

// https://core.telegram.org/bots/api#pollanswer
export class PollAnswer extends TLObject {
  pollId!: bigint;
  voterChat?: Chat;
  user?: User;
  options!: Array<string>;
  constructor(
    {
      pollId,
      voterChat,
      user,
      options,
    }: {
      pollId: bigint;
      voterChat?: Chat;
      user?: User;
      options: Array<string>;
    },
    client: Snake,
  ) {
    super(client);
    this.pollId = pollId;
    this.voterChat = voterChat;
    this.user = user;
    this.options = options;
  }
  static parseUpdate(
    client: Snake,
    vote: Raw.UpdateMessagePollVote,
    chats: Array<Raw.TypeChat>,
    users: Array<Raw.TypeUser>,
  ): PollAnswer {
    const userId = getId(vote.peer!);
    let from = User.parse(
      client,
      users.find((user) => user.id === userId),
    );
    let chat = Chat.parseDialog(client, vote.peer, users, chats);
    return new PollAnswer(
      {
        pollId: vote.pollId,
        options: vote.options.map((el) => el.toString()),
        user: from,
        voterChat: from ? undefined : chat,
      },
      client,
    );
  }
}
export class PollOption extends TLObject {
  text!: string;
  chosen!: boolean;
  correct!: boolean;
  voters!: number;
  option!: string;
  entities!: Array<Entities>;
  constructor(
    {
      text,
      chosen,
      correct,
      voters,
      option,
      entities,
    }: {
      text: string;
      chosen: boolean;
      correct: boolean;
      voters: number;
      option: string;
      entities: Array<Entities>;
    },
    client: Snake,
  ) {
    super(client);
    this.text = text;
    this.chosen = chosen;
    this.correct = correct;
    this.voters = voters;
    this.option = option;
    this.entities = entities;
  }
}
// https://core.telegram.org/bots/api#poll
export class Poll extends TLObject {
  id!: bigint;
  closed!: boolean;
  publicVoters!: boolean;
  multipleChoice!: boolean;
  quiz!: boolean;
  question!: string;
  questionEntities?: Array<Entities>;
  options!: Array<PollOption | undefined>;
  min!: boolean;
  totalVoters!: number;
  recentVoters!: any;
  closePeriod?: number;
  closeDate?: Date;
  solution?: string;
  solutionEntities?: Array<Entities>;
  constructor(
    {
      id,
      closed,
      publicVoters,
      multipleChoice,
      quiz,
      question,
      questionEntities,
      options,
      closePeriod,
      closeDate,
      min,
      totalVoters,
      recentVoters,
      solution,
      solutionEntities,
    }: {
      id: bigint;
      closed: boolean;
      publicVoters: boolean;
      multipleChoice: boolean;
      quiz: boolean;
      question: string;
      questionEntities: Array<Entities>;
      options: Array<PollOption | undefined>;
      min: boolean;
      totalVoters: number;
      recentVoters: any;
      closePeriod?: number;
      closeDate?: Date;
      solution?: string;
      solutionEntities?: Array<Entities>;
    },
    client: Snake,
  ) {
    super(client);
    this.id = id;
    this.closed = closed;
    this.publicVoters = publicVoters;
    this.multipleChoice = multipleChoice;
    this.quiz = quiz;
    this.question = question;
    this.questionEntities = questionEntities;
    this.options = options;
    this.closePeriod = closePeriod;
    this.closeDate = closeDate;
    this.min = min;
    this.totalVoters = totalVoters;
    this.recentVoters = recentVoters;
    this.solution = solution;
    this.solutionEntities = solutionEntities;
  }
  static parse(client: Snake, poll: Raw.MessageMediaPoll | Raw.UpdateMessagePoll) {
    if (poll.poll) {
      return new Poll(
        {
          id: poll.poll.id,
          closed: poll.poll.closed ?? false,
          publicVoters: poll.poll.publicVoters ?? false,
          multipleChoice: poll.poll.multipleChoice ?? false,
          quiz: poll.poll.quiz ?? false,
          question: poll.poll.question.text,
          questionEntities: Parser.fromRaw(poll.poll.question.entities ?? []),
          options: poll.poll.answers.map((element, index) => {
            if (poll.results?.results) {
              const results = poll.results.results[index];
              if (element && results) {
                return new PollOption(
                  {
                    text: element.text.text,
                    chosen: results.chosen ?? false,
                    correct: results.correct ?? false,
                    voters: results.voters ?? 0,
                    option: element.option.toString('utf8'),
                    entities: Parser.fromRaw(element.text.entities ?? []),
                  },
                  client,
                );
              }
            }
          }),
          closePeriod: poll.poll.closePeriod ?? undefined,
          closeDate: poll.poll.closeDate ? new Date(poll.poll.closeDate * 1000) : undefined,
          min: poll.results.min ?? false,
          totalVoters: poll.results.totalVoters ?? 0,
          recentVoters: poll.results.recentVoters,
          solution: poll.results.solution,
          solutionEntities: Parser.fromRaw(poll.results.solutionEntities ?? []),
        },
        client,
      );
    }
    return undefined;
  }
}
