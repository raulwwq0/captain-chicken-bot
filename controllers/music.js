"use strict";

// Import modules and models
const ytdl = require("ytdl-core");
const queueContruct = require("../models/music");
const song = require("../models/music");

// Create a queue
const queue = new Map();

const controller = {
  // Set the queue of the server
  serverQueue(message) {
    return queue.get(message.guild.id);
  },

  // This method prepare the bot to play music
  async prepareBot(message, serverQueue, args) {
    // Tell the bot to what voice channel he need to go
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.channel.send(
        "Vete a un canal de voz para escuchar música..."
      );

    // Look for necessary permissions he need to play music and join a voice channel
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return message.channel.send(
        "Necesito permisos para hablar y unirme a un canal de voz"
      );
    }

    // Get information of the song through the URL
    const songInfo = await ytdl.getInfo(args);
    song.title = songInfo.videoDetails.title;
    song.url = songInfo.videoDetails.video_url;

    /* 
        Look if there is other song in the queue: 
         - No other song: create a new queue
         - Other song: add the new song after the existing one in the queue
    */

    if (!serverQueue) {
      // Fill the new queue model with data from the server
      queueContruct.textChannel = message.channel;
      queueContruct.voiceChannel = voiceChannel;

      // Set the queue as active
      queue.set(message.guild.id, queueContruct);

      // Add new info to songs queue
      queueContruct.songs.push(song);

      // Try to play the queue, catch possible errors
      try {
        // Conect to the voice channel
        var connection = await voiceChannel.join();
        queueContruct.connection = connection;

        // Call the method to play the queue
        this.play(message.guild, queueContruct.songs[0]);
      } catch (err) {
        // Show error in console
        console.log(err);
        // Delete the queue
        queue.delete(message.guild.id);
        // Send error message
        return message.channel.send(err);
      }
    } else {
      // Add the new song to the existing queue
      serverQueue.songs.push(song);
      // Send a message to confirm
      return message.channel.send(
        `${song.title} se añadió a la lista de reproducción`
      );
    }
  },

  // This method play the songs in the queue
  play(guild, song) {
      // Get the queue
    const serverQueue = queue.get(guild.id);
    // Delete the existing queue if there are no songs
    if (!song) {
      serverQueue.voiceChannel.leave();
      queue.delete(guild.id);
      return;
    }

    // Dispatcher plays the song from the URL
    const dispatcher = serverQueue.connection
        // Plays the song from the URL
      .play(ytdl(song.url))
      // When song is over, skip to the next song
      .on("finish", () => {
        serverQueue.songs.shift();
        this.play(guild, serverQueue.songs[0]);
      })
      // Catch a possible error an it in the console
      .on("error", (error) => console.error(error));
    // Set volume
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    // Send a message to confirm what it the song is playing now
    serverQueue.textChannel.send(`Está sonando: **${song.title}**`);
  },

/*
The skip and stop method are quite similar:

Both show messages when the user is not in a voice channel or
the are no songs in the queue. Then both methods skip the actual 
song.

The only difference is that the stop method clear the queue before
skipping the song. Due to there are no song in the queue, it stops.
*/

  skip(message, serverQueue) {
    if (!message.member.voice.channel)
      return message.channel.send(
        "Tienes que estar en el canal de voz para saltar la canción"
      );
    if (!serverQueue)
      return message.channel.send(
        "No puedo saltar la canción si no hay canciones para saltar..."
      );
    serverQueue.connection.dispatcher.end();
  },

  stop(message, serverQueue) {
    if (!message.member.voice.channel)
      return message.channel.send(
        "Tienes que estar en el canal de voz para detener la canción"
      );

    if (!serverQueue)
      return message.channel.send(
        "No puedo detener la canción si no hay canciones para detener..."
      );

    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
  },
};

// Export controller to use it in index.js
module.exports = controller;
