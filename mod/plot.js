
const Markup = require('node-vk-bot-api/lib/markup')
const fs = require('fs')
const { keyboard } = require('node-vk-bot-api/lib/markup')
let lang = JSON.parse(fs.readFileSync(`./lang/ru.json`, 'utf-8'))

function plotMenu(ctx) {
    let plot = ``
    plot += `🏠 Дом: ${ctx.user.plot.house === 0 ? 'Нет' : 'Есть'}\n`
    plot += `🏚 Склад: ${ctx.user.plot.wh === 0 ? 'Нет' : 'Есть'}\n`
    plot += `⛪️ Храм: ${ctx.user.plot.temple === 0 ? 'Нет' : 'Есть'}\n`
    plot += `🕳 Колодец: ${ctx.user.plot.well === 0 ? 'Нет' : 'Есть'}\n`
    plot += ctx.user.plot.size === 1 ? `⛰ Рудник: ${ctx.user.plot.mc === 0 ? 'Нет' : 'Есть'}\n` : ``
    plot += ctx.user.plot.size === 1 ? `🌲 Лес: ${ctx.user.plot.well === 0 ? 'Нет' : 'Есть'}\n` : ``

    plot += `\n\nРазмер участка: ${ctx.user.plot.size === 0 ? 'Малый' : 'Средний'}`

    return ctx.reply(`Участок \n${plot}`, null, ctx.user.plot.size === 0 ? keyboardPlotLv0 : ctx.user.plot.size === 1 ? keyboardPlotLv1 : false)
}


const keyboardPlotLv0 = Markup.keyboard([
        [
            Markup.button('Дом', 'secondary', 'plot.house'),
            Markup.button('Храм', 'secondary', 'plot.temple'),
            Markup.button('Склад', 'secondary', 'plot.wh'),
        ],
        [
            Markup.button('Колодец', 'secondary', 'plot.well'),
        ],
        [
            Markup.button(lang.back, 'negative', 'menu'),
        ],
])

const keyboardPlotLv1 = Markup.keyboard([
        [
            Markup.button('Дом', 'secondary', 'plot.house'),
            Markup.button('Храм', 'secondary', 'plot.temple'),
            Markup.button('Склад', 'secondary', 'plot.wh'),
        ],
        [
            Markup.button('Рудник', 'secondary', 'plot.oreMine'),
            Markup.button('Колодец', 'secondary', 'plot.well'),
            Markup.button('Лес', 'secondary', 'plot.forest'),
        ],
        [
            Markup.button(lang.back, 'negative', 'menu'),
        ],
])

function well(ctx) {
    return ctx.reply(`🕳 Колодец позволит вам\n получать Эффект Восстановление Энергии\n⚒ На а его строительство требуется 3000 ${lang.ore} 1 ${lang.rareOre}`)
}

function house(ctx) {
    return ctx.reply(`🏠 Дом позволит вам заниматся созданием предметов\n⚒ На его строительство требуется`)
}

function temple(ctx) {
    return ctx.reply(`⛪️ Храм позволит вам получать Эффекты за поднесения богам\n⚒ На его строительство требуется`)
}

function wh(ctx) {
    return ctx.reply(`🏚 Склад позволит вам увеличить место в хранилище\n⚒ На его строительство требуется`)
}

module.exports = { plotMenu, well, house, temple, wh }