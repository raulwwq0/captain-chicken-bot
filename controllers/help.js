"use strict";

// Load the help model
const help = require("../models/help");

const controller = {
  // Fill the help model with useful information about commands
  sendHelp(message) {
    help.color = "#ff00bb";
    help.title = "¿Alguien necesita ayuda?";
    help.description = `
        Para llamar a Capitán Chicken necesitas usar la __Chicken Señal__ (también conocido como prefijo), que es \` } \`
    
        Esta es la lista de todos los comandos:
        `;
    help.fields[0].name = "` }help `";
    help.fields[0].value = "Muestra todos los comandos disponibles";
    help.fields[1].name = '` }play + "URL de YouTube" `';
    help.fields[1].value =
      "El bot entra en el canal de voz donde se encuentra el usuario que ejecuta el comando y reproduce la canción del enlace proporcionado";
    help.fields[2].name = "` }skip `";
    help.fields[2].value =
      "Salta la canción actual y reproduce la siguiente (si es que hay...)";
    help.fields[3].name = "` }stop `";
    help.fields[3].value = "Para la música y se desconecta del canal de voz";
    help.fields[4].name = '` }cw + "nombre de un juego" `';
    help.fields[4].value = `Busca en __CrackWatch__ el estado de un juego. Puede tardar hasta **2 minutos** en realizar una busqueda ya que solo puede acceder a 30 juegos a la vez (va de 30 en 30 y hay casi 20.000 juegos registrados)

        Para evitar posibles errores hay que poner el **nombre del juego lo más exacto posible** (sobre todo este signo \`'\`)

        ***¡ADVERTENCIA!***  Puede enviar muchos mensajes seguidos...`;

    return message.channel.send({ embed: help });
  },
};

module.exports = controller;
