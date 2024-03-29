const { Job } = require("./mod/job");
const { forest } = require("./adv/forest");
const { menu } = require("./mod/menu");
const { plot } = require("./mod/plot");
const { market } = require("./mod/market");
const fs = require("fs");
const { Mongoose } = require("mongoose");

module.exports = async (bot, utils, lang, userdb, itemdb, bp, crypto) => {
  const Markup = require("node-vk-bot-api/lib/markup");

  const usersMap = new Map();
  const LIMIT = 5;
  const DIFF = 105;
  const TIME = 100;
  bot.event("message_event", async (ctx) => {
    const cb = (message) => {
      bot.execute("messages.sendMessageEventAnswer", {
        user_id: ctx.message.user_id,
        peer_id: ctx.message.peer_id,
        event_id: ctx.message.event_id,
        event_data: JSON.stringify({
          type: "show_snackbar",
          text: message,
        }),
      });
    };
    ctx.message.createdTimestamp = ctx.timestamp;
    if (usersMap.has(ctx.message.peer_id)) {
      const userData = usersMap.get(ctx.message.peer_id);
      const { lastMessage, timer } = userData;
      const difference =
        ctx.message.createdTimestamp - lastMessage.createdTimestamp;
      let msgCount = userData.msgCount;
      cb(`Подождите немного ${difference} ms`);

      if (difference > DIFF) {
        clearTimeout(timer);
        console.log("Cleared Timeout");
        userData.msgCount = 1;
        userData.lastMessage = ctx.message;
        userData.timer = setTimeout(() => {
          usersMap.delete(ctx.message.peer_id);
          console.log("Removed from map.");
        }, TIME);
        usersMap.set(ctx.message.peer_id, userData);
      } else {
        ++msgCount;
        if (parseInt(msgCount) === LIMIT) {
          console.log(`Warning: Spamming forbidden.`);
        } else {
          userData.msgCount = msgCount;
          usersMap.set(ctx.message.peer_id, userData);
        }
      }
    } else {
      let fn = setTimeout(async () => {
        usersMap.delete(ctx.message.peer_id);
        // console.log('Removed from map.')
      }, TIME);
      usersMap.set(ctx.message.peer_id, {
        msgCount: 1,
        lastMessage: ctx.message,
        timer: fn,
      });
      const job = new Job(bot, ctx, itemdb);
      await job.workhard();
    }
  });

  bot.on(async (ctx) => {
    if (ctx.user._bm === 0) return;
    if (ctx.user.acclvl < 0)
      return ctx.reply(
        `☠️ Ваша душа зепечатанна, печать спадет через ${Math.round(
          (ctx.user.buffs.ban - ctx.timestamp) / 1000 / 60 / 60
        )} часов`
      );
    const cmba = ctx.message.text.toLowerCase().split(" ");

    if (ctx.cmd == "export") {
      ctx.reply(
        `Ссылка на бота: https://t.me/Vinteum_bot?start\nАвторизировавшись в боте введите команду ниже`
      );
      ctx.reply(`/import ${crypto.enc(ctx.user._id.toString())}`);
    }

    if (Date.now() > 1669380998319)
      return ctx.reply(
        `Бот переехал https://t.me/Vinteum_bot?start \nДля экспорта аккаунта Нажмите на кнопку "Экспорт" ниже`,
        null,
        Markup.keyboard([Markup.button(lang.export, "negative", "export")])
      );

    const marketSell = async (count, item, eachPrice) => {
      count === "all"
        ? (count = +ctx.user.inv[item])
        : (count = +ctx.cmd.split(".")[2]);
      item = ctx.cmd.split(".")[0];
      if (ctx.user.inv[item] < count || count === 0) {
        await ctx.reply(`Недостаточно ${lang[item]}`);
      } else {
        let summ = 0;
        eachPrice ? (summ = count * eachPrice) : (summ = count);
        summ = Math.round(summ);
        await ctx.bank.inc("inv", count, item);
        await ctx.bank.dec("balance", summ);
        await ctx.user.dec("inv", count, item);
        await ctx.user.inc("balance", summ);
        await ctx.reply(
          `Вы продали ${count} ${lang[item]} и выручили ${summ} ${lang.curr}`
        );
      }
    };

    if (cmba[0] === "bup" || cmba[0] === "alvup") {
      try {
        if (ctx.user.acclvl >= 7 && cmba[0] === "bup") {
          const locUser = await userdb.findOne({ uid: cmba[1] });
          const balup = locUser.balance + Number(cmba[2]);
          locUser.balance = balup.toFixed(2);
          // await locUser.save()
          await ctx.reply(
            `@id${locUser.id} user balance up to ${
              cmba[2] + lang.curr
            } current balance ${balup + lang.curr}`
          );
          await bot.sendMessage(
            locUser.id,
            `${lang.balUp} ${cmba[2] + lang.curr} ${lang.currBal} ${
              balup + lang.curr
            }`
          );
        } else if (ctx.user.acclvl >= 7 && cmba[0] === "alvup") {
          let locUser = await userdb.findOne({ uid: cmba[1] });
          console.log(locUser.acclvl);
          if (locUser.acclvl === 7) {
            return ctx.reply(`Нельзя менять уровень у ${lang.dev}a`);
          } else {
            locUser.acclvl = Math.round(cmba[2]);
            await locUser.save();
            await ctx.reply(
              `@id${locUser.id} account level up to ${
                cmba[2] == 0
                  ? lang.user
                  : cmba[2] == 1
                  ? lang.vip
                  : cmba[2] == 2
                  ? lang.plat
                  : cmba[2] == 7
                  ? lang.dev
                  : cmba[2] == 6
                  ? lang.adm
                  : cmba[2] == 5
                  ? lang.moder
                  : cmba[2]
              }`
            );
            await bot.sendMessage(
              locUser.id,
              `Теперь уровень вашего Аккаунта ${
                cmba[2] == 0
                  ? lang.user
                  : cmba[2] == 1
                  ? lang.vip
                  : cmba[2] == 2
                  ? lang.plat
                  : cmba[2] == 7
                  ? lang.dev
                  : cmba[2] == 6
                  ? lang.adm
                  : cmba[2] == 5
                  ? lang.moder
                  : cmba[2]
              }`
            );
          }
        } else {
          ctx.reply(lang.noPerm);
        }
      } catch (e) {
        ctx.reply(lang.errorinput);
        console.log(e);
      }
    } else if (
      cmba[0] === "рейтинг" ||
      cmba[0] === "rate" ||
      cmba[0] === "топ"
    ) {
      userdb.find({ _bm: 1 }).then((user) => {
        let result = `Рейтинг: \n`;
        user = user
          .filter((x) => x.acclvl < 3)
          .filter((x) => x.balance > 0)
          .sort((a, b) => {
            return b.balance - a.balance;
          });
        for (i = 0; i < 9; i++) {
          result += `${
            i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅"
          } @id${user[i].id}(${user[i].f_name}) = ${user[i].balance} ${
            lang.curr
          }\n`;
        }
        ctx.reply(`${result}`);
      });
      return;
    } else if (cmba[0] === "stat") {
      userdb.find({}).then((user) => {
        let result = `Статистика: \n\n`;
        user = user
          .filter((x) => x._bm > 0)
          .filter((x) => x.acclvl < 3)
          .filter((x) => x.balance > 0)
          .sort((a, b) => {
            return b.balance - a.balance;
          });
        result += `Активных пользователей: ${user.length}\n`;
        // for (i = 0; i < user.length; i++) {
        //     result += `@id${user[i].id}(${user[i].f_name}) = ${user[i].balance} ${lang.curr}\n`
        // }
        ctx.reply(`${result}`);
      });
      return;
    } else if (cmba[0] === "report" || cmba[0] === "репорт") {
      await utils
        .smChat(
          2000000005,
          `📝 Репорт от пользователя @id${ctx.user.id}(${
            ctx.user.f_name
          })\n💬 ${ctx.message.text
            .split(" ")
            .join()
            .replace(/,/g, " ")
            .replace(cmba[0], "")}`
        )
        .then(() => {
          return ctx.reply(
            `📤 Репорт отправлен ожидайте ответа Тех. Поддержки`
          );
        })
        .catch((err) => {
          return ctx.reply(
            `‼️ Произошла ошибка при отправлении сообщения Тех. Поддержке.`
          );
        });
    } else if (cmba[0] === "use") {
      if (
        cmba[1] === "зелье" &&
        cmba[2] === "энергии" &&
        ctx.user.items.energyPotion > 0
      ) {
        await ctx.user.dec("items", 1, "energyPotion");
        await ctx.user.inc("energy", 25);
        await ctx.reply(
          `Вы использвали ${lang.energyPotion} теперь у вас ${ctx.user.energy} ⚡ осталось еще ${ctx.user.items.energyPotion} Банок ОЭ`
        );
      } else {
        ctx.reply("‼️ Неверный предмет или у вас закончились банки");
      }
    } else if (cmba[0] === "send" || cmba[0] === "передать") {
      try {
        let locUser = await userdb.findOne({ uid: cmba[1] });
        if (
          Number(cmba[1]) &&
          Number(cmba[2]) &&
          ctx.user.balance > +cmba[2] &&
          +cmba[2] > 0
        ) {
          await ctx.user.dec("balance", +cmba[2]);
          await locUser.inc("balance", +cmba[2]);
          await ctx.reply(
            `Вы передали ${+cmba[2]}${
              lang.curr
            } пользователю ${`@id${locUser.id}(${locUser.f_name})`}`
          );
          await bot.sendMessage(
            locUser.id,
            `Вы получили ${+cmba[2]}${
              lang.curr
            } от ${`@id${ctx.user.id}(${ctx.user.f_name})`}`
          );
        } else {
          ctx.reply("Недостаточно средств.");
        }
      } catch (e) {
        console.log(e);
        ctx.reply("‼️ Что-то не так.");
      }
    } else if (cmba[0] === "race" || cmba[0] === "расса") {
      if (cmba[0] && cmba[1] === undefined) {
        await ctx.reply(
          `На выбор доступны 4 расы:\n 1. Альв\n 2. Эльф\n 3. Темный Эльф\n 4. Дфарф\n\n Введите ${cmba[0]} "Цифра"\n ️️‼️ Внимание выбрать можно только 1 раз`
        );
      } else if (
        +cmba[1] &&
        ctx.user.race === 0 &&
        +cmba[1] <= 4 &&
        +cmba[1] > 0
      ) {
        await ctx.user.set("race", cmba[1]);
        await ctx.reply(
          `Вы стали ${
            ctx.user.race === 1
              ? lang.alv
              : ctx.user.race === 2
              ? lang.elven
              : ctx.user.race === 3
              ? lang.darkElven
              : ctx.user.race === 4
              ? lang.dwarf
              : null
          }`
        );
      } else {
        ctx.reply("️️‼️ Не верные значения или вы уже выбрали рассу.");
      }
    } else if (cmba[0] === "change_name" || cmba[0] === "смена_имени") {
      let badwords = JSON.parse(
        fs.readFileSync(`./lang/badwords.json`, "utf-8")
      );
      let tek = ctx.message.text.split(" ")[1].replace(/[\[\]]/g, "");
      for (i = 0; i < badwords.length; i++) {
        if (tek === badwords[i]) {
          tek = undefined;
        }
      }
      let regex1 = /^[a-zA-Zа-яА-Я ]+$/;
      if (!regex1.test(tek) || tek === undefined || tek.length >= 14) {
        await ctx.reply("Некорректный ник нейм");
        return;
      }
      if (ctx.user.balance < 10000) {
        await ctx.reply("Недостаточно средств");
        return;
      }

      ctx.reply(`Ник Изменен на ${tek} с вас снято 10000 ${lang.curr}`);
      await ctx.user.set("f_name", tek);
      await ctx.user.dec("balance", 10000);
      await ctx.bank.inc("balance", 10000);

      menu.main(ctx);

      return;
    } else if (cmba[0] === "buffs" || ctx.cmd === "buffs") {
      return menu.buffs(ctx);
    } else if (cmba[0] === "eventbuff") {
      if (ctx.user.acclvl < 7)
        return ctx.reply("Нет прав исользовать эту команду");
      try {
        const hour = ctx.timestamp + +cmba[1] * 60 * 60 * 1000;
        let activeUsers = await userdb.find({ _bm: 1 });
        activeUsers.forEach(async (user) => {
          await user.set("buffs", hour, "newby");
        });
      } catch (e) {}
    } else if (cmba[0] === "admbuff") {
      if (ctx.user.acclvl < 7)
        return ctx.reply("Нет прав использовать данную команду");
      try {
        let locUser = await userdb.findOne({ uid: cmba[1] });
        if (cmba[1] && cmba[2] && cmba[3]) {
          const hour = ctx.timestamp + +cmba[3] * 60 * 60 * 1000;
          if (cmba[2] === "0") {
            await ctx.reply(
              `Вы наложили ${lang.newby} на игрока @id${locUser.id}(${
                locUser.f_name
              }) на ${+cmba[3]} часов`
            );
            await locUser.set("buffs", hour, "newby");
            await bot.sendMessage(
              locUser.id,
              `Вы получили ${
                lang.newby
              } на ${+cmba[3]} часа \nПроверить эффекты на себе можно в Настройках`
            );
          } else if (cmba[2] === "1") {
            await ctx.reply(
              `Вы наложили ${lang.vip} на игрока @id${locUser.id}(${
                locUser.f_name
              }) на ${+cmba[3]} часов`
            );
            await locUser.set("buffs", hour, "vip");
            await bot.sendMessage(
              locUser.id,
              `Вы получили ${
                lang.vip
              } на ${+cmba[3]} часа \nПроверить эффекты на себе можно в Настройках`
            );
          } else if (cmba[2] === "-1") {
            await ctx.reply(
              `Вы наложили ${lang.ban} на игрока @id${locUser.id}(${
                locUser.f_name
              }) на ${+cmba[3]} часов`
            );
            await locUser.set("buffs", hour, "ban");
            await bot.sendMessage(
              locUser.id,
              `Вы получили ${
                lang.ban
              } на ${+cmba[3]} часа \nПроверить эффекты на себе можно в Настройках`
            );
          } else {
            ctx.reply("Баффа с таким [BUFFID] не существует");
          }
        } else {
          await ctx.reply("‼️ Не верные поля проверте верность данных");
        }
      } catch (e) {
        ctx.reply("‼️ Что-то не верно проверте значения");
      }
    } else if (cmba[0] === "updatedb") {
      if (ctx.user.acclvl < 7)
        return ctx.reply("Нет прав использовать данную команду");
      let allUser = await userdb.find({});
      allUser.forEach(async (x, y, z) => {
        await allUser[y].set("__v", 0);
        // console.log(allUser[y].level)
        // await allUser[y].inc('boosters', 0.1 * allUser[y].level, 'energyCount')
      });
      ctx.reply(`Обновлено ${allUser.length} пользователей`);
    } else if (cmba[0] === "set") {
      if (ctx.user.acclvl < 7)
        return ctx.reply("Нет прав использовать данную команду");
      let item = await itemdb.findOne({ id: +cmba[1] });
      ctx.user.add("invent", {
        item: item._id.toString(),
        quantity: +cmba[2] || 1,
        ench: 0,
      });
      ctx.reply(`Вам выдано ${item.name} в кол-ве ${+cmba[2] || 1}`);
    } else if (cmba[0] === "chk") {
      if (ctx.user.acclvl < 7)
        return ctx.reply("Нет прав использовать данную команду");
      // let itemId = await itemdb.findById(ctx.user.invent[cmba[1]].item)
      ctx.user.invent.find((x) => x._id);
      // console.log(itemId)
      // ctx.reply(`${itemId.name} ${ctx.user.invent[0].quantity}`)
    } else if (cmba[0] === "надеть") {
      cmba[1] = --cmba[1];
      if (!ctx.user.invent[cmba[1]]) {
        return ctx.reply("Предмет не найден");
      }
      let itemId = await itemdb.findById(ctx.user.invent[cmba[1]].item);
      if (itemId.type > 0) {
        switch (itemId.type) {
          case 0:
            eqitem = "armor";
            break;
          case 1:
            eqitem = "weap";
            break;
          case 2:
            eqitem = "ring";
            break;
          case 3:
            eqitem = "fishRod";
            break;
        }
      } else {
        return ctx.reply("Неверный слот");
      }
      if (ctx.user.equip[eqitem].equiped) {
        return ctx.reply("Слот уже занят");
      }
      ctx.user.equip[eqitem].item = ctx.user.invent[cmba[1]]._id;
      ctx.user.equip[eqitem].equiped = true;
      ctx.user.invent[cmba[1]].equiped = true;
      const massSt = Object.keys(itemId.stat);
      for (i = 0; i < massSt.length; i++) {
        ctx.user.stat[massSt[i]] += Math.floor(
          itemId.stat[massSt[i]] +
            ctx.user.invent[cmba[1]].ench * 0.1 * itemId.stat[massSt[i]]
        );
      }
      const massCh = Object.keys(itemId.char);
      for (i = 0; i < massCh.length; i++) {
        ctx.user.char[massCh[i]] += Math.floor(
          itemId.char[massCh[i]] +
            ctx.user.invent[cmba[1]].ench * 0.2 * itemId.char[massCh[i]]
        );
      }
      await ctx.user.save();
      ctx.reply(
        `Вы надели ${itemId.name} ${
          ctx.user.invent[cmba[1]].ench === 0
            ? ""
            : `+${ctx.user.invent[cmba[1]].ench}`
        }`
      );
    } else if (cmba[0] === "снять") {
      cmba[1] = --cmba[1];
      if (!ctx.user.invent[cmba[1]]) {
        return ctx.reply("Предмет не найден");
      }
      let itemId = await itemdb.findById(ctx.user.invent[cmba[1]].item);
      let eqitem = "";
      if (itemId.type > 0) {
        switch (itemId.type) {
          case 0:
            eqitem = "armor";
            break;
          case 1:
            eqitem = "weap";
            break;
          case 2:
            eqitem = "ring";
            break;
          case 3:
            eqitem = "fishRod";
            break;
        }
      } else {
        return ctx.reply("Неверный слот");
      }
      if (!ctx.user.invent[cmba[1]].equiped) {
        return ctx.reply("Предмет не надет");
      }
      ctx.user.equip[eqitem].item = ctx.user.invent[cmba[1]]._id;
      ctx.user.equip[eqitem].equiped = false;
      ctx.user.invent[cmba[1]].equiped = false;
      const massSt = Object.keys(itemId.stat);
      for (i = 0; i < massSt.length; i++) {
        ctx.user.stat[massSt[i]] -= Math.floor(
          itemId.stat[massSt[i]] +
            ctx.user.invent[cmba[1]].ench * 0.1 * itemId.stat[massSt[i]]
        );
      }
      const massCh = Object.keys(itemId.char);
      for (i = 0; i < massCh.length; i++) {
        ctx.user.char[massCh[i]] -= Math.floor(
          itemId.char[massCh[i]] +
            ctx.user.invent[cmba[1]].ench * 0.2 * itemId.char[massCh[i]]
        );
      }
      await ctx.user.save();
      ctx.reply(
        `Вы сняли ${itemId.name} ${
          ctx.user.invent[cmba[1]].ench === 0
            ? ""
            : `+${ctx.user.invent[cmba[1]].ench}`
        }`
      );
    } else if (cmba[0] === "предмет") {
      cmba[1] = --cmba[1];
      if (!ctx.user.invent[cmba[1]]) {
        return ctx.reply("Предмет не найден");
      }
      let itemId = await itemdb.findById(ctx.user.invent[cmba[1]].item);
      const itemStat = [];
      const massSt = Object.keys(itemId.stat);
      for (i = 0; i < massSt.length; i++) {
        itemStat.push(
          `${
            itemId.stat[massSt[i]] === 0
              ? ``
              : `\n➔${lang[massSt[i]]}: ${Math.floor(
                  itemId.stat[massSt[i]] +
                    ctx.user.invent[cmba[1]].ench * 0.1 * itemId.stat[massSt[i]]
                )}`
          }`
        );
      }
      const massCh = Object.keys(itemId.char);
      for (i = 0; i < massCh.length; i++) {
        itemStat.push(
          `${
            itemId.char[massCh[i]] === 0
              ? ``
              : `\n➔${lang[massCh[i]]}: ${Math.floor(
                  itemId.char[massCh[i]] +
                    ctx.user.invent[cmba[1]].ench * 0.2 * itemId.char[massCh[i]]
                )}`
          }`
        );
      }
      ctx.reply(
        `${itemId.name}${
          ctx.user.invent[cmba[1]].ench === 0
            ? ""
            : `+${ctx.user.invent[cmba[1]].ench}`
        } ${itemStat.join(" ")}`
      );
    } else if (cmba[0] === "зачаровать" || cmba[0] === "ench") {
      cmba[1] = --cmba[1];
      const locItem = ctx.user.invent[cmba[1]];
      if (!locItem) {
        return ctx.reply("Предмет не найден");
      }
      let itemId = await itemdb.findById(locItem.item);
      let enchScroll = await itemdb.findOne({ id: 6 });
      const eScroll = ctx.user.invent.find(
        (x) => x.item.toString() === enchScroll._id.toString()
      );
      if (!eScroll || eScroll.quantity < 0) {
        return ctx.reply("Недостаточно свитков для зачарования");
      }
      await ctx.user.add("invent", {
        item: enchScroll._id.toString(),
        quantity: -1,
      });
      if (itemId.type > 0) {
        switch (itemId.type) {
          case 0:
            eqitem = "armor";
            break;
          case 1:
            eqitem = "weap";
            break;
          case 2:
            eqitem = "ring";
            break;
          case 3:
            eqitem = "fishRod";
            break;
        }
      } else {
        return ctx.reply("Неверный предмет");
      }
      const rand = utils.rand(0, 100);
      if (locItem.ench >= 10) {
        return ctx.reply("Предмет улучшен до максимума");
      }
      if (rand > 0 && rand < 100 - locItem.ench * 9.5) {
        await ctx.user.ench("invent", locItem, {
          item: itemId._id.toString(),
          ench: 1,
        });
        ctx.reply(
          `Предмет ${itemId.name} Успешно зачарован на +${locItem.ench}`
        );
      } else {
        await ctx.user.ench("invent", locItem, {
          item: itemId._id.toString(),
          ench: -1,
        });
        await ctx.user.inc("inv", locItem.ench, "vinmt");
        ctx.reply(
          `Предмет ${itemId.name} ${
            locItem.ench === 0 ? "" : `+${locItem.ench}`
          } сломан: вы получаете ${locItem.ench} ${lang.vinmt}`
        );
      }
    } else if (cmba[0] === "stop") {
      if (ctx.user.acclvl < 7)
        return ctx.reply("Нет прав использовать данную команду");
      ctx.reply(`Api Disable.`);
      bot.stop();
    } else if (
      ctx.cmd === lang.dev ||
      ctx.cmd === lang.adm ||
      ctx.cmd === lang.moder ||
      ctx.cmd === lang.user ||
      ctx.cmd === lang.vip ||
      ctx.cmd === lang.plat
    ) {
      ctx.user.acclvl >= 7
        ? ctx.reply(
            `${lang.userGrpCmd} ${lang.dev} ${lang.help} ${lang.devCmd}`
          )
        : ctx.user.acclvl == 6
        ? ctx.reply(`${lang.userGrpCmd} ${lang.adm} ${lang.help}`)
        : ctx.user.acclvl == 5
        ? ctx.reply(`${lang.userGrpCmd} ${lang.moder} ${lang.help}`)
        : ctx.user.acclvl == 2
        ? ctx.reply(`${lang.userGrpCmd} ${lang.plat} ${lang.help}`)
        : ctx.user.acclvl == 1
        ? ctx.reply(`${lang.userGrpCmd} ${lang.vip} ${lang.help}`)
        : ctx.user.acclvl == 0
        ? ctx.reply(`${lang.userGrpCmd} ${lang.user} ${lang.help}`)
        : ctx.reply(lang.noPerm);
      return;
    }
    if (!ctx.user) {
      await ctx.reply(
        `${ctx.mesage.text} ${lang.notcmd}`,
        null,
        Markup.keyboard([[Markup.button(lang.start, "primary")]])
      );
    } else if (!ctx.cmd) {
      return menu.main(ctx);
    }

    switch (ctx.cmd) {
      case "profile":
        return menu.profile(ctx);
      case "inventory":
        return menu.inventory(ctx);
      case "invent":
        return menu.invent(ctx, itemdb);
      case "char":
        return menu.char(ctx);
      case "craftSkils":
        return menu.craftSkils(ctx);
      case "equip":
        return menu.equip(ctx, itemdb);
      case "export":
        return menu.export(ctx, crypto);
      case "menu":
        return menu.main(ctx);
      case lang.setting:
        return menu.setting(ctx);
      case "report":
        return ctx.reply("Введите команду:\n репорт 'Текст вашего сообщения'");
      case "adventure":
        return forest.main(ctx);
      case "adventure.left":
        return forest.side(ctx);
      case "adventure.right":
        return forest.side(ctx);
      case lang.alert:
        if (ctx.user.alert) {
          ctx.user.alert = false;
          await ctx.user.save();
          await ctx.reply(
            `${lang.alert} ${ctx.user.alert ? "Включены" : "Выключены"}`
          );
          return menu.setting(ctx);
        } else {
          ctx.user.alert = true;
          await ctx.user.save();
          await ctx.reply(
            `${lang.alert} ${ctx.user.alert ? "Включены" : "Выключены"}`
          );
          return menu.setting(ctx);
        }
      case lang.crafts:
        return ctx.reply(
          `Выбирете направление вашего дальнейшего пути! У вас ${ctx.user.energy}⚡`,
          null,
          Job.getKeyboard()
        );
      case lang.x10harv:
        return ctx.reply(
          `Выбирете направление вашего дальнейшего пути! У вас ${ctx.user.energy}⚡`,
          null,
          Job.getKeyboardX()
        );
      case lang.x100harv:
        return ctx.reply(
          `Выбирете направление вашего дальнейшего пути! У вас ${ctx.user.energy}⚡`,
          null,
          Job.getKeyboardX1()
        );
      case lang.market:
        return market.main(ctx);
      case "market.buy.items":
        return market.buyItems(ctx);
      case "exchange":
        return market.exchangeMsg(ctx, "lumen");
      case "exchange.buy":
        return market.exchangeBuy(ctx, "lumen", 1);
      case "exchange.sell":
        return market.exchangeSell(ctx, "lumen", 1);
      case "exchange.buy.100":
        return market.exchangeBuy(ctx, "lumen", 100);
      case "exchange.sell.100":
        return market.exchangeSell(ctx, "lumen", 100);
      case "exchange.buy.1000":
        return market.exchangeBuy(ctx, "lumen", 1000);
      case "exchange.sell.1000":
        return market.exchangeSell(ctx, "lumen", 1000);
      case "market.auction.items":
        return market.auction(ctx);
      case "auction.rareOre":
        return market.auctionMsg(ctx, "rareOre", 10);
      case "auction.rareOre.buy":
        return market.auctionBuy(ctx, "rareOre");
      case "auction.rareOre.sell":
        return market.auctionSell(ctx, "rareOre", 10);
      case "auction.rareHerb":
        return market.auctionMsg(ctx, "rareHerbs", 10);
      case "auction.rareHerb.buy":
        return market.auctionBuy(ctx, "rareHerbs");
      case "auction.rareHerb.sell":
        return market.auctionSell(ctx, "rareHerbs", 10);
      case "auction.rareFish":
        return market.auctionMsg(ctx, "rareFish", 100);
      case "auction.rareFish.buy":
        return market.auctionBuy(ctx, "rareFish");
      case "auction.rareFish.sell":
        return market.auctionSell(ctx, "rareFish", 100);
      case "auction.rareWood":
        return market.auctionMsg(ctx, "rareWood", 10);
      case "auction.rareWood.buy":
        return market.auctionBuy(ctx, "rareWood");
      case "auction.rareWood.sell":
        return market.auctionSell(ctx, "rareWood", 10);
      case "auction.rareSand":
        return market.auctionMsg(ctx, "rareSand", 10);
      case "auction.rareSand.buy":
        return market.auctionBuy(ctx, "rareSand");
      case "auction.rareSand.sell":
        return market.auctionSell(ctx, "rareSand", 10);
      case "energyPotion":
        ctx.reply(
          `${lang.energyPotion} стоит 6 500 ${lang.curr} восстанавливает 25 ⚡.`,
          null,
          Markup.keyboard([
            Markup.button("Купить", "default", `${ctx.cmd}.buy`),
            Markup.button("Отмена", "default", `menu`),
          ]).inline()
        );
        return;
      case "energyPotion.buy":
        if (ctx.user.balance < 6500) {
          return ctx.reply("Недостаточно средств");
        }
        await ctx.user.dec("balance", 6500);
        await ctx.bank.inc("balance", 6500);
        await ctx.user.inc("items", 1, "energyPotion");
        await ctx.reply(
          `Вы успешно приобрели ${lang.energyPotion}\nВы можете использовать ее командой \'use Зелье Энергии\'`
        );
        return;
      case "fishingRod":
        ctx.reply(
          `Удочка стоит 5 000 ${lang.curr}.`,
          null,
          Markup.keyboard([
            Markup.button("Купить", "default", `${ctx.cmd}.buy`),
            Markup.button("Отмена", "default", `menu`),
          ]).inline()
        );
        return;
      case "fishingRod.buy":
        if (ctx.user.balance < 5000) {
          return ctx.reply("Недостаточно средств");
        }
        const item = await itemdb.findOne({ id: 3 });
        if (
          ctx.user.invent.find((x) => x.item.toString() === item._id.toString())
        )
          return ctx.reply("У вас уже есть такой предмет");
        await ctx.user.dec("balance", 5000);
        await ctx.bank.inc("balance", 5000);
        await ctx.user.add("invent", {
          item: item._id.toString(),
          quantity: 1,
          ench: 0,
        });
        await ctx.reply("Вы успешно приобрели 🎣");
        return;
      case "bait":
        ctx.reply(
          `Текущий курс 1 Наживка 🐛 = 20 ${lang.curr}\nСколько вы хотите купить?.`,
          null,
          Markup.keyboard([
            Markup.button(10, "default", `${ctx.cmd}.buy.10`),
            Markup.button(50, "default", `${ctx.cmd}.buy.50`),
            Markup.button(100, "default", `${ctx.cmd}.buy.100`),
          ]).inline()
        );
        return;
      case "bait.buy.10":
        if (ctx.user.balance < 20 * 10) {
          return ctx.reply("Недостаточно средств");
        }
        await ctx.user.dec("balance", 20 * 10);
        await ctx.bank.inc("balance", 20 * 10);
        await ctx.user.inc("items", 10, "bait");
        await ctx.reply("Вы успешно приобрели 10 🐛");
        return;
      case "bait.buy.50":
        if (ctx.user.balance < 20 * 50) {
          return ctx.reply("Недостаточно средств");
        }
        await ctx.user.dec("balance", 20 * 50);
        await ctx.bank.inc("balance", 20 * 50);
        await ctx.user.inc("items", 50, "bait");
        await ctx.reply("Вы успешно приобрели 50 🐛");
        return;
      case "bait.buy.100":
        if (ctx.user.balance < 20 * 100) {
          return ctx.reply("Недостаточно средств");
        }
        await ctx.user.dec("balance", 20 * 100);
        await ctx.bank.inc("balance", 20 * 100);
        await ctx.user.inc("items", 100, "bait");
        await ctx.reply("Вы успешно приобрели 100 🐛");
        return;
      case "market.sell.ore":
        let prInfo = ``;
        (prInfo += `Что вы хотели-бы продать?\n`),
          (prInfo += `\nТекущий курс 1 ${lang.herbs} = ${ctx.bank.dpi.herbs} ${lang.curr}.`),
          (prInfo += `\nТекущий курс 1 ${lang.ore} = ${ctx.bank.dpi.ore} ${lang.curr}.`),
          (prInfo += `\nТекущий курс 1 ${lang.sand} = ${ctx.bank.dpi.sand} ${lang.curr}.`),
          (prInfo += `\nТекущий курс 1 ${lang.wood} = ${ctx.bank.dpi.wood} ${lang.curr}.`),
          (prInfo += `\nТекущий курс 1 ${lang.fish} = ${ctx.bank.dpi.fish} ${lang.curr}.`),
          ctx.reply(
            prInfo,
            null,
            Markup.keyboard([
              [
                Markup.button(lang.herbs, "primary", "herbs"),
                Markup.button(lang.ore, "primary", "ore"),
              ],
              [
                Markup.button(lang.sand, "primary", "sand"),
                Markup.button(lang.wood, "primary", "wood"),
                Markup.button(lang.fish, "primary", "fish"),
              ],
              [Markup.button(lang.back, "negative", lang.market)],
            ])
          );
        return;
      case "fish":
        ctx.reply(
          `Текущий курс 1 ${lang.fish} = ${ctx.bank.dpi.fish} ${lang.curr}\nСколько вы хотите продать?.`,
          null,
          Markup.keyboard([
            Markup.button(10, "default", `${ctx.cmd}.sell.10`),
            Markup.button(100, "default", `${ctx.cmd}.sell.100`),
            Markup.button(500, "default", `${ctx.cmd}.sell.500`),
            Markup.button(lang.all, "default", `${ctx.cmd}.sell.all`),
          ]).inline()
        );
        return;
      case "fish.sell.10":
        marketSell(
          ctx.cmd.split(".")[2],
          ctx.cmd.split(".")[0],
          ctx.bank.dpi.fish
        );
        return;
      case "fish.sell.100":
        marketSell(
          ctx.cmd.split(".")[2],
          ctx.cmd.split(".")[0],
          ctx.bank.dpi.fish
        );
        return;
      case "fish.sell.500":
        marketSell(
          ctx.cmd.split(".")[2],
          ctx.cmd.split(".")[0],
          ctx.bank.dpi.fish
        );
        return;
      case `fish.sell.all`:
        marketSell(
          ctx.cmd.split(".")[2],
          ctx.cmd.split(".")[0],
          ctx.bank.dpi.fish
        );
        return;
      case "herbs":
        ctx.reply(
          `Текущий курс 1 ${lang.herbs} = ${ctx.bank.dpi.herbs} ${lang.curr}\nСколько вы хотите продать?.`,
          null,
          Markup.keyboard([
            Markup.button(100, "default", `${ctx.cmd}.sell.100`),
            Markup.button(500, "default", `${ctx.cmd}.sell.500`),
            Markup.button(1000, "default", `${ctx.cmd}.sell.1000`),
            Markup.button(lang.all, "default", `${ctx.cmd}.sell.all`),
          ]).inline()
        );
        return;
      case "herbs.sell.100":
        marketSell(
          ctx.cmd.split(".")[2],
          ctx.cmd.split(".")[0],
          ctx.bank.dpi.herbs
        );
        return;
      case "herbs.sell.500":
        marketSell(
          ctx.cmd.split(".")[2],
          ctx.cmd.split(".")[0],
          ctx.bank.dpi.herbs
        );
        return;
      case "herbs.sell.1000":
        marketSell(
          ctx.cmd.split(".")[2],
          ctx.cmd.split(".")[0],
          ctx.bank.dpi.herbs
        );
        return;
      case `herbs.sell.all`:
        marketSell(
          ctx.cmd.split(".")[2],
          ctx.cmd.split(".")[0],
          ctx.bank.dpi.herbs
        );
        return;
      case "ore":
        ctx.reply(
          `Текущий курс 1 ${lang.ore} = ${ctx.bank.dpi.ore} ${lang.curr}\nСколько вы хотите продать?.`,
          null,
          Markup.keyboard([
            Markup.button(100, "default", `${ctx.cmd}.sell.100`),
            Markup.button(500, "default", `${ctx.cmd}.sell.500`),
            Markup.button(1000, "default", `${ctx.cmd}.sell.1000`),
            Markup.button(lang.all, "default", `${ctx.cmd}.sell.all`),
          ]).inline()
        );
        return;
      case "ore.sell.100":
        marketSell(
          ctx.cmd.split(".")[2],
          ctx.cmd.split(".")[0],
          ctx.bank.dpi.ore
        );
        return;
      case "ore.sell.500":
        marketSell(
          ctx.cmd.split(".")[2],
          ctx.cmd.split(".")[0],
          ctx.bank.dpi.ore
        );
        return;
      case "ore.sell.1000":
        marketSell(
          ctx.cmd.split(".")[2],
          ctx.cmd.split(".")[0],
          ctx.bank.dpi.ore
        );
        return;
      case `ore.sell.all`:
        marketSell(
          ctx.cmd.split(".")[2],
          ctx.cmd.split(".")[0],
          ctx.bank.dpi.ore
        );
        return;
      case "sand":
        ctx.reply(
          `Текущий курс 1 ${lang.sand} = ${ctx.bank.dpi.sand} ${lang.curr}\nСколько вы хотите продать?.`,
          null,
          Markup.keyboard([
            Markup.button(100, "default", `${ctx.cmd}.sell.100`),
            Markup.button(500, "default", `${ctx.cmd}.sell.500`),
            Markup.button(1000, "default", `${ctx.cmd}.sell.1000`),
            Markup.button(lang.all, "default", `${ctx.cmd}.sell.all`),
          ]).inline()
        );
        return;
      case "sand.sell.100":
        marketSell(
          ctx.cmd.split(".")[2],
          ctx.cmd.split(".")[0],
          ctx.bank.dpi.sand
        );
        return;
      case "sand.sell.500":
        marketSell(
          ctx.cmd.split(".")[2],
          ctx.cmd.split(".")[0],
          ctx.bank.dpi.sand
        );
        return;
      case "sand.sell.1000":
        marketSell(
          ctx.cmd.split(".")[2],
          ctx.cmd.split(".")[0],
          ctx.bank.dpi.sand
        );
        return;
      case `sand.sell.all`:
        marketSell(
          ctx.cmd.split(".")[2],
          ctx.cmd.split(".")[0],
          ctx.bank.dpi.sand
        );
        return;
      case "wood":
        ctx.reply(
          `Текущий курс 1 ${lang.wood} = ${ctx.bank.dpi.wood} ${lang.curr}\nСколько вы хотите продать?.`,
          null,
          Markup.keyboard([
            Markup.button(100, "default", `${ctx.cmd}.sell.100`),
            Markup.button(500, "default", `${ctx.cmd}.sell.500`),
            Markup.button(1000, "default", `${ctx.cmd}.sell.1000`),
            Markup.button(lang.all, "default", `${ctx.cmd}.sell.all`),
          ]).inline()
        );
        return;
      case "wood.sell.100":
        marketSell(
          ctx.cmd.split(".")[2],
          ctx.cmd.split(".")[0],
          ctx.bank.dpi.wood
        );
        return;
      case "wood.sell.500":
        marketSell(
          ctx.cmd.split(".")[2],
          ctx.cmd.split(".")[0],
          ctx.bank.dpi.wood
        );
        return;
      case "wood.sell.1000":
        marketSell(
          ctx.cmd.split(".")[2],
          ctx.cmd.split(".")[0],
          ctx.bank.dpi.wood
        );
        return;
      case `wood.sell.all`:
        marketSell(
          ctx.cmd.split(".")[2],
          ctx.cmd.split(".")[0],
          ctx.bank.dpi.wood
        );
        return;
      case lang.land:
        return plot.plotMenu(ctx);
      case "plot.well":
        return plot.well(ctx);
      case "build.well":
        return plot.buildWell(ctx);
      case "trow.potion.well":
        return plot.trowPotion(ctx);
      case "plot.wh":
        return plot.wh(ctx);
      case "build.wh":
        return plot.buildWh(ctx);
      case "plot.house":
        return plot.house(ctx);
      case "build.house":
        return plot.buildHouse(ctx);
      case "plot.temple":
        return plot.temple(ctx);
      case "build.temple":
        return plot.buildTemple(ctx);
      case "plot.upgrade.Lv1":
        return plot.plotUpgradeLv1(ctx);
      case "plot.build.Lv1":
        return plot.plotBuildLv1(ctx);
      case "plot.upgrade.Lv2":
        return plot.plotUpgradeLv2(ctx);
      case "plot.build.Lv2":
        return plot.plotBuildLv2(ctx);
      case "plot.upgrade.Lv3":
        //TODO
        return ctx.reply(lang.inDev);
      case "plot.build.Lv3":
        //TODO
        return ctx.reply(lang.inDev);
      case "plot.align":
        if (ctx.user.plot.own) return ctx.reply("У вас уже есть участок");
        if (ctx.user.inv.sand < 5000) return ctx.reply("Недостаточно средств");
        await ctx.user.dec("inv", 5000, "sand");
        await ctx.user.set("plot", true, "own");
        await ctx.reply("Теперь на вашем участке можно строить");
        return;
      case "inDev":
        return ctx.reply(lang.inDev);
      case lang.nick:
        return await ctx.reply(
          `Смена имени производится Командой:\n📑 Смена_Имени [Имя]\n❗️ Цена 10000 ${lang.curr}`
        );
      default:
        if (ctx.message.id === 0) return;
        // await ctx.reply(`${ctx.message.text} ${lang.notcmd}`)

        return;
    }
  });
};
