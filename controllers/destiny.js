"use strict";

// Load modules, configs and models
const fetch = require("node-fetch");
const { bungie_api, bungie_api_key } = require("../config");
const embed = require("../models/destiny");

// Set the controller
const controller = {
  async getInfo(message, args) {
    var search = args.join(" ");
    console.log(`Searching: ${search}`)

    // Petitions to the bungie api
    var items_json = await fetch(
      `${bungie_api}/common/destiny2_content/json/es/DestinyInventoryItemDefinition-a1065791-e29c-4e23-9dc7-d88310a12936.json`,
      {
        headers: {
          "X-API-Key": bungie_api_key,
        },
      }
    );

    var stats_json = await fetch(
      `${bungie_api}/common/destiny2_content/json/es/DestinyStatDefinition-a1065791-e29c-4e23-9dc7-d88310a12936.json`,
      {
        headers: {
          "X-API-Key": bungie_api_key,
        },
      }
    );

    var plugs_json = await fetch(
      `${bungie_api}/common/destiny2_content/json/es/DestinyPlugSetDefinition-a1065791-e29c-4e23-9dc7-d88310a12936.json`,
      {
        headers: {
          "X-API-Key": bungie_api_key,
        },
      }
    );

    var items = await items_json.json();
    var stats = await stats_json.json();
    var plugs = await plugs_json.json()
    // End of petitions

    // Getting item
    for (let item in items) {
      var item_searched = items[item];
      if (
        item_searched.displayProperties.name.toLowerCase() ===
          search.toLowerCase() &&
        item_searched.traitIds
      ) {
        if (
          item_searched.traitIds.includes("item_type.weapon") ||
          item_searched.traitIds.includes("item_type.armor")
        ) {
          // Filters to avoid unuseful messages

          // Filter for 404 entrance in light.gg
          var filter_404 = await fetch(`https://www.light.gg/db/es/items/${item_searched.hash}`)
          if(filter_404.status !== 200) {
            console.log("Error 404 filter triggered");
            continue
          };
          

          // Filter for armor with Version 1 stats
          var version_1_filter = false;
          if(item_searched.traitIds.includes("item_type.armor")){
            for(let investmentStat in item_searched.investmentStats){
              if(item_searched.investmentStats[investmentStat].value === 10 || item_searched.investmentStats[investmentStat].value === 20){
                console.log("Version 1 filter triggered");
                version_1_filter = true};
            }
            if(version_1_filter) continue;
          }
          // End filters section

          console.log("GOT IT!!! Processing messages...");

          // Item stats
          var stats_list = [];

          for (let stat in stats) {
            for (let item_stat in item_searched.stats.stats) {
              if (
                stats[stat].hash === item_searched.stats.stats[item_stat].statHash
              ) {
                if (stats[stat].displayProperties.name && item_searched.stats.stats[item_stat].value && item_searched.stats.stats[item_stat].value !== 0){
                  stats_list.push(`${stats[stat].displayProperties.name}: ${item_searched.stats.stats[item_stat].value} \n`);
                }
              }
            }
          }
          // End item stats

          // First message, with most of the info (except random perks)
          embed.title = item_searched.displayProperties.name;
          embed.url = `https://www.light.gg/db/es/items/${item_searched.hash}`;
          embed.thumbnail.url = `${bungie_api}${item_searched.displayProperties.icon}`;
          embed.image.url = `${bungie_api}${item_searched.screenshot}`;
          embed.footer.text = `HASH: ${item_searched.hash}`;

          if(item_searched.traitIds.includes("item_type.weapon")){
            embed.description = `*${item_searched.flavorText}*
          
            **Categoría:** ${item_searched.inventory.tierTypeName}

            __**Estadísticas:**__
            ${stats_list.join(' ')}

            __**Imagen del Item:**__`;
          }

          if(item_searched.traitIds.includes("item_type.armor")){
            embed.description = `*${item_searched.flavorText}*
          
            **Categoría:** ${item_searched.inventory.tierTypeName}`;
            embed.fields = [];
          }

          if(item_searched.inventory.tierTypeName === 'Excepcional'){
            embed.color = "#ceae33";
          }

          if(item_searched.inventory.tierTypeName === 'Leyenda'){
            embed.color = "#522f65";
          }

          if(item_searched.inventory.tierTypeName === 'Peculiar'){
            embed.color = "#5076a3";
          }

          if(item_searched.inventory.tierTypeName === 'Poco común'){
            embed.color = "#366f42";
          }

          if(item_searched.inventory.tierTypeName === 'Común'){
            embed.color = "#c3bcb4";
          }

          message.channel.send({ embed: embed });
          // End of the first message

          // Getting random perks of the item if it is possible
          if(item_searched.traitIds.includes("item_type.weapon")){
            var socket_entries = item_searched.sockets.socketEntries;

            var curated_roll_list = [];
            var random_perks_list = [];
            var cnt = 0;
  
            for (let socket in socket_entries){
              
              var plug_perk_hash = plugs[socket_entries[socket].randomizedPlugSetHash];
  
              if(plug_perk_hash){
                for(let plug_perk_item in plug_perk_hash.reusablePlugItems){
                  var random_perk_hash = plug_perk_hash.reusablePlugItems[plug_perk_item].plugItemHash;
  
                  random_perks_list.push(`\n**${items[random_perk_hash].displayProperties.name}**:\n${items[random_perk_hash].displayProperties.description} \n`);
                }
              }
              
              // Next messages, one per group of perks
              if(random_perks_list.length !== 0) {
                embed.author = null;
                embed.title = `Perks aleatorias para el Hueco n°${cnt}`;
                embed.url = null;
                embed.thumbnail.url = null;
                embed.image.url = null;
                embed.footer.text = null;
                embed.description = `${random_perks_list.join(' ')}`;
                message.channel.send({embed: embed});
              };
  
              random_perks_list = [];
              cnt++;

              // Curated Rolls
              if(socket_entries[socket].singleInitialItemHash !== 0){
                var socket_hash = socket_entries[socket].singleInitialItemHash;
                curated_roll_list.push(`\n**${items[socket_hash].displayProperties.name}**:\n${items[socket_hash].displayProperties.description} \n`);
              }              
            }

            for(let i = 0; i < 3; i++) curated_roll_list.pop();

            if(curated_roll_list.length !== 0) {
              embed.author = null;
              if(item_searched.inventory.tierTypeName === 'Excepcional'){
                embed.title = `Perks Fijas:`;
              } else {
                embed.title = `Drop Especial de Bungie (Fijo):`;
              }
              embed.url = null;
              embed.thumbnail.url = null;
              embed.image.url = null;
              embed.footer.text = null;
              embed.description = `${curated_roll_list.join(' ')}`;
              message.channel.send({embed: embed});
            };

          } // End of getting random perks          
        }
      }
    }
    // End
    console.log("Finish!");
  },
};

// Export controller to use it in index.js
module.exports = controller;
