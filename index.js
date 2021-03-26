"use strict";

// Console log when bot is ready
console.log("Bot ready");

// Load modules, confings and controllers
const Discord = require("discord.js");
const { token, prefix } = require("./config");
const HelpController = require("./controllers/help");
const MusicController = require("./controllers/music");
const CrackWatchController = require("./controllers/crackwatch");

// Create the client and add the prefix to call the bot
const client = new Discord.Client();

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

  // Call the queue of the server to store the YouTube link of the songs
  const serverQueue = MusicController.serverQueue(message);

  // This command connect the bot to the voice channel and start playing the song from the URL
  if (command === "play") {
    MusicController.prepareBot(message, serverQueue, args);
  }

  // This command skip to the following song in the queue
  if (command === "skip") {
    MusicController.skip(message, serverQueue);
  }

  // This command stop playing song and disconnect the bot from the voice channel
  if (command === "stop") {
    MusicController.stop(message, serverQueue);
  }

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
});

client.login(token);
