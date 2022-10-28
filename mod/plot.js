
const Markup = require('node-vk-bot-api/lib/markup')
const fs = require('fs')
const { keyboard } = require('node-vk-bot-api/lib/markup')
let lang = JSON.parse(fs.readFileSync(`./lang/ru.json`, 'utf-8'))

const plot = {}

plot.plotMenu = (ctx) => {
    if (!ctx.user.plot.own) {
        return ctx.reply(`У вас есть участок но его поверхность неподходит для строительства необходимо ${resCheck(ctx, 'sand', 5000)} что-бы его выровнять.`, null, Markup
            .keyboard(
                [
                    Markup.button('Выровнять участок', 'default', 'plot.align'),
                ],
            )
            .inline()
        )
    }

    let plot = ``
    plot += `🏠 Дом: ${ctx.user.plot.house === 0 ? 'Нет' : 'Есть'}\n`
    plot += `🏚 Склад: ${ctx.user.plot.wh === 0 ? 'Нет' : `${ctx.user.plot.wh}ур`}\n`
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
            // Markup.button('Улучшить', 'positive', 'plot.upgrade.Lv3'),
            Markup.button(lang.back, 'negative', 'menu'),
        ],
])


plot.plotUpgradeLv1 = (ctx) => {
    if (ctx.user.plot.size >= 1) return ctx.reply('Участок уже Средний')
    if (ctx.user.plot.size === 0) {
        ctx.reply(`Улучшить учаcток до Среднего\n⚒ На а его строительство требуется:\n${resCheck(ctx, 'sand', 10000)}`, null, build.plotLv1)
    }
    return 
}

plot.plotUpgradeLv2 = (ctx) => {
    if (ctx.user.plot.size >= 2) return ctx.reply('Участок уже Большой')
    if (ctx.user.plot.size === 1) {
        ctx.reply(`Улучшить учаcток до Большого\n⚒ На а его строительство требуется:\n${resCheck(ctx, 'sand', 7000)}\n${resCheck(ctx, 'ore', 3000)}\n${resCheck(ctx, 'wood', 7000)}\n${resCheck(ctx, 'rareWood', 2)}\n${moneyCheck(ctx, 'balance', 100000)}`, null, build.plotLv2)
    }
    return 
}

plot.buildWell = async(ctx) => {
    if (ctx.user.plot.well >= 1) return ctx.reply('Уже есть колодец')
    if (ctx.user.inv.ore < 3000 || ctx.user.inv.rareOre < 1) return ctx.reply('Недостаточно средств')
        await ctx.user.dec('inv', 3000, 'ore')
        await ctx.user.dec('inv', 1, 'rareOre')
        await ctx.user.set('plot', 1, 'well')
        await ctx.reply('Теперь у вас есть колодец')
    return
}

plot.buildHouse = async(ctx) => {
    if (ctx.user.plot.house >= 1) return ctx.reply('Уже есть дом')
    if (ctx.user.inv.ore < 2000 || ctx.user.inv.sand < 1000 || ctx.user.inv.wood < 2000 || ctx.user.balance < 10000 ) return ctx.reply('Недостаточно средств')
        await ctx.user.dec('inv', 2000, 'ore')
        await ctx.user.dec('inv', 1000, 'sand')
        await ctx.user.dec('inv', 2000, 'wood')
        await ctx.user.dec('balance', 10000)
        await ctx.user.set('plot', 1, 'house')
        await ctx.reply('Теперь у вас есть дом')
    return
}

plot.buildWh = async(ctx) => {
    if (ctx.user.plot.wh >= 1) return ctx.reply('Уже есть склад')
    if (ctx.user.inv.ore < 1500 || ctx.user.inv.sand < 2000 || ctx.user.inv.wood < 7000) return ctx.reply('Недостаточно средств')
        await ctx.user.dec('inv', 1500, 'ore')
        await ctx.user.dec('inv', 2000, 'sand')
        await ctx.user.dec('inv', 7000, 'wood')
        await ctx.user.inc('invWeight', 20000)
        await ctx.user.set('plot', 1, 'wh')
        await ctx.reply('Теперь у вас есть склад')
    return
}

plot.plotBuildLv1 = async(ctx) => {
    if (ctx.user.plot.size >= 1) return ctx.reply('Ваш участок уже Средний')
    if (ctx.user.inv.sand < 10000) return ctx.reply('Недостаточно средств')
        await ctx.user.dec('inv', 10000, 'sand')
        await ctx.user.set('plot', 1, 'size')
        await ctx.reply('Теперь ваш участок Средний', null, keyboardPlot.Lv1 )
    return
}

plot.plotBuildLv2 = async(ctx) => {
    if (ctx.user.plot.size >= 2) return ctx.reply('Ваш участок уже Большой')
    if (ctx.user.inv.ore < 3000 || ctx.user.inv.sand < 7000 || ctx.user.inv.wood < 7000 || ctx.user.inv.rareWood < 2 || ctx.user.balance < 100000) return ctx.reply('Недостаточно средств')
        await ctx.user.dec('inv', 3000, 'ore')
        await ctx.user.dec('inv', 7000, 'sand')
        await ctx.user.dec('inv', 7000, 'wood')
        await ctx.user.dec('inv', 2, 'rareWood')
        await ctx.user.dec('balance', 100000)
        await ctx.user.set('plot', 2, 'size')
        await ctx.reply('Теперь ваш участок Средний', null, keyboardPlot.Lv1 )
    return
}

plot.trowPotion = async(ctx) => {
    if (ctx.user.buffs.energyWell >= ctx.timestamp) { return ctx.reply( '⚡ Колодец уже активен' ) }
    if (ctx.user.items.energyPotion < 1) return ctx.reply('Недостаточно Зелий')
        await ctx.user.dec('items', 1, 'energyPotion')
        await ctx.user.set('buffs', (+ctx.timestamp + (4*60*60*1000)), 'energyWell')
        await ctx.reply('⚡ Колодец заряжен')
    return
}

const resCheck = (ctx, x, y) => {
    return `${ctx.user.inv[x] >= y ? '✔️' : '❌'} ${lang[x]} ${y}`
}

const moneyCheck = (ctx, x, y) => {
    return `${ctx.user.balance >= y ? '✔️' : '❌'} ${lang[x]} ${y}`
}

plot.house = (ctx) => {
    if (ctx.user.plot.house === 0) {
        ctx.reply(`🏠 Дом позволит вам заниматся созданием предметов\n⚒ На его строительство требуется:\n${resCheck(ctx, 'ore', 2000)}\n︎${resCheck(ctx, 'sand', 1000)}\n︎${resCheck(ctx, 'wood', 2000)}\n${moneyCheck(ctx, 'balance', 10000)}`, null, build.house)
    }
    if (ctx.user.plot.house === 1) {
        ctx.reply(`🏠 Дом ${ctx.user.plot.wh}ур:`)
        // ctx.reply(`🏠 Дом ${ctx.user.plot.wh}ур:`, null, craft.house)
    }
    return 
}

plot.temple = (ctx) => {
    if (ctx.user.plot.temple === 0) {
        ctx.reply(`⛪️ Храм позволит вам получать Эффекты за подношения богам\n⚒ На его строительство требуется:`)
    }
    return 
}

plot.wh = (ctx) => {
    if (ctx.user.plot.wh === 0) {
        ctx.reply(`🏚 Склад позволит вам увеличить место в хранилище\n⚒ На его строительство требуется:\n${resCheck(ctx, 'ore', 1500)}\n︎${resCheck(ctx, 'sand', 2000)}\n︎${resCheck(ctx, 'wood', 7000)}`, null, build.wh)
    } else
    if (ctx.user.plot.wh === 1) {
        ctx.reply(`🏚 Склад ${ctx.user.plot.wh}ур:\nВес Увеличен на ${20000*ctx.user.plot.wh}`)
    }
    return 
}

plot.well = (ctx) => {
    if (ctx.user.plot.well === 0) {
        ctx.reply(`🕳 Колодец позволит вам\n получать Эффект Восстановление Энергии\n⚒ На а его строительство требуется:\n${resCheck(ctx, 'ore', 3000)}\n${resCheck(ctx, 'rareOre', 1)}`, null, build.well)
    }else 
    if (ctx.user.buffs.energyWell >= ctx.timestamp) {
        ctx.reply(`🕳 Колодец: \n Заряжен и вы получаете +1 к регенерации Энергии ⚡`)
    } else {
        ctx.reply(`🕳 Колодец: \n Для получения ${lang.energyWell} вам нужно бросить в колодец ${lang.energyPotion}`, null, trowPotionWell)
    }
    return 
}

const build = {}

build.well = Markup.keyboard(
        [
            Markup.button('Построить', 'secondary', 'build.well'),
        ],
).inline()

build.wh = Markup.keyboard(
        [
            Markup.button('Построить', 'secondary', 'build.wh'),
        ],
).inline()

build.house = Markup.keyboard(
        [
            Markup.button('Построить', 'secondary', 'build.house'),
        ],
).inline()

build.plotLv1 = Markup.keyboard(
        [
            Markup.button('Улучшить участок до Среднего', 'default', 'plot.build.Lv1'),
        ]
).inline()

build.plotLv2 = Markup.keyboard(
        [
            Markup.button('Улучшить участок до Большого', 'default', 'plot.build.Lv2'),
        ]
).inline()

const trowPotionWell = Markup.keyboard([
        [
            Markup.button('Бросить', 'secondary', 'trow.potion.well'),
        ],
]).inline()

const craft = {}

craft.house = Markup.keyboard([
        [
            Markup.button('Создать', 'secondary', 'craft.att'),
        ],
        [
            Markup.button('Меч', 'secondary', 'craft.sword'),
            Markup.button('Жезл', 'secondary', 'craft.wand'),
            Markup.button('Лук', 'secondary', 'craft.bow'),
        ],
        [
            Markup.button(lang.back, 'negative', 'menu'),
        ]
])

module.exports = { plot }