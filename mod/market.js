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
                Markup.button('Биржа Дварфов', 'primary', 'exchange'),
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
                Markup.button('Желудь', 'primary', 'auction.rareWood'),
                Markup.button('Артефакт', 'primary', 'auction.rareSand'),
            ],
            [
                Markup.button('Редкая Руда', 'primary', 'auction.rareOre'),
                Markup.button('Редкие Травы', 'primary', 'auction.rareHerb'),
                Markup.button('Редкая Рыба', 'primary', 'auction.rareFish'),
            ],
            [
                Markup.button(lang.back, 'negative', lang.market),
            ]
        ])
    )
}


market.exchangeMsg = (ctx, type) => {
    ctx.reply(`${lang[type]}\nЦена покупки ${(ctx.bank.dpi[type]).toFixed(2)}${lang.curr}\nЦена продажи ${(ctx.bank.dpi[type]*0.995).toFixed(2)}${lang.curr}\n
    У вас ${ctx.user.inv[type]}${lang[type]} это ${Math.round(ctx.user.inv[type]*(ctx.bank.dpi[type]*0.995).toFixed(2))}${lang.curr}`, null, Markup
        .keyboard([
            [
                Markup.button('Обновить цену', 'positive', `${ctx.cmd}`),
            ],
            [
                Markup.button('Купить 100', 'default', `${ctx.cmd}.buy.100`),
                Markup.button('Продать 100', 'default', `${ctx.cmd}.sell.100`),
            ],
            [
                Markup.button('Купить 1k', 'default', `${ctx.cmd}.buy.1000`),
                Markup.button('Продать 1k', 'default', `${ctx.cmd}.sell.1000`),
            ],
            [
                Markup.button(lang.back, 'negative', lang.market),
            ]
        ])
    )
}

market.exchangeBuy = async(ctx, type, count) => {
    if (ctx.user.balance < ctx.bank.dpi[type] * count) {return ctx.reply('Недостаточно средств')}
        await ctx.user.dec('balance', (ctx.bank.dpi[type]*count).toFixed(2))
        await ctx.user.inc('inv', count, type)
        await ctx.reply(`Вы успешно приобрели ${count} ${lang[type]} за ${(ctx.bank.dpi[type]*count).toFixed(2)} ${lang.curr}`)
        return
}

market.exchangeSell = async(ctx, type, count) => {
    if (ctx.user.inv[type] < count) {return ctx.reply(`Недостаточно ${lang[type]}`)}
        await ctx.user.inc('balance', ((ctx.bank.dpi[type]*0.995)*count).toFixed(2))
        await ctx.user.dec('inv', count, type)
        await ctx.reply(`Вы успешно продали ${count} ${lang[type]} за ${((ctx.bank.dpi[type]*0.995)*count).toFixed(2)}`)
        return
}

market.auctionMsg = (ctx, type, max) => {
    return ctx.reply(`[${lang[type]}]\n📦 На складе: ${ctx.bank.inv[type]} из ${max}\n📥 Цена покупки: ${ctx.bank.dpi[type]}${lang.curr}\n📤 Цена продажи: ${ctx.bank.dpi[type]*0.8}${lang.curr}.`, null, Markup
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
    if (ctx.user.balance < ctx.bank.dpi[type]) {return ctx.reply('Недостаточно средств')}
    if (ctx.bank.inv[type] <= 0) {return ctx.reply('Недостаточно ресурса в Банке')}
        await ctx.user.dec('balance', ctx.bank.dpi[type])
        await ctx.user.inc('inv', 1, type)
        await ctx.bank.dec('inv', 1, type)
        await ctx.reply(`Вы успешно приобрели ${lang[type]} за ${ctx.bank.dpi[type]} ${lang.curr}`)
        return
}

market.auctionSell = async(ctx, type, max) => {
    if (ctx.user.inv[type] <= 0) {return ctx.reply(`Недостаточно ${lang[type]}`)}
    if (ctx.bank.inv[type] >= max) {return ctx.reply('Ресурса в банке достаточно')}
        await ctx.user.inc('balance', ctx.bank.dpi[type]*0.8)
        await ctx.user.dec('inv', 1, type)
        await ctx.bank.inc('inv', 1, type)
        await ctx.reply(`Вы успешно продали ${lang[type]} за ${ctx.bank.dpi[type]*0.8}`)
        return
}


const marketSell = async (count, item, eachPrice) => {
    count === 'all' ? count = +ctx.user.inv[item] : count = +ctx.cmd.split('.')[2]
    item = ctx.cmd.split('.')[0]
    if (ctx.user.inv[item] < count || count === 0) {
        await ctx.reply(`Недостаточно ${lang[item]}`)
    } else {
        let summ = 0
        eachPrice ? summ = count * eachPrice : summ = count
        summ = Math.round(summ)
        await ctx.bank.inc('inv', count , item)
        await ctx.bank.dec('balance', summ)
        await ctx.user.dec('inv', count , item)
        await ctx.user.inc('balance', summ)
        await ctx.reply(`Вы продали ${count} ${lang[item]} и выручили ${summ} ${lang.curr}`)
    }
}

module.exports = { market }