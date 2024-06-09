/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2024 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { TLObject } from '../../TL.ts';
import { Raw } from '../../../platform.deno.ts';
import type { Snake } from '../../../Client/index.ts';

// https://core.telegram.org/bots/api#location
export class Location extends TLObject {
  _accessHash!: bigint;
  longitude!: number;
  latitude!: number;
  horizontalAccuracy!: number;
  constructor(
    {
      accessHash,
      longitude,
      latitude,
      horizontalAccuracy,
    }: {
      accessHash: bigint;
      longitude: number;
      latitude: number;
      horizontalAccuracy: number;
    },
    client: Snake,
  ) {
    super(client);
    this._accessHash = accessHash;
    this.longitude = longitude;
    this.latitude = latitude;
    this.horizontalAccuracy = horizontalAccuracy;
  }
  static parse(client: Snake, location: Raw.TypeGeoPoint) {
    if (location instanceof Raw.GeoPointEmpty) {
      location as Raw.GeoPointEmpty;
      return new Location(
        {
          accessHash: BigInt(0),
          longitude: 0,
          latitude: 0,
          horizontalAccuracy: 0,
        },
        client,
      );
    }
    location as Raw.GeoPoint;
    return new Location(
      {
        accessHash: location.accessHash,
        longitude: location.long,
        latitude: location.lat,
        horizontalAccuracy: location.accuracyRadius ?? 0,
      },
      client,
    );
  }
}
// https://core.telegram.org/bots/api#venue
export class Venue extends TLObject {
  location!: Location;
  title!: string;
  address!: string;
  foursquareId!: string;
  foursquareType!: string;
  provider!: string;
  constructor(
    {
      location,
      title,
      address,
      foursquareId,
      foursquareType,
      provider,
    }: {
      location: Location;
      title: string;
      address: string;
      foursquareId: string;
      foursquareType: string;
      provider: string;
    },
    client: Snake,
  ) {
    super(client);
    this.location = location;
    this.title = title;
    this.address = address;
    this.foursquareId = foursquareId;
    this.foursquareType = foursquareType;
    this.provider = provider;
  }
  static parse(client: Snake, venue: Raw.MessageMediaVenue) {
    return new Venue(
      {
        location: Location.parse(client, venue.geo),
        title: venue.title,
        address: venue.address,
        foursquareId: venue.venueId,
        foursquareType: venue.venueType,
        provider: venue.provider,
      },
      client,
    );
  }
}
