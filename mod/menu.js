const Markup = require('node-vk-bot-api/lib/markup')
const fs = require('fs')
let lang = JSON.parse(fs.readFileSync(`./lang/ru.json`, 'utf-8'))

const menu = {}

menu.main = (ctx) => {
    if (ctx.user.acclvl >= 4) {
        return ctx.reply(lang.navm, null, Markup
            .keyboard([
                [
                    Markup.button(lang.crafts, 'primary'),
                    Markup.button(lang.market, 'primary'),
                ],
                [
                    Markup.button(ctx.user.f_name, 'secondary', 'profile'),
                    Markup.button(lang.setting, 'positive'),
                    Markup.button(`${ctx.user.balance} ${lang.curr}`, 'secondary', 'inventory'),
                ],
                [
                    Markup.button(`${lang.land}`, 'secondary'),
                    Markup.button('Приключения', 'primary', 'adventure'),
                ],
            ])
        )
    } else
        return ctx.reply(lang.navm, null, Markup
            .keyboard([
                [
                    Markup.button(lang.crafts, 'primary'),
                    Markup.button(lang.market, 'primary'),
                ],
                [
                    Markup.button(ctx.user.f_name, 'secondary', 'profile'),
                    Markup.button(lang.setting, 'positive'),
                    Markup.button(`${ctx.user.balance} ${lang.curr}`, 'secondary', 'inventory'),
                ],
                [
                    Markup.button(`${lang.land}`, 'secondary'),
                ],
            ])
    )
}

menu.profile = (ctx) => {
    let text = ``
    text += `🆔 ${ctx.user.uid}\n`
    text += `👤 Статус Аккаунта: ${ctx.user._acclvl}\n`
    text += `🌟 Уровень: ${ctx.user.level} [${ctx.user.exp}/${100*(ctx.user.level+1)}]\n`
    text += `🧤 Раса: ${ctx.user.race === 0 ? 'Без Расы': ctx.user.race === 1 ? lang.alv: ctx.user.race === 2 ? lang.elven: ctx.user.race === 3 ? lang.darkElven: ctx.user.race === 4 ? lang.dwarf : null}\n`
    text += `⚡ Очки Энергии: ${ctx.user.energy} из ${100 * ctx.user.boosters.energyCount}\n`
    text += `⚡ Восстановление Энергии: ${ctx.user.boosters.energyRegen} в 3 минуты\n`
    text += `${ctx.user.alert ? '🔔' : '🔕'} Уведомления: ${ctx.user.alert ? 'Включены' : 'Выключены'}\n`
    text += `\n📗 Дата регистрации: ${ctx.user.regDate}`

    return ctx.reply(`Профиль\n ${text}`)
}

menu.inventory = (ctx) => {
    let inv = ``
    inv += `💠 Оргулы: ${ctx.user.balance}\n`
    inv += `${ctx.user.inv.vinmt === 0 ? '' : `${lang.vinmt}: ${ctx.user.inv.vinmt}\n`}`
    inv += `${ctx.user.inv.herbs === 0 ? '' : `${lang.herbs}: ${ctx.user.inv.herbs}\n`}`
    inv += `${ctx.user.inv.ore === 0 ? '' : `${lang.ore}: ${ctx.user.inv.ore}\n`}`
    inv += `${ctx.user.inv.sand === 0 ? '' : `${lang.sand}: ${ctx.user.inv.sand}\n`}`
    inv += `${ctx.user.inv.wood === 0 ? '' : `${lang.wood}: ${ctx.user.inv.wood}\n`}`
    inv += `${ctx.user.inv.fish === 0 ? '' : `${lang.fish}: ${ctx.user.inv.fish}\n`}`
    inv += `${ctx.user.inv.rareHerbs === 0 ? '' : `${lang.rareHerbs}: ${ctx.user.inv.rareHerbs}\n`}`
    inv += `${ctx.user.inv.rareSand === 0 ? '' : `${lang.rareSand}: ${ctx.user.inv.rareSand}\n`}`
    inv += `${ctx.user.inv.rareOre === 0 ? '' : `${lang.rareOre}: ${ctx.user.inv.rareOre}\n`}`
    inv += `${ctx.user.inv.rareWood === 0 ? '' : `${lang.rareWood}: ${ctx.user.inv.rareWood}\n`}`
    inv += `${ctx.user.inv.rareFish === 0 ? '' : `${lang.rareFish}: ${ctx.user.inv.rareFish}\n`}`
    inv += `\n${ctx.user.items.bait === 0 ? '' : `🐛 Наживка: ${ctx.user.items.bait}\n`}`
    inv += `${ctx.user.items.energyPotion === 0 ? '' : `${lang.energyPotion}: ${ctx.user.items.energyPotion}\n`}`
    inv += `\n⚖️ Вес: ${ctx.user.currWeight.toFixed(0)}/${ctx.user.invWeight}\n`

    return ctx.reply(`Склад Ресурсов\n ${inv}`, null, Markup
        .keyboard([
            Markup.button('Предметы', 'secondary', 'invent'),
        ]).inline()
    )
}

menu.invent = async (ctx, itemdb) => {
    const itemS = async () => {
        const item = []
        for (i = 0; i < ctx.user.invent.length; i++) {
            item[i] = await itemdb.findById(ctx.user.invent[i].item)
        }
        return item
    }
    const item = await itemS()
    let inv = ``
    item.forEach((x,y,z) => {
        inv += `${ctx.user.invent[y].quantity === 1 ? `` : `[${ctx.user.invent[y].quantity}]`} ${item[y].name} ${ctx.user.invent[y].ench === 0 ? `` : `+${ctx.user.invent[y].ench}`}\n`
    })
    inv += `\n👜 Ячеек Занято: ${ctx.user.invent.length}/10\n`

    return ctx.reply(`Инвентарь Предметов\n ${inv}`, null, Markup
        .keyboard([
            Markup.button('Ресурсы', 'secondary', 'inventory'),
        ]).inline()
    )
}

menu.setting = (ctx) => {
    const alertState = ctx.user.alert ? 'positive' : 'negative'
    const acclvl = ctx.user.acclvl > 5 ? 'negative' : ctx.user.acclvl > 0 ? 'primary' : 'secondary'
    ctx.user._acclvl = ctx.user.acclvl == 0 ? lang.user : ctx.user.acclvl == 1 ? lang.vip : ctx.user.acclvl == 2 ? lang.plat :
        ctx.user.acclvl == 7 ? lang.dev : ctx.user.acclvl == 6 ? lang.adm : ctx.user.acclvl == 5 ? lang.moder : ctx.user.acclvl

    ctx.reply('Настройки', null, Markup
        .keyboard([
            [
                Markup.button(`${ctx.user._acclvl}`, acclvl),
            ],
            [
                Markup.button(lang.alert, alertState),
                Markup.button(lang.nick, 'default'),
                Markup.button('Репoрт', 'default', 'report'),
            ],
            [
                Markup.button('Бафы', 'default', 'buffs'),
                Markup.button(lang.back, 'negative', 'menu'),
            ],
        ])
    )
    return
}

menu.buffs = (ctx) => {
    const cmba = ctx.message.text.toLowerCase().split(' ')
    const buffTime = (msg, lng, lngM) => {
        let time = Math.round((msg - ctx.timestamp)/60/1000)
        return time < 0 ? '' : time > 60 ? `\n${lang[lng]} ${(time/60).toFixed(0)} ч.${lang[lngM]}` : `\n${lang[lng]} ${time} мин.${lang[lngM]}`
    }
    let buffs = `Баффы:`
    buffs += buffTime(ctx.user.buffs.rate1st, 'Rate1St', 'Rate1StMsg')
    buffs += buffTime(ctx.user.buffs.rate2st, 'Rate2St', 'Rate2StMsg')
    buffs += buffTime(ctx.user.buffs.rate3st, 'Rate3St', 'Rate3StMsg')
    buffs += buffTime(ctx.user.buffs.rate9st, 'Rate9St', 'Rate9StMsg')
    buffs += buffTime(ctx.user.buffs.energyWell, 'energyWell', 'energyWellMsg')
    buffs += buffTime(ctx.user.buffs.newby, 'newBy', 'newByMsg')
    buffs += `\n ${buffTime(ctx.user.buffs.vip, 'Vip', 'VipMsg')}`

    return ctx.reply(`${cmba.join().replace(/,/g, ' ').replace(cmba[0], '')} ${buffs}`)
}

module.exports = { menu }