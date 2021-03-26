"use strict";

const queueContruct = {
  textChannel: String,
  voiceChannel: String,
  connection: null,
  songs: [],
  volume: 10,
  playing: true,
};

const song = {
    title: String,
    url: String,
};

module.exports = queueContruct, song;
