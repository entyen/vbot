const Markup = require("node-vk-bot-api/lib/markup");
const fs = require("fs");
let lang = JSON.parse(fs.readFileSync(`./lang/ru.json`, "utf-8"));

const menu = {};

menu.main = (ctx) => {
  if (ctx.user.acclvl >= 4) {
    return ctx.reply(
      lang.navm,
      null,
      Markup.keyboard([
        [
          Markup.button(lang.crafts, "primary"),
          Markup.button(lang.market, "primary"),
        ],
        [
          Markup.button(ctx.user.f_name, "secondary", "profile"),
          Markup.button(lang.setting, "positive"),
          Markup.button(
            `${ctx.user.balance} ${lang.curr}`,
            "secondary",
            "inventory"
          ),
        ],
        [
          Markup.button(`${lang.land}`, "secondary"),
          Markup.button("Приключения", "primary", "adventure"),
        ],
      ])
    );
  } else
    return ctx.reply(
      lang.navm,
      null,
      Markup.keyboard([
        [
          Markup.button(lang.crafts, "primary"),
          Markup.button(lang.market, "primary"),
        ],
        [
          Markup.button(ctx.user.f_name, "secondary", "profile"),
          Markup.button(lang.setting, "positive"),
          Markup.button(
            `${ctx.user.balance} ${lang.curr}`,
            "secondary",
            "inventory"
          ),
        ],
        [Markup.button(`${lang.land}`, "secondary")],
      ])
    );
};

menu.profile = (ctx) => {
  let text = ``;
  text += `🆔 ${ctx.user.uid}\n`;
  text += `👤 Статус Аккаунта: ${ctx.user._acclvl}\n`;
  text += `🌟 Уровень: ${ctx.user.level} [${ctx.user.exp}/${
    100 * (ctx.user.level + 1)
  }]\n`;
  text += `🧤 Раса: ${
    ctx.user.race === 0
      ? "Без Расы"
      : ctx.user.race === 1
      ? lang.alv
      : ctx.user.race === 2
      ? lang.elven
      : ctx.user.race === 3
      ? lang.darkElven
      : ctx.user.race === 4
      ? lang.dwarf
      : null
  }\n`;
  text += `⚡ Очки Энергии: ${ctx.user.energy} из ${Math.round(
    100 * ctx.user.boosters.energyCount
  )}\n`;
  text += `⚡ Восстановление Энергии: ${ctx.user.boosters.energyRegen} в 3 минуты\n`;
  text += `${ctx.user.alert ? "🔔" : "🔕"} Уведомления: ${
    ctx.user.alert ? "Включены" : "Выключены"
  }\n`;
  text += `\n📗 Дата регистрации: ${ctx.user.regDate}`;

  return ctx.reply(
    `Профиль\n${text}`,
    null,
    Markup.keyboard([
      Markup.button("Характеристики", "secondary", "char"),
      Markup.button("Экипировка", "secondary", "equip"),
      Markup.button("Ремесла", "secondary", "craftSkils"),
      Markup.button("Бафы", "secondary", "buffs"),
    ]).inline()
  );
};

menu.inventory = (ctx) => {
  let inv = ``;
  inv += `💠 Оргулы: ${ctx.user.balance}\n`;
  inv += `${
    ctx.user.inv.vinmt === 0 ? "" : `${lang.vinmt}: ${ctx.user.inv.vinmt}\n`
  }`;
  inv += `${
    ctx.user.inv.herbs === 0 ? "" : `${lang.herbs}: ${ctx.user.inv.herbs}\n`
  }`;
  inv += `${
    ctx.user.inv.ore === 0 ? "" : `${lang.ore}: ${ctx.user.inv.ore}\n`
  }`;
  inv += `${
    ctx.user.inv.sand === 0 ? "" : `${lang.sand}: ${ctx.user.inv.sand}\n`
  }`;
  inv += `${
    ctx.user.inv.wood === 0 ? "" : `${lang.wood}: ${ctx.user.inv.wood}\n`
  }`;
  inv += `${
    ctx.user.inv.fish === 0 ? "" : `${lang.fish}: ${ctx.user.inv.fish}\n`
  }`;
  inv += `\n${
    ctx.user.inv.rareHerbs === 0
      ? ""
      : `${lang.rareHerbs}: ${ctx.user.inv.rareHerbs}\n`
  }`;
  inv += `${
    ctx.user.inv.rareSand === 0
      ? ""
      : `${lang.rareSand}: ${ctx.user.inv.rareSand}\n`
  }`;
  inv += `${
    ctx.user.inv.rareOre === 0
      ? ""
      : `${lang.rareOre}: ${ctx.user.inv.rareOre}\n`
  }`;
  inv += `${
    ctx.user.inv.rareWood === 0
      ? ""
      : `${lang.rareWood}: ${ctx.user.inv.rareWood}\n`
  }`;
  inv += `${
    ctx.user.inv.rareFish === 0
      ? ""
      : `${lang.rareFish}: ${ctx.user.inv.rareFish}\n`
  }`;
  inv += `\n⚖️ Вес: ${ctx.user.currWeight.toFixed(0)}/${ctx.user.invWeight}\n`;

  return ctx.reply(
    `Склад Ресурсов\n${inv}`,
    null,
    Markup.keyboard([Markup.button("Предметы", "secondary", "invent")]).inline()
  );
};

menu.craftSkils = async (ctx) => {
  let inv = ``;
  const massSt = Object.keys(ctx.user.skils);
  for (i = 0; i < massSt.length; i++) {
    inv += `${lang.skil[massSt[i]]}: ${ctx.user.skils[massSt[i]]} [${
      ctx.user.skilsExp[massSt[i]]
    }/${20 * (ctx.user.skils[massSt[i]] + 1)}]\n`;
  }
  return ctx.reply(`Ремесла\n\n${inv}`);
};

menu.char = async (ctx) => {
  let inv = ``;
  const massCh = Object.keys(ctx.user.char);
  inv += `${lang[massCh[2]]}: ${ctx.user.char[massCh[2]]} из ${
    ctx.user.char[massCh[0]]
  }\n`;
  inv += `${lang[massCh[3]]}: ${ctx.user.char[massCh[3]]} из ${
    ctx.user.char[massCh[1]]
  }\n`;
  for (i = 4; i < massCh.length; i++) {
    inv += `${lang[massCh[i]]}: ${ctx.user.char[massCh[i]]}\n`;
  }
  inv += "\n";
  const massSt = Object.keys(ctx.user.stat);
  for (i = 0; i < massSt.length; i++) {
    inv += `${lang[massSt[i]]}: ${ctx.user.stat[massSt[i]]}\n`;
  }
  return ctx.reply(`Характеристики Персонажа\n\n${inv}`);
};

menu.equip = async (ctx, itemdb) => {
  const item = async (n) => {
    const j = ctx.user.invent.find(
      (x) => x._id.toString() === ctx.user.equip[n].item.toString()
    );
    if (!j) {
      return `${lang[n]}: Пусто`;
    }
    if (!j.equiped) {
      return `${lang[n]}: Пусто`;
    }
    const fitem = await itemdb.findById(j.item);
    return `${lang[n]}: ${fitem.name} ${j.ench === 0 ? "" : `+${j.ench}`}`;
  };
  let inv = ``;
  inv += `\n${await item("fishRod")}\n`;
  inv += `${await item("weap")}\n`;
  inv += `${await item("armor")}\n`;
  inv += `${await item("ring")}\n`;

  return ctx.reply(`Экипировка Персонажа\n${inv}`);
};

menu.invent = async (ctx, itemdb) => {
  const itemS = async () => {
    const item = [];
    for (i = 0; i < ctx.user.invent.length; i++) {
      item[i] = await itemdb.findById(ctx.user.invent[i].item);
    }
    return item;
  };
  const item = await itemS();
  let inv = ``;
  item.forEach((x, y, z) => {
    inv += `[${y + 1}] ${item[y].name}${
      ctx.user.invent[y].quantity === 1
        ? ``
        : `: ${ctx.user.invent[y].quantity}`
    } ${ctx.user.invent[y].ench === 0 ? `` : `+${ctx.user.invent[y].ench}`} ${
      ctx.user.invent[y].equiped ? `(Экипированно)` : ``
    }\n`;
  });
  inv += `\n${
    ctx.user.items.bait === 0 ? "" : `🐛 Наживка: ${ctx.user.items.bait}\n`
  }`;
  inv += `${
    ctx.user.items.energyPotion === 0
      ? ""
      : `${lang.energyPotion}: ${ctx.user.items.energyPotion}\n`
  }`;
  inv += `\n👜 Ячеек Занято: ${ctx.user.invent.length}/10\n`;

  return ctx.reply(
    `Инвентарь Предметов\n${inv}`,
    null,
    Markup.keyboard([
      Markup.button("Ресурсы", "secondary", "inventory"),
    ]).inline()
  );
};

menu.setting = (ctx) => {
  const alertState = ctx.user.alert ? "positive" : "negative";
  const acclvl =
    ctx.user.acclvl > 5
      ? "negative"
      : ctx.user.acclvl > 0
      ? "primary"
      : "secondary";
  ctx.user._acclvl =
    ctx.user.acclvl == 0
      ? lang.user
      : ctx.user.acclvl == 1
      ? lang.vip
      : ctx.user.acclvl == 2
      ? lang.plat
      : ctx.user.acclvl == 7
      ? lang.dev
      : ctx.user.acclvl == 6
      ? lang.adm
      : ctx.user.acclvl == 5
      ? lang.moder
      : ctx.user.acclvl;

  ctx.reply(
    "Настройки",
    null,
    Markup.keyboard([
      [Markup.button(`${ctx.user._acclvl}`, acclvl)],
      [
        Markup.button(lang.alert, alertState),
        Markup.button(lang.nick, "default"),
        Markup.button("Репoрт", "default", "report"),
      ],
      [
        Markup.button(lang.export, "primary", "export"),
        Markup.button(lang.back, "negative", "menu"),
      ],
    ])
  );
  return;
};

menu.export = (ctx, crypto) => {
  if (ctx.user.acclvl < 1) return ctx.reply("Доступно только для VIP и выше");
  ctx.reply(
    `Ссылка на бота: https://t.me/Vinteum_bot?start\nАвторизировавшись в боте введите команду`
  );
  ctx.reply(`/import ${crypto.enc(ctx.user._id.toString())}`);
};

menu.buffs = (ctx) => {
  const cmba = ctx.message.text.toLowerCase().split(" ");
  const buffTime = (msg, lng, lngM) => {
    let time = Math.round((msg - ctx.timestamp) / 60 / 1000);
    return time < 0
      ? ""
      : time > 60
      ? `\n${lang[lng]} ${(time / 60).toFixed(0)} ч.${lang[lngM]}`
      : `\n${lang[lng]} ${time} мин.${lang[lngM]}`;
  };
  let buffs = `Баффы:`;
  for (const [key, value] of Object.entries(ctx.user.buffs)) {
    if (key == "vip") {
      buffs += `\n${buffTime(ctx.user.buffs[key], key, `${key}Msg`)}`;
    } else {
      buffs += buffTime(ctx.user.buffs[key], key, `${key}Msg`);
    }
  }

  return ctx.reply(
    `${cmba.join().replace(/,/g, " ").replace(cmba[0], "")}${buffs}`
  );
};

module.exports = { menu };
