"use strict";

// Console log when bot is ready
console.log("Bot ready");

// Load modules, confings and controllers
const Discord = require("discord.js");
const { token, prefix } = require("./config");
const HelpController = require("./controllers/help");
const MusicController = require("./controllers/music");
const TTSController = require("./controllers/tts");
const CrackWatchController = require("./controllers/crackwatch");
const DestinyController = require("./controllers/destiny");

// Create the client and add the prefix to call the bot
const client = new Discord.Client();

// Create the music player

var player = MusicController.createPlayer(client);

// Catch message and handle a response
client.on("message", async (message) => {
  // Avoid messages from the own bot and check prefix
  if (message.author.bot || !message.content.startsWith(prefix)) return;

  // Prepare command to execute
  const commandBody = message.content.slice(prefix.length); //Delete the prefix
  const args = commandBody.split(" "); // Divide the command in modules
  const command = args.shift().toLowerCase(); // Format the command

  // COMMANDS ################################################################################

  // Help ----------------------------------------------------------------------------------
  if (command === "help") {
    HelpController.sendHelp(message);
  }

  // Lantency --------------------------------------------------------------------------------
  if (command === "ping") {
    const timeTaken = Date.now() - message.createdTimestamp;
    message.reply(`¡Pong! La latencia con el servidor es de ${timeTaken}ms.`);
  }

  // Music -----------------------------------------------------------------------------------

  // This command connect the bot to the voice channel and start playing the song from the URL
  if (command === "play") {
    MusicController.playMusic(player, message, args);
  }

  // Allow to play a playlist
  if (command === "playlist") {
    MusicController.playList(player, message, args);
  }

  if (command === "pause") {
    MusicController.pauseSong(player, message);
  }

  if (command === "continue") {
    MusicController.resumeSong(player, message);
  }

  // This command skip to the following song in the queue
  if (command === "skip") {
    MusicController.skipSong(player, message);
  }

  // This command stop playing song and disconnect the bot from the voice channel
  if (command === "stop") {
    MusicController.stopMusic(player, message);
  }

  // Send a message with the name of the current song
  if (command === "song") {
    MusicController.currentSongName(player, message);
  }

  // Show a progress bar and how many time left to end the song
  if (command === "progress") {
    MusicController.progressBar(player, message);
  }

  // Text to Speech ----------------------------------------------------------------------------------------------------------------------------
  if (command === "tts") {
    TTSController.TTS(client, message, args);
  }

  // Destiny ----------------------------------------------------------------------------------------------------------------
  if (command === "destiny") {
    DestinyController.getInfo(message, args);
  }

  /* 
  Crackwatch will be closed for a  few months, so their API doesn't work till then

  // Search a game in CrackWatch ----------------------------------------------------------------
  if (command === "cw") {
    // If there are no args when crackwatch command is called, send a message
    if (!args.length)
      return message.reply(
        'como se nota que tu número de cromosomas no es el adecuado: Tienes que indicar el juego que quieres buscar después de " }cw "'
      );

    // Use the controller method "getSlugFromArgs"
    const search = CrackWatchController.getSlugFromArgs(message, args);

    // Use the controller method "getGame"
    CrackWatchController.getGame(message, search).then((answer) =>
      message.channel.send(answer)
    );
    
  }
  */
});

client.login(token);
