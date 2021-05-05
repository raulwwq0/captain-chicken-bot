const fetch = require("node-fetch");
const { bungie_api, bungie_api_key } = require("../config");
const mongo = require("../mongo");
const serverSchema = require("../models/server-schema");

const controller = {
  async getJsonFileNameFromManifest(){
    var manifest_json = await fetch(
      `${bungie_api}/Platform/Destiny2/Manifest`,
      {
        headers: {
          "X-API-Key": bungie_api_key,
        },
      }
    );
    var manifest = await manifest_json.json();
    var json_path = manifest.Response.jsonWorldContentPaths.en;
    var json_file_name = json_path.slice(43);

    return json_file_name;
  },

  async setXurChannel(message, channel) {
    await mongo().then(async (mongoose) => {
      try {
        console.log('Connected to MongoDB!!!');
        await serverSchema.findOneAndUpdate(
          {
            _id: message.guild.id,
          },
          {
            _id: message.guild.id,
            destiny: {
              xurChannelId: channel.id,
            },
          },
          {
            upsert: true,
          }
        );
      } finally {
        console.log(`Channel <${channel.name}> has been set`);
        message.channel.send(
          `A partir de ahora, los avisos de llegada de Xûr serán enviados al canal **# ${channel.name}**`
        );
        console.log('Disconnected to MongoDB!!!');
        mongoose.connection.close();
      }
    });
  },

  async getXurChannel(client) {
    var channels_cache = [];

    await mongo().then(async (mongoose) => {
      try {
        console.log('Connected to MongoDB!!!');

        for (const guild of client.guilds.cache) {
          const result = await serverSchema.findOne({ _id: guild[1].id });
          if(result !== null) {
            channels_cache.push(result.destiny.xurChannelId);
          };
        }
      } finally {
        console.log(`Current Xur Messages channel: ${channels_cache}`);
        console.log('Disconnected to MongoDB!!!');
        mongoose.connection.close();
      }
    });

    return channels_cache;
  },
};

// Export controller to use it in index.js
module.exports = controller;
