/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2024 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { Raw } from '../../../platform.deno.ts';
import { TLObject } from '../../TL.ts';
import { Animation } from './Animated.ts';
import { Photo } from './Photo.ts';
import type { Snake } from '../../../Client/index.ts';

export class Game extends TLObject {
  id!: bigint;
  shortName!: string;
  title!: string;
  description!: string;
  photo?: Photo;
  animation?: Animation;
  constructor(
    {
      id,
      shortName,
      title,
      description,
      photo,
      animation,
    }: {
      id: bigint;
      shortName: string;
      title: string;
      description: string;
      photo?: Photo;
      animation?: Animation;
    },
    client: Snake,
  ) {
    super(client);
    this.id = id;
    this.shortName = shortName;
    this.title = title;
    this.description = description;
    this.photo = photo;
    this.animation = animation;
  }
  static parse(client: Snake, game: Raw.Game) {
    let photo: Photo | undefined = undefined;
    let animation: Animation | undefined = undefined;
    if (game.photo && game.photo instanceof Raw.Photo) {
      photo = Photo.parse(client, game.photo as Raw.Photo);
    }
    if (game.document && game.document instanceof Raw.Document) {
      if (
        (game.document as Raw.Document).attributes.some(
          (attribute) => attribute instanceof Raw.DocumentAttributeAnimated,
        )
      ) {
        animation = Animation.parse(client, game.document as Raw.Document);
      }
    }
    return new Game(
      {
        photo,
        animation,
        id: game.id,
        shortName: game.shortName,
        title: game.title,
        description: game.description,
      },
      client,
    );
  }
}
