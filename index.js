console.log("Bot ready");
const Discord = require("discord.js");
const {token, crackwatch_api} = require("./config");
const fetch = require("node-fetch");
const querystring = require("querystring");

const client = new Discord.Client();
const prefix = "}";

client.on("message", function (message) {
    // Avoid messages from other bots and check prefix
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    // Prepare command to execute
    const commandBody = message.content.slice(prefix.length); //Delete the prefix
    const args = commandBody.split(' '); // Divide the command in modules
    const command = args.shift().toLowerCase(); // Format the command

    // FUNCTIONS -------------------------------------------------------

    function queryArgs(){

        var query = querystring.stringify({search: args.join(' ')});
        for(var i = 0; i < query.length; i++) {
            query = query.toLowerCase().replace('%20', '-');
            query = query.toLowerCase().replace("'", '-');
            query = query.toLowerCase().replace('%3a', '');
        }
        query = query.replace('search=', '');
        console.log(query);
        return query;
    }

    async function crackWatch(search) {
        message.channel.send("Estoy buscando el juego. Esto puede tardar un rato, tengo que buscar entre casi 20.000 juegos...");
        var page = 0;
        do {
            console.log(`Page: ${page}`);
            var fet = await fetch(`${crackwatch_api}?page=${page}`);
            page++;
            var response = await fet.json();
            console.log(`Number of games in this page: ${response.length}`);
            for (var element in response) {
                if (response[element].slug == search) {
                    if(response[element].crackDate){
                        console.log(`${response[element].title} was cracked!!!`);

                        const embedMessage = new Discord.MessageEmbed()
                                .setColor('#1cbd00')
                                .setTitle(response[element].title)
                                .setURL(response[element].url)
                                .setThumbnail(response[element].imagePoster)
                                .setDescription('¡¡¡Está pirata!!!')
                        return embedMessage;
                    } else{
                        console.log(`${response[element].title} wasn't cracked yet`);
                        const embedMessage = new Discord.MessageEmbed()
                                .setColor('#de1200')
                                .setTitle(response[element].title)
                                .setURL(response[element].url)
                                .setThumbnail(response[element].imagePoster)
                                .setDescription('No está pirata...')
                        return embedMessage;
                    }                    
                } 
            }
        } while (response.length == 30);

        if (!response[element].slug == search) {
            return `
            No he encontrado "${search}" en CrackWatch, lo que da lugar a varias posibilidades:
            1. El juego no existe
            2. El juego no está en Crackwatch
            3. Eres pendejo y no sabes escribir el nombre del juego
            `
        }
    }

    // COMMANDS -------------------------------------------------------

    // Lantency
    if (command === "ping"){
        const timeTaken = Date.now() - message.createdTimestamp;
        message.reply(`¡Pong! La latencia con el servidor es de ${timeTaken}ms.`);
    }

    // Search a game in CrackWatch
    if (command === "crackwatch"){
        if (!args.length) return message.reply('como se nota que tu numero de cromosomas no es el adecuado: Tienes que indicar el juego que quieres buscar después de " }crackwatch "');;
        const search = queryArgs();
        crackWatch(search).then(answer => message.channel.send(answer));
    }
});

client.login(token);