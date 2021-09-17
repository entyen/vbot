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
                    Markup.button('Приключения', 'primary', 'adventure'),
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
    inv += `\n${!ctx.user.items.fishingRod ? '' : `🎣 Удочка: Есть\n`}`
    inv += `${ctx.user.items.bait === 0 ? '' : `🐛 Наживка: ${ctx.user.items.bait}\n`}`
    inv += `${ctx.user.items.energyPotion === 0 ? '' : `${lang.energyPotion}: ${ctx.user.items.energyPotion}\n`}`
    inv += `\n👜 Вес Инвентаря: ${ctx.user.currWeight.toFixed(0)}/${ctx.user.invWeight}\n`

    return ctx.reply(`Инвентарь\n ${inv}`)
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
    let time = {}
    time.newby = ((ctx.user.buffs.newby - ctx.timestamp)/60/60/1000).toFixed(0)
    time.vip = ((ctx.user.buffs.vip - ctx.timestamp)/60/60/1000).toFixed(0)
    time.rate1st = ((ctx.user.buffs.rate1st - ctx.timestamp)/60/1000).toFixed(0)
    time.rate2st = ((ctx.user.buffs.rate2st - ctx.timestamp)/60/1000).toFixed(0)
    time.rate3st = ((ctx.user.buffs.rate3st - ctx.timestamp)/60/1000).toFixed(0)
    time.rate9st = ((ctx.user.buffs.rate9st - ctx.timestamp)/60/1000).toFixed(0)
    time.energyWell = ((ctx.user.buffs.energyWell - ctx.timestamp)/60/1000)
    let buffs = `Баффы:`
    buffs += `${time.rate1st <= 0 ? `` : `\n${lang.Rate1St}: ${time.rate1st}мин.${lang.Rate1StMsg}`}`
    buffs += `${time.rate2st <= 0 ? `` : `\n${lang.Rate2St}: ${time.rate2st}мин.${lang.Rate2StMsg}`}`
    buffs += `${time.rate3st <= 0 ? `` : `\n${lang.Rate3St}: ${time.rate3st}мин.${lang.Rate3StMsg}`}`
    buffs += `${time.rate9st <= 0 ? `` : `\n${lang.Rate9St}: ${time.rate9st}мин.${lang.Rate9StMsg}`}`
    buffs += `${time.energyWell <= 0 ? `` : `\n${lang.energyWell}: ${time.energyWell >= 60 ? (time.energyWell/60).toFixed(0) + 'ч.' : time.energyWell.toFixed(0) + 'мин.'}${lang.energyWellMsg}`}`
    buffs += `${time.newby <= 0 ? `` : `\n${lang.newBy}: ${time.newby}ч.${lang.newByMsg}`}`
    buffs += `${time.vip <= 0 ? `` : `\n\n${lang.Vip}: ${time.vip}ч.${lang.VipMsg}`}`

    return ctx.reply(`${cmba.join().replace(/,/g, ' ').replace(cmba[0], '')} ${buffs}`)
}

module.exports = { menu }