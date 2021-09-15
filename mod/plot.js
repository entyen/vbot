
const Markup = require('node-vk-bot-api/lib/markup')
const fs = require('fs')
const { keyboard } = require('node-vk-bot-api/lib/markup')
let lang = JSON.parse(fs.readFileSync(`./lang/ru.json`, 'utf-8'))

function plotMenu(ctx) {
    let plot = ``
    plot += `🏠 Дом: ${ctx.user.plot.house === 0 ? 'Нет' : 'Есть'}\n`
    plot += `🏚 Склад: ${ctx.user.plot.wh === 0 ? 'Нет' : 'Есть'}\n`
    plot += `⛪️ Храм: ${ctx.user.plot.temple === 0 ? 'Нет' : 'Есть'}\n`
    plot += ctx.user.plot.size === 1 ? `🕳 Колодец: ${ctx.user.plot.well === 0 ? 'Нет' : 'Есть'}\n` : ``
    plot += ctx.user.plot.size === 2 ? `⛰ Рудник: ${ctx.user.plot.mc === 0 ? 'Нет' : 'Есть'}\n` : ``
    plot += ctx.user.plot.size === 2 ? `🌲 Лес: ${ctx.user.plot.well === 0 ? 'Нет' : 'Есть'}\n` : ``

    plot += `\n\nРазмер участка: ${ctx.user.plot.size === 0 ? 'Малый' : 'Средний'}`

    return ctx.reply(`Участок \n${plot}`, null, ctx.user.plot.size === 0 ? keyboardPlot.Lv0 : ctx.user.plot.size === 1 ? keyboardPlot.Lv1 : ctx.user.plot.size === 2 ? keyboardPlot.Lv2 : false)
}

const keyboardPlot = {}

keyboardPlot.Lv0 = Markup.keyboard([
        [
            Markup.button('Дом', 'secondary', 'plot.house'),
            Markup.button('Храм', 'secondary', 'plot.temple'),
        ],
        [
            Markup.button('Склад', 'secondary', 'plot.wh'),
        ],
        [
            Markup.button('Улучшить', 'positive', 'plot.upgrade.Lv1'),
            Markup.button(lang.back, 'negative', 'menu'),
        ],
])

keyboardPlot.Lv1 = Markup.keyboard([
        [
            Markup.button('Дом', 'secondary', 'plot.house'),
            Markup.button('Храм', 'secondary', 'plot.temple'),
            Markup.button('Склад', 'secondary', 'plot.wh'),
        ],
        [
            Markup.button('Колодец', 'secondary', 'plot.well'),
        ],
        [
            Markup.button('Улучшить', 'positive', 'plot.upgrade.Lv2'),
            Markup.button(lang.back, 'negative', 'menu'),
        ],
])

keyboardPlot.Lv2 = Markup.keyboard([
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
            Markup.button('Улучшить', 'positive', 'plot.upgrade.Lv3'),
            Markup.button(lang.back, 'negative', 'menu'),
        ],
])


function plotUpgradeLv1(ctx) {
    if (ctx.user.plot.size === 0) {
        ctx.reply(`Улучшить учаток до Среднего\n⚒ На а его строительство требуется:\n${lang.sand} 10000`, null, build.plotLv1)
    }
    return 
}

async function buildWell(ctx) {
    if (ctx.user.inv.ore < 5000 && ctx.user.inv.rareOre < 2) return ctx.reply('Недостаточно средств')
        await ctx.user.dec('inv', 3000, 'ore')
        await ctx.user.dec('inv', 2, 'rareOre')
        await ctx.user.set('plot', 1, 'well')
        await ctx.reply('Теперь у вас есть колодец')
    return
}

async function plotBuildLv1(ctx) {
    if (ctx.user.plot.size >= 1) return ctx.reply('Ваш участок уже Средний')
    if (ctx.user.inv.sand < 10000) return ctx.reply('Недостаточно средств')
        await ctx.user.dec('inv', 10000, 'sand')
        await ctx.user.set('plot', 1, 'size')
        await ctx.reply('Теперь ваш участок Средний', null, keyboardPlot.Lv1 )
    return
}

async function trowPotion(ctx) {
    if (ctx.user.buffs.energyWell >= ctx.timestamp) { return ctx.reply( '⚡ Колодец уже активен' ) }
    if (ctx.user.items.energyPotion < 1) return ctx.reply('Недостаточно Зелий')
        await ctx.user.dec('items', 1, 'energyPotion')
        await ctx.user.set('buffs', (+ctx.timestamp + (4*60*60*1000)), 'energyWell')
        await ctx.reply('⚡ Колодец заряжен')
    return
}

function house(ctx) {
    if (ctx.user.plot.house === 0) {
        ctx.reply(`🏠 Дом позволит вам заниматся созданием предметов\n⚒ На его строительство требуется:\n${lang.wood} \n${lang.sand} `)
    }
    return 
}

function temple(ctx) {
    if (ctx.user.plot.temple === 0) {
        ctx.reply(`⛪️ Храм позволит вам получать Эффекты за подношения богам\n⚒ На его строительство требуется:\n${lang.wood} \n${lang.sand} \n${lang.rareOre} `)
    }
    return 
}

function wh(ctx) {
    if (ctx.user.plot.wh === 0) {
        ctx.reply(`🏚 Склад позволит вам увеличить место в хранилище\n⚒ На его строительство требуется:\n️${lang.ore} 4000\n${lang.sand} 7000\n️${lang.wood} 10000`)
    }
    return 
}

function well(ctx) {
    if (ctx.user.plot.well === 0) {
        ctx.reply(`🕳 Колодец позволит вам\n получать Эффект Восстановление Энергии\n⚒ На а его строительство требуется:\n${lang.ore} 3000\n${lang.rareOre} 2`, null, build.well)
    }else 
    if (ctx.user.buffs.energyWell >= ctx.timestamp) {
        ctx.reply(`🕳 Колодец: \n Заряжен и вы получаете +1 к регенерации Энергии ⚡`)
    } else {
        ctx.reply(`🕳 Колодец: \n Для получения ${lang.energyWell} вам нужно бросить в колодец Зелье ОЭ`, null, trowPotionWell)
    }
    return 
}

const build = {}

build.well = Markup.keyboard(
        [
            Markup.button('Построить', 'secondary', 'build.well'),
        ],
).inline()

build.plotLv1 = Markup.keyboard(
        [
            Markup.button('Улучшить участок до Среднего', 'default', 'plot.build.Lv1'),
        ]
).inline()

const trowPotionWell = Markup.keyboard([
        [
            Markup.button('Бросить', 'secondary', 'trow.potion.well'),
        ],
]).inline()

module.exports = { plotMenu, well, house, temple, wh, buildWell, trowPotion, plotUpgradeLv1, plotBuildLv1 }