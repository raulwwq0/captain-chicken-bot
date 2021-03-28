"use strict";

// Load the tts module
const googleTTS = require("google-tts-api");

// Create the controller
const controller = {
  // This method take a text from the message and allow the bot to say the text
  TTS(client, message, args) {
    // Catch the text
    let text = args.join("");

    // Use Google TTS api to get an url from Google Translate
    const url = googleTTS.getAudioUrl(text, {
      lang: "es-ES",
      slow: false,
      host: "https://translate.google.com",
    });

    // Create the broadcast to tell the message
    const broadcast = client.voice.createBroadcast();

    // Get the channel where the bot is going to speak
    var channelId = message.member.voice.channelID;
    var channel = client.channels.cache.get(channelId);

    // Join the channel
    channel.join().then((connection) => {
      // Get the message from the Google Translate url
      broadcast.play(url);
      // Say the message which is in the broadcast
      connection.play(broadcast);
    });
  },
};

// Export the controller
module.exports = controller;
