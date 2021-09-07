const Markup = require('node-vk-bot-api/lib/markup')
const Scene = require('node-vk-bot-api/lib/scene')

const fs = require('fs')
let lang = JSON.parse(fs.readFileSync(`./lang/ru.json`, 'utf-8'))

const market = new Scene('market',
    async (ctx) => {
        ctx.reply(`Что вы хотели-бы продать?`, null, Markup
            .keyboard([
                [
                    Markup.button(lang[33], 'primary'),
                    Markup.button(lang[34], 'primary'),
                ],
                [
                    Markup.button(lang[35], 'primary'),
                    Markup.button(lang[36], 'primary'),
                ],
                [
                    Markup.button(lang[23], 'negative'),
                ]
            ])
        )
        ctx.scene.next()
    },
    async (ctx) => {
        ctx.session.item = ctx.cmd
        ctx.session.itemMaxCount = ctx.session.item === lang[33] ? ctx.user.inv.herbs : ctx.session.item === lang[34] ? ctx.user.inv.ore : ctx.session.item === lang[35] ? ctx.user.inv.sand : ctx.session.item === lang[36] && ctx.user.inv.wood
        if (ctx.cmd === lang[23] || ctx.cmd === undefined) {
            await ctx.scene.leave()
            await ctx.scene.enter('menu')
        } else {
            ctx.reply(`Сколько ${ctx.cmd} вы хотите продать? Вы так-же можете ввести кол-во вручную`, null, Markup
                .keyboard([
                    100,
                    500,
                    1000,
                    lang[38]
                ])
                .inline()
            )
            ctx.scene.next()
        }
    },
    async (ctx) => {
        ctx.session.count = ctx.cmd === lang[38] ? ctx.session.itemMaxCount : +ctx.message.text
        if (!Number.isInteger(ctx.session.count)) {
            return ctx.scene.enter('market')
        } else {
            if (ctx.session.item === lang[33]) {
                if (ctx.user.inv.herbs < ctx.session.count) {
                    await ctx.reply(`Недостаточно ${ctx.session.item}`)
                    await ctx.scene.enter('menu')
                } else {
                    ctx.bank.inv.herbs = ctx.bank.inv.herbs + ctx.session.count
                    ctx.bank.balance = ctx.bank.balance - ctx.session.count
                    await ctx.bank.save()
                    ctx.user.inv.herbs = ctx.user.inv.herbs - ctx.session.count
                    ctx.user.balance = ctx.user.balance + ctx.session.count
                    await ctx.user.save()
                    await ctx.reply(`Вы продали ${ctx.session.count} ${ctx.session.item} и выручили ${ctx.session.count} ${lang[5]}`)
                    await ctx.scene.enter('menu')
                }
            }
            if (ctx.session.item === lang[34]) {
                if (ctx.user.inv.ore < ctx.session.count) {
                    await ctx.reply(`Недостаточно ${ctx.session.item}`)
                    await ctx.scene.enter('menu')
                } else {
                    ctx.bank.inv.ore = ctx.bank.inv.ore + ctx.session.count
                    ctx.bank.balance = ctx.bank.balance - ctx.session.count
                    await ctx.bank.save()
                    ctx.user.inv.ore = ctx.user.inv.ore - ctx.session.count
                    ctx.user.balance = ctx.user.balance + ctx.session.count
                    await ctx.user.save()
                    await ctx.reply(`Вы продали ${ctx.session.count} ${ctx.session.item} и выручили ${ctx.session.count} ${lang[5]}`)
                    await ctx.scene.enter('menu')
                }
            }
            if (ctx.session.item === lang[35]) {
                if (ctx.user.inv.sand < ctx.session.count) {
                    await ctx.reply(`Недостаточно ${ctx.session.item}`)
                    await ctx.scene.enter('menu')
                } else {
                    ctx.bank.inv.sand = ctx.bank.inv.sand + ctx.session.count
                    ctx.bank.balance = ctx.bank.balance - ctx.session.count
                    await ctx.bank.save()
                    ctx.user.inv.sand = ctx.user.inv.sand - ctx.session.count
                    ctx.user.balance = ctx.user.balance + ctx.session.count
                    await ctx.user.save()
                    await ctx.reply(`Вы продали ${ctx.session.count} ${ctx.session.item} и выручили ${ctx.session.count} ${lang[5]}`)
                    await ctx.scene.enter('menu')
                }
            }
            if (ctx.session.item === lang[36]) {
                if (ctx.user.inv.wood < ctx.session.count) {
                    await ctx.reply(`Недостаточно ${ctx.session.item}`)
                    await ctx.scene.enter('menu')
                } else {
                    ctx.bank.inv.wood = ctx.bank.inv.wood + ctx.session.count
                    ctx.bank.balance = ctx.bank.balance - ctx.session.count
                    await ctx.bank.save()
                    ctx.user.inv.wood = ctx.user.inv.wood - ctx.session.count
                    ctx.user.balance = ctx.user.balance + ctx.session.count
                    await ctx.user.save()
                    await ctx.reply(`Вы продали ${ctx.session.count} ${ctx.session.item} и выручили ${ctx.session.count} ${lang[5]}`)
                    await ctx.scene.enter('menu')
                }
            }
        }

        ctx.scene.enter('menu')
    }
)

module.exports = {market}
