'use strict';

const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    token: process.env.DISCORD_TOKEN,
    prefix: '}',
    crackwatch_api: "https://api.crackwatch.com/api/games"
};