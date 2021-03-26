'use strict';

// Console log when bot is ready
console.log("Bot ready");

// Load modules, confings and controllers
const Discord = require("discord.js");
const {token} = require("./config");
const CrackWatchController = require("./controllers/crackwatch");

// Create the client and add the prefix to call the bot
const client = new Discord.Client();
const prefix = "}";

// Catch message and handle a response
client.on("message", function (message) {

    // Avoid messages from other bots and check prefix
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    // Prepare command to execute
    const commandBody = message.content.slice(prefix.length); //Delete the prefix
    const args = commandBody.split(' '); // Divide the command in modules
    const command = args.shift().toLowerCase(); // Format the command

    // COMMANDS ------------------------------------------------------------------------

    // Lantency
    if (command === "ping"){
        const timeTaken = Date.now() - message.createdTimestamp;
        message.reply(`¡Pong! La latencia con el servidor es de ${timeTaken}ms.`);
    }

    // Search a game in CrackWatch
    if (command === "crackwatch"){
        // If there are no args when crackwatch command is called, send a message
        if (!args.length) return message.reply('como se nota que tu numero de cromosomas no es el adecuado: Tienes que indicar el juego que quieres buscar después de " }crackwatch "');

        // Use the controller method "getSlugFromArgs"
        const search = CrackWatchController.getSlugFromArgs(message, args);

        // Use the controller method "getGame"
        CrackWatchController.getGame(message, search).then(answer => message.channel.send(answer));
    }
});

client.login(token);