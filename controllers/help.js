"use strict";

// Load the help model
import help from "../models/help.js";

const controller = {
  // Fill the help model with useful information about commands
  sendHelp(message) {
    help.color = "#ff00bb";
    help.title = "¿Alguien necesita ayuda?";
    help.description = `__Este bot todavía está en fase de desarrollo, por lo que pueden surgir algunos fallos...__

        Para llamar a Capitán Chicken necesitas usar la __Chicken Señal__ (también conocido como prefijo), que es \` } \`
    
        **Esta es la lista de todos los comandos:**
        `;

    help.fields[0].name = "Música";
    help.fields[0].value =`
    \` }play "URL o nombre de la canción" \` \nEl bot entra en el canal de voz donde se encuentra el usuario que ejecuta el comando y reproduce la canción. Soporta enlaces de YouTube, Spotify e incluso busqueda por nombre de la canción
    
    \` }playlist "URL o nombre de la playlist" \` \nIgual que }play pero con una lista de canciones
    
    \` }pause \` \nPausa la canción actual para continuarla más tarde
    
    \` }continue \` \nContinua la canción por donde se pausó
    
    \` }skip \` \nSalta la canción actual y reproduce la siguiente (si es que hay...)
    
    \` }stop \` \nPara la música y se desconecta del canal de voz
    
    \` }song \` \nMuestra el nombre de la canción que está sonando
    
    \` }progress \` \nMuestra una pequeña barra de progreso y el tiempo que lleva sonando la canción

    `;
    help.fields[1].name = "Text To Speech";
    help.fields[1].value = `
    \` }tts \` \nCaptain Chicken dirá lo que escribas después de este comando

    `;
    help.fields[2].name = "Destiny 2";
    help.fields[2].value = `
    \` }destiny "Nombre del item (arma o armadura)" \` \nCaptain Chicken mostrará todo lo relacionado con el arma y armadura que quieres buscar. 
    
    Por defecto busca en español, si quieres usar la búsqueda de items en inglés debes poner -en detras del comando (ej: }destiny-en para inglés, }destiny o }destiny-es para español)

    \` }xur \` \nMuestra la ubicación de Xûr y los objetos que trae

    \` }set-channel "Nombre de un canal de texto" \` \nSelecciona un canal para que Captain Chicken te mande un mensaje avisándote cuando llega Xûr y lo que tiene para ti

    `;
    help.fields[3].name = "Otros";
    help.fields[3].value = `
    \` }help \` \nMuestra todos los comandos disponibles
    
    \` }ping \` \nMuestra la latencia que tiene el bot respecto al servidor
    `;
    

    return message.channel.send({ embed: help });
  },
};

export default controller;
