/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2025 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
import { TLObject } from '../TL.ts';
import { Raw } from '../../platform.deno.ts';
import { User } from '../Advanced/User.ts';
import type { Snake } from '../../Client/index.ts';

// https://core.telegram.org/bots/api#shippingaddress
export interface TypeShippingAddress {
  countryCode: string;
  state: string;
  city: string;
  streetLine1: string;
  streetLine2: string;
  postCode: string;
}
export class ShippingAddress extends TLObject {
  countryCode!: string;
  state!: string;
  city!: string;
  streetLine1!: string;
  streetLine2!: string;
  postCode!: string;
  constructor(
    { countryCode, state, city, streetLine1, streetLine2, postCode }: TypeShippingAddress,
    client: Snake,
  ) {
    super(client);
    this.countryCode = countryCode;
    this.state = state;
    this.city = city;
    this.streetLine1 = streetLine1;
    this.streetLine2 = streetLine2;
    this.postCode = postCode;
  }
  static parse(client: Snake, address: Raw.PostAddress): ShippingAddress {
    return new ShippingAddress(
      {
        countryCode: address.countryIso2,
        state: address.state,
        city: address.city,
        streetLine1: address.streetLine1,
        streetLine2: address.streetLine2,
        postCode: address.postCode,
      },
      client,
    );
  }
}
// https://core.telegram.org/bots/api#labeledprice
export interface TypeLabeledPrice {
  label: string;
  amount: number;
}
// https://core.telegram.org/bots/api#orderinfo
export interface TypeOrderInfo {
  name?: string;
  phoneNumber?: string;
  email?: string;
  shippingAddress?: ShippingAddress;
}
export class OrderInfo extends TLObject {
  name?: string;
  phoneNumber?: string;
  email?: string;
  shippingAddress?: ShippingAddress;
  constructor({ name, phoneNumber, email, shippingAddress }: TypeOrderInfo, client: Snake) {
    super(client);
    this.name = name;
    this.phoneNumber = phoneNumber;
    this.email = email;
    this.shippingAddress = shippingAddress;
  }
  static parse(client: Snake, info: Raw.PaymentRequestedInfo): OrderInfo {
    return new OrderInfo(
      {
        name: info.name,
        phoneNumber: info.phone,
        email: info.email,
        shippingAddress: info.shippingAddress
          ? ShippingAddress.parse(client, info.shippingAddress)
          : undefined,
      },
      client,
    );
  }
}
// https://core.telegram.org/bots/api#shippingoption
export interface TypeShippingOption {
  id: string;
  title: string;
  prices: Array<TypeLabeledPrice>;
}
// https://core.telegram.org/bots/api#successfulpayment
export interface TypeSuccessfulPayment {}
// https://core.telegram.org/bots/api#shippingquery
export interface TypeShippingQuery {
  id: string;
  invoicePayload: string;
  shippingAddress: ShippingAddress;
  from?: User;
}
export class ShippingQuery extends TLObject {
  id!: string;
  invoicePayload!: string;
  shippingAddress!: ShippingAddress;
  from?: User;
  constructor({ id, invoicePayload, shippingAddress, from }: TypeShippingQuery, client: Snake) {
    super(client);
    this.id = id;
    this.invoicePayload = invoicePayload;
    this.shippingAddress = shippingAddress;
    this.from = from;
  }
  static parse(
    client: Snake,
    update: Raw.UpdateBotShippingQuery,
    users: Array<Raw.TypeUser>,
  ): ShippingQuery {
    return new ShippingQuery(
      {
        id: String(update.queryId),
        invoicePayload: update.payload.toString(),
        shippingAddress: ShippingAddress.parse(client, update.shippingAddress),
        from: User.parse(
          client,
          users.find((user) => user.id === update.userId),
        ),
      },
      client,
    );
  }
}
// https://core.telegram.org/bots/api#precheckoutquery
export interface TypePreCheckoutQuery {
  id: string;
  currency: string;
  totalAmount: bigint;
  invoicePayload: string;
  shippingOptionId?: string;
  orderInfo?: OrderInfo;
  from?: User;
}
export class PreCheckoutQuery extends TLObject {
  id!: string;
  currency!: string;
  totalAmount!: bigint;
  invoicePayload!: string;
  shippingOptionId?: string;
  orderInfo?: OrderInfo;
  from?: User;
  constructor(
    {
      id,
      currency,
      totalAmount,
      invoicePayload,
      shippingOptionId,
      orderInfo,
      from,
    }: TypePreCheckoutQuery,
    client: Snake,
  ) {
    super(client);
    this.id = id;
    this.currency = currency;
    this.totalAmount = totalAmount;
    this.invoicePayload = invoicePayload;
    this.shippingOptionId = shippingOptionId;
    this.orderInfo = orderInfo;
    this.from = from;
  }
  static parse(
    client: Snake,
    update: Raw.UpdateBotPrecheckoutQuery,
    users: Array<Raw.TypeUser>,
  ): PreCheckoutQuery {
    return new PreCheckoutQuery(
      {
        id: String(update.queryId),
        currency: update.currency,
        totalAmount: update.totalAmount,
        invoicePayload: update.payload.toString(),
        shippingOptionId: update.shippingOptionId,
        orderInfo: update.info ? OrderInfo.parse(client, update.info) : undefined,
        from: User.parse(
          client,
          users.find((user) => user.id === update.userId),
        ),
      },
      client,
    );
  }
}
