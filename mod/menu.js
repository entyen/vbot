const Markup = require('node-vk-bot-api/lib/markup')
const fs = require('fs')
let lang = JSON.parse(fs.readFileSync(`./lang/ru.json`, 'utf-8'))

async function menu(ctx) {
    if (ctx.user.acclvl >= 4) {
        return await ctx.reply(lang.navm, null, Markup
            .keyboard([
                [
                    Markup.button(lang.crafts, 'primary'),
                    Markup.button(lang.market, 'primary'),
                ],
                [
                    Markup.button(ctx.user.f_name, 'secondary'),
                    Markup.button(lang.setting, 'positive'),
                    Markup.button(`${ctx.user.balance} ${lang.curr}`, 'secondary'),
                ],
                [
                    Markup.button(`${lang.land}`, 'secondary'),
                ],
            ])
        )
    } else
        return await ctx.reply(lang.navm, null, Markup
            .keyboard([
                [
                    Markup.button(lang.crafts, 'primary'),
                    Markup.button(lang.market, 'primary'),
                ],
                [
                    Markup.button(ctx.user.f_name, 'secondary'),
                    Markup.button(lang.setting, 'positive'),
                    Markup.button(`${ctx.user.balance} ${lang.curr}`, 'secondary'),
                ],
                [
                    Markup.button(`${lang.land}`, 'secondary'),
                ],
            ])
    )
}

async function profile(ctx) {
    let text = ``
    text += `🔎 UID: ${ctx.user.uid}\n`
    text += ` 👤 Статус Аккаунта: ${ctx.user._acclvl}\n`
    text += `🌟 Уровень: ${ctx.user.level} [${ctx.user.exp}/${100*(ctx.user.level+1)}]\n`
    text += `🧤 Расса: ${ctx.user.race === 0 && 'Без Рассы'}\n`
    text += `⚡ Очки Энергии: ${ctx.user.energy} из ${100 * ctx.user.boosters.energyCount}\n`
    text += `⚡ Восстановление Энергии: ${ctx.user.boosters.energyRegen} в 3 минуты\n`
    text += `${ctx.user.alert ? '🔔' : '🔕'} Уведомления: ${ctx.user.alert ? 'Включены' : 'Выключены'}\n`
    text += `\n📗 Дата регистрации: ${ctx.user.regDate}`

    return await ctx.reply(`Профиль\n ${text}`)
}

async function inventory(ctx) {
    let inv = ``
    inv += `💠 Оргулы: ${ctx.user.balance}\n`
    inv += `${ctx.user.inv.herbs === 0 ? '' : `${lang.herbs}: ${ctx.user.inv.herbs}\n`}`
    inv += `${ctx.user.inv.ore === 0 ? '' : `${lang.ore}: ${ctx.user.inv.ore}\n`}`
    inv += `${ctx.user.inv.sand === 0 ? '' : `${lang.sand}: ${ctx.user.inv.sand}\n`}`
    inv += `${ctx.user.inv.wood === 0 ? '' : `${lang.wood}: ${ctx.user.inv.wood}\n`}`
    inv += `${ctx.user.inv.fish === 0 ? '' : `${lang.fish}: ${ctx.user.inv.fish}\n`}`
    inv += `${ctx.user.inv.rareHerbs === 0 ? '' : `🍀 Редкие Травы: ${ctx.user.inv.rareHerbs}\n`}`
    inv += `${ctx.user.inv.rareOre === 0 ? '' : `💎 Редкая Руда: ${ctx.user.inv.rareOre}\n`}`
    inv += `${ctx.user.inv.rareFish === 0 ? '' : `🐡 Редкая Рыба: ${ctx.user.inv.rareFish}\n`}`
    inv += `\n${!ctx.user.items.fishingRod ? '' : `🎣 Удочка: Есть\n`}`
    inv += `${ctx.user.items.bait === 0 ? '' : `🐛 Наживка: ${ctx.user.items.bait}\n`}`
    inv += `${ctx.user.items.energyPotion === 0 ? '' : `🧪 Зелье ОЭ: ${ctx.user.items.energyPotion}\n`}`
    inv += `\n👜 Вес Инвентаря: ${ctx.user.currWeight}/${ctx.user.invWeight}\n`

    return await ctx.reply(`Инвентарь\n ${inv}`)
}

async function setting(ctx) {
    const alertState = ctx.user.alert ? 'positive' : 'negative'
    const acclvl = ctx.user.acclvl > 5 ? 'negative' : ctx.user.acclvl > 0 ? 'primary' : 'secondary'
    await ctx.reply('Настройки', null, Markup
        .keyboard([
            [
                Markup.button(`${ctx.user._acclvl}`, acclvl),
            ],
            [
                Markup.button(lang.alert, alertState),
                // Markup.button(lang.nick, 'default'),
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




module.exports = { menu, profile, inventory, setting }