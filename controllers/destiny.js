"use strict";

// Load modules, configs and models
const fetch = require("node-fetch");
const { bungie_api, bungie_api_key } = require("../config");
const embed = require("../models/destiny");

// Set the controller
const controller = {
  async getInfo(message, args, lang) {
    var search = args.join(" ");
    var got_it = false;
    console.log(`Searching: ${search}`)

    // Petitions to the bungie api
    var items_json = await fetch(
      `${bungie_api}/common/destiny2_content/json/${lang}/DestinyInventoryItemDefinition-a1065791-e29c-4e23-9dc7-d88310a12936.json`,
      {
        headers: {
          "X-API-Key": bungie_api_key,
        },
      }
    );

    var stats_json = await fetch(
      `${bungie_api}/common/destiny2_content/json/${lang}/DestinyStatDefinition-a1065791-e29c-4e23-9dc7-d88310a12936.json`,
      {
        headers: {
          "X-API-Key": bungie_api_key,
        },
      }
    );

    var plugs_json = await fetch(
      `${bungie_api}/common/destiny2_content/json/${lang}/DestinyPlugSetDefinition-a1065791-e29c-4e23-9dc7-d88310a12936.json`,
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
          var filter_404 = await fetch(`https://www.light.gg/db/${lang}/items/${item_searched.hash}`)
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
          got_it = true;

          // Item stats
          var stats_list = [];

          this.itemStats(item_searched, stats, stats_list);
          // End item stats

          // First message, with most of the info (except random perks)
          embed.title = item_searched.displayProperties.name;
          embed.url = `https://www.light.gg/db/${lang}/items/${item_searched.hash}`;
          embed.thumbnail.url = `${bungie_api}${item_searched.displayProperties.icon}`;
          embed.image.url = `${bungie_api}${item_searched.screenshot}`;
          embed.footer.text = `HASH: ${item_searched.hash}`;

          if(item_searched.traitIds.includes("item_type.weapon")){
            if(lang === 'es'){
              embed.description = `*${item_searched.flavorText}*
          
              **Categoría:** ${item_searched.inventory.tierTypeName}
  
              __**Estadísticas:**__
              ${stats_list.join(' ')}
  
              __**Imagen del Item:**__`;
            }

            if(lang === 'en'){
              embed.description = `*${item_searched.flavorText}*
          
              **Category:** ${item_searched.inventory.tierTypeName}
  
              __**Stats:**__
              ${stats_list.join(' ')}
  
              __**Item Screenshot:**__`;
            }
          }

          if(item_searched.traitIds.includes("item_type.armor")){
            if(lang === 'es'){
              embed.description = `*${item_searched.flavorText}*
          
              **Categoría:** ${item_searched.inventory.tierTypeName}`;
            }

            if(lang === 'en'){
              embed.description = `*${item_searched.flavorText}*
          
              **Category:** ${item_searched.inventory.tierTypeName}`;
            }

            embed.fields = [];
          }

          switch (item_searched.inventory.tierTypeName) {
            case 'Excepcional':
            case 'Exotic':
              embed.color = "#ceae33";
              break;
            case 'Leyenda':
            case 'Legendary':
              embed.color = "#522f65";
              break;
            case 'Peculiar':
            case 'Rare':
              embed.color = "#5076a3";
              break;
            case 'Poco común':
            case 'Common':
              embed.color = "#366f42";
              break;
            case 'Común':
            case 'Basic':
              embed.color = "#c3bcb4";
              break;
            default:
              embed.color = "#000000";
              break;
          }

          message.channel.send({ embed: embed });
          // End of the first message

          // Getting random perks of the item if it is possible
          if(item_searched.traitIds.includes("item_type.weapon") || (item_searched.traitIds.includes("item_type.armor") && item_searched.inventory.tierTypeName === 'Excepcional' || item_searched.inventory.tierTypeName === 'Exotic')){
            var socket_entries = item_searched.sockets.socketEntries;

            var curated_roll_list = [];
            var random_perks_list = [];
            var cnt = 0;
  
            for (let socket in socket_entries){
              
              var plug_perk_hash = plugs[socket_entries[socket].randomizedPlugSetHash];
  
              if(item_searched.traitIds.includes("item_type.weapon")) this.getRandomPerks(items, plug_perk_hash, random_perks_list);
              
              // Next messages, one per group of perks
              if(random_perks_list.length !== 0) {
                embed.author = null;
                if(lang === 'es') embed.title = `Perks aleatorias para el Hueco n°${cnt}`;
                if(lang === 'en') embed.title = `Random perks for Socket n°${cnt}`;
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
             this.getCuratedRoll(items, curated_roll_list, socket_entries, socket);
            }

            // Deleting last 3 entries, which are not perks

            if(item_searched.traitIds.includes("item_type.weapon")) for(let i = 0; i < 3; i++) curated_roll_list.pop();
            if(item_searched.traitIds.includes("item_type.armor")) {
              var special_armor_perk = curated_roll_list.pop();
              curated_roll_list = [special_armor_perk];
            };

            //Last message for curated roll
            if(curated_roll_list.length !== 0) {
              embed.author = null;
              if(item_searched.inventory.tierTypeName === 'Excepcional' || item_searched.inventory.tierTypeName === 'Exotic'){
                if(item_searched.traitIds.includes("item_type.armor")) {
                  if(lang === 'es') embed.title = `Perk Fija:`;
                  if(lang === 'en') embed.title = `Signature Perk:`
                }

                if(item_searched.traitIds.includes("item_type.weapon")) {
                  if(lang === 'es') embed.title = `Perks Fijas:`;
                  if(lang === 'en') embed.title = `Signature Perks:`
                }
              } else {
                if(lang === 'es') embed.title = `Drop Especial de Bungie (Siempre igual):`;
                if(lang === 'en') embed.title = `Bungie's Curated Roll (Always the same):`
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
    if(!got_it){
      var not_found = '';
      if(lang === 'es') not_found = `no he encontrado nada relacionado con **${search}**. Escribe el nombre lo más exacto posible.`;
      if(lang === 'en') not_found = `I couldn't find anything related to **${search}**. Write the name as accurate as possible.`;
      message.reply(not_found);
    }
    // End
    console.log("Finish!");
  },

  itemStats(item, stats, list){
    for (let stat in stats) {
      for (let item_stat in item.stats.stats) {
        if (
          stats[stat].hash === item.stats.stats[item_stat].statHash
        ) {
          if (stats[stat].displayProperties.name && item.stats.stats[item_stat].value && item.stats.stats[item_stat].value !== 0){
            list.push(`${stats[stat].displayProperties.name}: ${item.stats.stats[item_stat].value} \n`);
          }
        }
      }
    }
  },

  getRandomPerks(items, hash, list){
    if(hash){
      for(let item in hash.reusablePlugItems){
        var random_perk_hash = hash.reusablePlugItems[item].plugItemHash;

        list.push(`\n**${items[random_perk_hash].displayProperties.name}**:\n${items[random_perk_hash].displayProperties.description} \n`);
      }
    }
  },

  getCuratedRoll(items, list, socket_entries, socket){
    if(socket_entries[socket].singleInitialItemHash !== 0){
      var socket_hash = socket_entries[socket].singleInitialItemHash;
      list.push(`\n**${items[socket_hash].displayProperties.name}**:\n${items[socket_hash].displayProperties.description} \n`);
    } 
  }
};

// Export controller to use it in index.js
module.exports = controller;
