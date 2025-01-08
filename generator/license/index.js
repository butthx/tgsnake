/**
 * tgsnake - Telegram MTProto framework for nodejs.
 * Copyright (C) 2025 butthx <https://github.com/butthx>
 *
 * THIS FILE IS PART OF TGSNAKE
 *
 * tgsnake is a free software : you can redistribute it and/or modify
 * it under the terms of the MIT License as published.
 */
const fs = require('fs');
const path = require('path');
const cdateRE = /(\* )?Copyright \(C\) (\d+)/im;

function parseDate(source) {
  if (cdateRE.test(source)) {
    let [full, slash, date] = source.trim().match(cdateRE);
    if (Number(date) !== new Date().getFullYear()) {
      return { change: true, results: source.replace(date, new Date().getFullYear()) };
    }
    return { change: false, results: source };
  }
  return { change: false, results: source };
}

function start(route) {
  let dir = fs.readdirSync(route);
  for (let file of dir) {
    let info = fs.lstatSync(path.join(route, file));
    if (info.isDirectory()) {
      start(path.join(route, file));
    } else if (info.isFile()) {
      const content = fs.readFileSync(path.join(route, file), 'utf8');
      const parsing = parseDate(content);
      if (parsing.change) {
        fs.writeFileSync(path.join(route, file), parsing.results);
      }
    }
  }
}
console.log(
  "--- WARNING!! ---\n\nTHIS ACTION WILL BE CHANGE COPYRIGHT YEAR IN ALL FILE.\nTHIS ACTION CAN'T BE CANCELLED!\n\n--- build:license ---",
);
start(process.cwd());
