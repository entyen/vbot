const Markup = require('node-vk-bot-api/lib/markup')
const fs = require('fs')
let lang = JSON.parse(fs.readFileSync(`./lang/ru.json`, 'utf-8'))

const market = {}

market.main = (ctx) => {
    return ctx.reply(`Куда вы направляетесь?`, null, Markup
        .keyboard([
            [
                Markup.button('Продать материалы', 'primary', 'market.sell.ore'),
                Markup.button('Купить предметы', 'primary', 'market.buy.items'),
            ],
            [
                Markup.button('Аукцион', 'primary', 'market.auction.items'),

            ],
            [
                Markup.button(lang.back, 'negative', 'menu'),
            ]
        ])
    )
}

market.buyItems = (ctx) => {
    return ctx.reply(`Что вы хотели-бы купить?`, null, Markup
        .keyboard([
            [
                Markup.button('Удочка', 'primary', 'fishingRod'),
                Markup.button('Наживка', 'primary', 'bait'),
            ],
            [
                Markup.button('Зелье Энергии', 'primary', 'energyPotion'),
            ],
            [
                Markup.button(lang.back, 'negative', lang.market),
            ]
        ])
    )
}

market.auction = (ctx) => {
    return ctx.reply(`Что вы хотели-бы купить?`, null, Markup
        .keyboard([
            [
                Markup.button('Редкая Руда', 'primary', 'auction.rareOre'),
                Markup.button('Редкие Травы', 'primary', 'auction.rareHerb'),
            ],
            [
                Markup.button('Редкая Рыба', 'primary', 'auction.rareFish'),
            ],
            [
                Markup.button(lang.back, 'negative', lang.market),
            ]
        ])
    )
}

market.auctionMsg = (ctx, type) => {
    return ctx.reply(`${lang[type]}\n На складе ${ctx.bank.inv[type]}\nЦена покупки ${ctx.bank.dpi[type]}${lang.curr}\nЦена продажи ${ctx.bank.dpi[type]*0.8}${lang.curr}.`, null, Markup
        .keyboard(
            [
                Markup.button('Купить', 'default', `${ctx.cmd}.buy`),
                Markup.button('Продать', 'default', `${ctx.cmd}.sell`),
            ],
        )
        .inline()
    )
}

market.auctionBuy = async(ctx, type) => {
    if (ctx.bank.inv[type] <= 0) {return ctx.reply('Недостаточно ресурса в Банке')}
    if (ctx.user.balance < ctx.bank.dpi[type]) {return ctx.reply('Недостаточно средств')}
        await ctx.user.dec('balance', ctx.bank.dpi[type])
        await ctx.user.inc('inv', 1, type)
        await ctx.bank.dec('inv', 1, type)
        await ctx.reply(`Вы успешно приобрели ${lang[type]} за ${ctx.bank.dpi[type]} ${lang.curr}`)
        return
}

market.auctionSell = async(ctx, type, max) => {
    if (ctx.bank.inv[type] >= max) {return ctx.reply('Ресурса в банке достаточно')}
    if (ctx.user.inv[type] <= 0) {return ctx.reply(`Недостаточно ${lang[type]}`)}
        await ctx.user.inc('balance', ctx.bank.dpi[type]*0.8)
        await ctx.user.dec('inv', 1, type)
        await ctx.bank.inc('inv', 1, type)
        await ctx.reply(`Вы успешно продали ${lang[type]} за ${ctx.bank.dpi[type]*0.8}`)
        return
}

module.exports = { market }