'use strict';

import dotenv from 'dotenv';
dotenv.config();

export const token = process.env.TOKEN;
export const prefix = '}';
export const crackwatch_api = "https://api.crackwatch.com/api/games";
export const bungie_api = "https://www.bungie.net";
export const bungie_api_key = process.env.BUNGIE_API_KEY;
export const mongoPath = process.env.MONGO_PATH;
