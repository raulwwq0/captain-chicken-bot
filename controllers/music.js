"use strict";

const { Player } = require("discord-music-player");

const controller = {

  // This method create then new player with his options
  createPlayer(client) {
    const player = new Player(client, {
      leaveOnEnd: true, // Leave the voice channel when there is no more songs
      leaveOnStop: true, // Leave the voice channel when music stops
      leaveOnEmpty: true, // Leave the voice channel when the queue is empty
      timeout: 0, // Set how many time take the bot to leave the voice channel
      volume: 100, // Set the volume
      quality: "high", // Sound quality
    });

    // Player send messages on these events
    player
      .on("songAdd", (message, queue, song) =>
        message.channel.send(`Se añadió **${song.name}** a la lista`)
      )
      .on("songFirst", (message, song) =>
        message.channel.send(`Está sonando: **${song.name}**`)
      )
      .on("playlistAdd", (message, queue, playlist) =>
        message.channel.send(
          `Se añadió a la lista la playlist **${playlist.name}**, que tiene **${playlist.videoCount}** canciones`
        )
      );

    return player;
  },

  // This method allow the bot to play a song or store it in the queue
  async playMusic(player, message, args) {

    // If there is another song, the next one will be added to the queue
    if (player.isPlaying(message)) {
      let song = await player.addToQueue(message, args.join(" "));

      // If there were no errors the songAdd event will fire and the song will not be null.
      if (song) console.log(`Se añadió **${song.name}** a la lista`);
      return;

    // Else the song will be played at the moment
    } else {
      let song = await player.play(message, args.join(" "));

      // If there were no errors the songAdd event will fire and the song will not be null.
      if (song) console.log(`Empieza a sonar **${song.name}**`);
      return;
    };
  },

  // Same as the previous method, but with playlist
  async playList(player, message, args) {
    await player.playlist(message, {
      search: args.join(" "),
      maxSongs: -1, // These line is the max number of songs a playlist can have (-1 = infinite)
    });
  },

  // Allow the user to pause a song to continue later
  pauseSong(player, message) {
    let song = player.pause(message);
    if(song) 
        message.channel.send(`**${song.name}** en pausa`);
  },

  // Exit the pause state an resume the song
  resumeSong(player, message) {
    let song = player.resume(message);
    if(song)
        message.channel.send(`**${song.name}** vuelve a sonar`);
  },

  // This method allows the user to skip the current song
  skipSong(player, message) {
    let song = player.skip(message);
    if (song) {
      message.channel.send(`Dejamos **${song.name}** y pasamos a la siguiente`); // Message with the song that was skipped
      setTimeout(() => this.currentSongName(player, message), 1000); // Message with the following song
    };    
  },

  // This method allows the user to stop the bot playing music and disconnect him from the channel
  stopMusic(player, message) {
    let finished = player.stop(message);
    if (finished) message.channel.send("Música detenida");
  },

  // This method say the name of the current song
  async currentSongName(player, message) {
    let song = await player.nowPlaying(message);
    if(song)
        message.channel.send(`Está sonando: **${song.name}**`);
  },

  // This method send a message with a little progression bar and how many time left to end the song
  progressBar(player, message) {
    let progressBar = player.createProgressBar(message, {
      size: 30,
      block: "-",
      arrow: "|",
    });
    if (progressBar) message.channel.send(progressBar);
  },
};

// Export the controller
module.exports = controller;
