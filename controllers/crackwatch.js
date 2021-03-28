'use strict'

// Load modules, configs and models
const fetch = require("node-fetch");
const querystring = require("querystring");
const { crackwatch_api } = require("../config");
const embed = require("../models/crackwatch");

// Set the controller
const controller = {

    getSlugFromArgs(message, args) {
        // Get the arguments from the command and join them using the empty spaces
        var query = querystring.stringify({ search: args.join(' ') });

        /*
            When you join using spaces, it changes it with '%20'

            With the following loop I change possibles conflicting characters
            with others according to how a game slug looks like
        */
        for (var i = 0; i < query.length; i++) {
            // %20 is the empty space
            query = query.toLowerCase().replace('%20', '-');
            // ' is an apostrophe (ej: Assassin's)
            query = query.toLowerCase().replace("'", '-');
            // %3a is :
            query = query.toLowerCase().replace('%3a', '');
        }

        // Remove the 'search=' at the beginning
        query = query.replace('search=', '');

        // Console log to confirm everything is ok
        console.log(query);

        return query;
    },

    // Set an async method to get games from CrackWatch API
    async getGame(message, search) {
        // Message to confirm the method has been called
        message.channel.send("Estoy buscando el juego. Esto puede tardar un rato, tengo que buscar entre casi 20.000 juegos...");
        embed.counter = 0;
        embed.gameFound = false;
        console.log(embed);
        /* 
            CrackWatch API gives games in pages with 30 games each.
        
            Creating page var allow the method to search in every page        
        */
        var page = 0;
        do {


            // Do a fetch petition to every page due to de do-while loop
            console.log(`Page: ${page}`);
            var petition = await fetch(`${crackwatch_api}?page=${page}`);
            page++;

            // Get the response, which contain and array with 30 objects (games)
            var response = await petition.json();
            console.log(`Number of games in this page: ${response.length}`);

            // Look in every array element exist the game
            for (var element in response) {

                // Search games by slug is easier due to the words are splitting by -
                if (response[element].slug === search || response[element].slug.includes(search)) {

                    // If the game has a crack date means that was cracked
                    if (response[element].crackDate) {
                        console.log(`${response[element].title} was cracked!!!`);

                        // Here we fill the model data    
                        embed.color = '#1cbd00';
                        embed.title = response[element].title;
                        embed.url = response[element].url;
                        embed.thumbnail.url = response[element].imagePoster;
                        embed.description = '¡¡¡Está pirata!!!';
                        embed.gameFound = true;
                        embed.counter++;
                    }

                    // If the game hasn't a crack date means that wasn't cracked or it was unreleased
                    if (!response[element].crackDate) {
                        console.log(`${response[element].title} wasn't cracked yet`);

                        // Here we fill the model data    
                        embed.color = '#ff1100';
                        embed.title = response[element].title;
                        embed.url = response[element].url;
                        embed.thumbnail.url = response[element].imagePoster;
                        embed.description = 'No está pirata...';
                        embed.gameFound = true;
                        embed.counter++;
                    }

                    // Send the model data as a message to the channel
                    message.channel.send({ embed: embed });
                }
            }
        } while (response.length === 30);

        /*
            In case of we couldn't find the game in the previous loop',
            it send a message with the possible options why the game
            wasn't found
        */
        if (!embed.gameFound) {
            console.log(`404: ${search} not found`);

            // Here we fill the model data    
            embed.color = '#000000';
            embed.title = `No he encontrado "${search}" en CrackWatch`;
            embed.url = null;
            embed.thumbnail.url = null;
            embed.description = `
                Lo que da lugar a varias posibilidades:

                1. El juego no existe
                2. El juego no está en Crackwatch
                3. Eres pendejo y no sabes escribir el nombre del juego
            `;

            // Send the model data as a message to the channel
            return message.reply({ embed: embed });
        }

        return message.reply(`he encontrado ${embed.counter} juegos que incluyen ${search} en sus títulos`);
    }
}

// Export controller to use it in index.js
module.exports = controller;
