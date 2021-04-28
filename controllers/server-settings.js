const mongo = require("../mongo");
const serverSchema = require("../models/server-schema");

const controller = {
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
    var channel_id = 0;

    await mongo().then(async (mongoose) => {
      try {
        console.log('Connected to MongoDB!!!');

        for (const guild of client.guilds.cache) {
          const result = await serverSchema.findOne({ _id: guild[1].id });
          if(result !== null) {
            channel_id = result.destiny.xurChannelId;
              console.log(`Current Xur Messages channel: ${channel_id}`);
            };
        }
      } finally {
        console.log('Disconnected to MongoDB!!!');
        mongoose.connection.close();
      }
    });

    return channel_id;
  },
};

// Export controller to use it in index.js
module.exports = controller;
