"use strict";

// Load modules, configs and models
import fetch from "node-fetch";
const { bungie_api, bungie_api_key } = require("../config");
const embed = require("../models/destiny");

// Set the controller
const controller = {
  async getInfo(message, args, lang, json_file_name) {
    var search = args.join(" ");
    var got_it = false;
    console.log(`Searching: ${search}`);

    // Petitions to the bungie api
    var items_json = await fetch(
      `${bungie_api}/common/destiny2_content/json/${lang}/DestinyInventoryItemDefinition-${json_file_name}`,
      {
        headers: {
          "X-API-Key": bungie_api_key,
        },
      }
    );

    var stats_json = await fetch(
      `${bungie_api}/common/destiny2_content/json/${lang}/DestinyStatDefinition-${json_file_name}`,
      {
        headers: {
          "X-API-Key": bungie_api_key,
        },
      }
    );

    var plugs_json = await fetch(
      `${bungie_api}/common/destiny2_content/json/${lang}/DestinyPlugSetDefinition-${json_file_name}`,
      {
        headers: {
          "X-API-Key": bungie_api_key,
        },
      }
    );

    var items = await items_json.json();
    var stats = await stats_json.json();
    var plugs = await plugs_json.json();
    // End of petitions

    // Getting item
    for (let item in items) {
      var item_searched = items[item];
      if (
        item_searched.displayProperties.name.toLowerCase() ===
          search.toLowerCase() &&
        item_searched.equippingBlock.uniqueLabel
      ) {
        if (
          item_searched.equippingBlock.uniqueLabel.includes("weapon") ||
          item_searched.equippingBlock.uniqueLabel.includes("armor")
        ) {
          // Filters to avoid unuseful messages

          // Filter for 404 entrance in light.gg
          var filter_404 = await fetch(
            `https://www.light.gg/db/${lang}/items/${item_searched.hash}`
          );
          if (filter_404.status !== 200) {
            console.log("Error 404 filter triggered");
            continue;
          }

          // Filter for armor with Version 1 stats
          var version_1_filter = false;
          if (item_searched.equippingBlock.uniqueLabel.includes("armor")) {
            for (let investmentStat in item_searched.investmentStats) {
              if (
                item_searched.investmentStats[investmentStat].value === 10 ||
                item_searched.investmentStats[investmentStat].value === 20
              ) {
                console.log("Version 1 filter triggered");
                version_1_filter = true;
              }
            }
            if (version_1_filter) continue;
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

          if (item_searched.equippingBlock.uniqueLabel.includes("weapon")) {
            if (lang === "es") {
              embed.description = `*${item_searched.flavorText}*
          
              **Categoría:** ${item_searched.inventory.tierTypeName}
  
              __**Estadísticas:**__
              ${stats_list.join(" ")}
  
              __**Imagen del Item:**__`;
            }

            if (lang === "en") {
              embed.description = `*${item_searched.flavorText}*
          
              **Category:** ${item_searched.inventory.tierTypeName}
  
              __**Stats:**__
              ${stats_list.join(" ")}
  
              __**Item Screenshot:**__`;
            }
          }

          if (item_searched.equippingBlock.uniqueLabel.includes("armor")) {
            if (lang === "es") {
              embed.description = `*${item_searched.flavorText}*
          
              **Categoría:** ${item_searched.inventory.tierTypeName}`;
            }

            if (lang === "en") {
              embed.description = `*${item_searched.flavorText}*
          
              **Category:** ${item_searched.inventory.tierTypeName}`;
            }

            embed.fields = [];
          }

          switch (item_searched.inventory.tierTypeName) {
            case "Excepcional":
            case "Exotic":
              embed.color = "#ceae33";
              break;
            case "Leyenda":
            case "Legendary":
              embed.color = "#522f65";
              break;
            case "Peculiar":
            case "Rare":
              embed.color = "#5076a3";
              break;
            case "Poco común":
            case "Common":
              embed.color = "#366f42";
              break;
            case "Común":
            case "Basic":
              embed.color = "#c3bcb4";
              break;
            default:
              embed.color = "#000000";
              break;
          }

          message.channel.send({ embed: embed });
          // End of the first message

          // Getting random perks of the item if it is possible
          if (
            item_searched.equippingBlock.uniqueLabel.includes("weapon") ||
            (item_searched.equippingBlock.uniqueLabel.includes("armor") &&
              item_searched.inventory.tierTypeName === "Excepcional") ||
            item_searched.inventory.tierTypeName === "Exotic"
          ) {
            var socket_entries = item_searched.sockets.socketEntries;

            var curated_roll_list = [];
            var random_perks_list = [];
            var cnt = 0;

            for (let socket in socket_entries) {
              var plug_perk_hash =
                plugs[socket_entries[socket].randomizedPlugSetHash];

              if (item_searched.equippingBlock.uniqueLabel.includes("weapon"))
                this.getRandomPerks(items, plug_perk_hash, random_perks_list);

              // Next messages, one per group of perks
              if (random_perks_list.length !== 0) {
                embed.author = null;
                if (lang === "es")
                  embed.title = `Perks aleatorias para el Hueco n°${cnt}`;
                if (lang === "en")
                  embed.title = `Random perks for Socket n°${cnt}`;
                embed.url = null;
                embed.thumbnail.url = null;
                embed.image.url = null;
                embed.footer.text = null;
                embed.description = `${random_perks_list.join(" ")}`;
                message.channel.send({ embed: embed });
              }

              random_perks_list = [];
              cnt++;

              // Curated Rolls
              this.getCuratedRoll(
                items,
                curated_roll_list,
                socket_entries,
                socket
              );
            }

            // Deleting last 3 entries, which are not perks

            if (item_searched.equippingBlock.uniqueLabel.includes("weapon"))
              for (let i = 0; i < 3; i++) curated_roll_list.pop();
            if (item_searched.equippingBlock.uniqueLabel.includes("armor")) {
              var special_armor_perk = curated_roll_list.pop();
              curated_roll_list = [special_armor_perk];
            }

            //Last message for curated roll
            if (curated_roll_list.length !== 0) {
              embed.author = null;
              if (
                item_searched.inventory.tierTypeName === "Excepcional" ||
                item_searched.inventory.tierTypeName === "Exotic"
              ) {
                if (item_searched.equippingBlock.uniqueLabel.includes("armor")) {
                  if (lang === "es") embed.title = `Perk Fija:`;
                  if (lang === "en") embed.title = `Signature Perk:`;
                }

                if (item_searched.equippingBlock.uniqueLabel.includes("weapon")) {
                  if (lang === "es") embed.title = `Perks Fijas:`;
                  if (lang === "en") embed.title = `Signature Perks:`;
                }
              } else {
                if (lang === "es")
                  embed.title = `Drop Especial de Bungie (Siempre igual):`;
                if (lang === "en")
                  embed.title = `Bungie's Curated Roll (Always the same):`;
              }
              embed.url = null;
              embed.thumbnail.url = null;
              embed.image.url = null;
              embed.footer.text = null;
              embed.description = `${curated_roll_list.join(" ")}`;
              message.channel.send({ embed: embed });
            }
          } // End of getting random perks
        }
      }
    }
    if (!got_it) {
      var not_found = "";
      if (lang === "es")
        not_found = `no he encontrado nada relacionado con **${search}**. Escribe el nombre lo más exacto posible.`;
      if (lang === "en")
        not_found = `I couldn't find anything related to **${search}**. Write the name as accurate as possible.`;
      message.reply(not_found);
    }
    // End
    console.log("Finish!");
  },

  itemStats(item, stats, list) {
    for (let stat in stats) {
      for (let item_stat in item.stats.stats) {
        if (stats[stat].hash === item.stats.stats[item_stat].statHash) {
          if (
            stats[stat].displayProperties.name &&
            item.stats.stats[item_stat].value &&
            item.stats.stats[item_stat].value !== 0
          ) {
            list.push(
              `${stats[stat].displayProperties.name}: ${item.stats.stats[item_stat].value} \n`
            );
          }
        }
      }
    }
  },

  getRandomPerks(items, hash, list) {
    if (hash) {
      for (let item in hash.reusablePlugItems) {
        var random_perk_hash = hash.reusablePlugItems[item].plugItemHash;

        list.push(
          `\n**${items[random_perk_hash].displayProperties.name}**:\n${items[random_perk_hash].displayProperties.description} \n`
        );
      }
    }
  },

  getCuratedRoll(items, list, socket_entries, socket) {
    if (socket_entries[socket].singleInitialItemHash !== 0) {
      var socket_hash = socket_entries[socket].singleInitialItemHash;
      list.push(
        `\n**${items[socket_hash].displayProperties.name}**:\n${items[socket_hash].displayProperties.description} \n`
      );
    }
  },

  async Xur(message, json_file_name) {
  
    console.log("Finding Xur...")
    var updated_json = await fetch(
      `https://paracausal.science/xur/current.json`
      //`https://api.npoint.io/7bcfced1b9fdabf2e262` //test
    );

    var locations_json = await fetch(
      `${bungie_api}/common/destiny2_content/json/es/DestinyDestinationDefinition-${json_file_name}
    `,
      {
        headers: {
          "X-API-Key": bungie_api_key,
        },
      }
    );

    var vendors_json = await fetch(
      `${bungie_api}/common/destiny2_content/json/es/DestinyVendorDefinition-${json_file_name}
    `,
      {
        headers: {
          "X-API-Key": bungie_api_key,
        },
      }
    );

    var vendors_inventory_json = await fetch(
      `${bungie_api}/Platform/Destiny2/Vendors/?components=402
    `,
      {
        headers: {
          "X-API-Key": bungie_api_key,
        },
      }
    );

    var items_json = await fetch(
      `${bungie_api}/common/destiny2_content/json/es/DestinyInventoryItemDefinition-${json_file_name}`,
      {
        headers: {
          "X-API-Key": bungie_api_key,
        },
      }
    );

    var updated_info = await updated_json.json();

    console.log(updated_info);
    var vendors = await vendors_json.json();
    var vendors_inventory = await vendors_inventory_json.json();

    var xur = vendors[2190858386];
    var xur_inventory =
      vendors_inventory.Response.sales.data[2190858386].saleItems;

    if (updated_info === null) {
      embed.color = "#000000";
      embed.title = `${xur.displayProperties.name} - ${xur.displayProperties.subtitle}`;
      embed.thumbnail.url = `${bungie_api}/common/destiny2_content/icons/5659e5fc95912c079962376dfe4504ab.png`;
      embed.description = `
    *${xur.displayProperties.description}*

    __**¿Dónde está?**__ -> Xûr no está. Volverá el __viernes__ sobre las __19:00h__`;
      embed.fields = [];
      message.channel.send({ embed: embed });
      return;
    }

    var locations = await locations_json.json();
    var items = await items_json.json();

    var destination_hash = updated_info.destinationHash;
    var bubble_index = updated_info.bubbleIndex;

    var destination = locations[destination_hash].displayProperties.name;
    var bubble =
      locations[destination_hash].bubbles[bubble_index].displayProperties
        .name;

    var sale_items = [];
    var cnt = 0;
    var item_title = "";

    for (let sale in xur_inventory) {
      var sale_item = xur_inventory[sale];
      var item_hash = sale_item.itemHash;
      switch (cnt) {
        case 0:
          item_title = `\`Engrama Excepcional\``;
          break;
        case 1:
          item_title = `\`Arma Excepcional\` -> ${items[item_hash].displayProperties.name} - ${items[item_hash].itemTypeDisplayName}`;
          break;
        case 2:
          item_title = `\`Cazadores\` -> ${items[item_hash].displayProperties.name} - ${items[item_hash].itemTypeDisplayName}`;
          break;
        case 3:
          item_title = `\`Titanes\` -> ${items[item_hash].displayProperties.name} - ${items[item_hash].itemTypeDisplayName}`;
          break;
        case 4:
          item_title = `\`Hechiceros\` -> ${items[item_hash].displayProperties.name} - ${items[item_hash].itemTypeDisplayName}`;
          break;
        case 5:
          item_title = `\`Aventura Excepcional\` -> ${items[item_hash].displayProperties.name}`;
          break;
        default:
          item_title = "";
          break;
      }
      var cost = "";
      if (sale_item.costs[0])
        cost = `Precio: ${sale_item.costs[0].quantity} fragmentos de leyenda`;
      if (!sale_item.costs[0])
        cost = items[item_hash].displayProperties.description;
      sale_items.push({
        name: `${item_title}`,
        value: `${cost}`,
        inline: false,
      });
      cnt++;
    }
    embed.color = "#000000";
    embed.title = `${xur.displayProperties.name} - ${xur.displayProperties.subtitle}`;
    embed.thumbnail.url = `${bungie_api}/common/destiny2_content/icons/5659e5fc95912c079962376dfe4504ab.png`;
    embed.description = `
    *${xur.displayProperties.description}*

    __**¿Dónde está?**__ -> ${bubble}, en ${destination}

    __**¿Qué trae?**__`;
    embed.fields = sale_items;
    message.channel.send({ embed: embed });
    embed.fields = [];
    console.log("Finish!");
  },

  async xurArrivesChecker() {

    var updated_json = await fetch(
      `https://paracausal.science/xur/current.json`
      //`https://api.npoint.io/7bcfced1b9fdabf2e262` //test
    );

    var updated_info = await updated_json.json();

    if (updated_info !== null) {
      console.log("Xûr is here!!!");
      return true;
    }
    if (updated_info === null) {
      console.log("Xûr is not here...");
      return false;
    }
    
  },
};

// Export controller to use it in index.js
module.exports = controller;
