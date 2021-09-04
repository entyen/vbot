const Markup = require('node-vk-bot-api/lib/markup')
const Scene = require('node-vk-bot-api/lib/scene')

const fs = require('fs')
let lang = JSON.parse(fs.readFileSync(`./lang/ru.json`, 'utf-8'))


const menu = new Scene('menu',
    async (ctx) => {
        if (ctx.user.acclvl >= 4) {
            await ctx.reply(lang[1], null, Markup
                .keyboard([
                    [
                        Markup.button(lang[8], 'primary'),
                        Markup.button(lang[32], 'primary'),
                    ],
                    [
                        Markup.button(ctx.user.f_name, 'secondary'),
                        Markup.button(lang[3], 'positive'),
                        Markup.button(`${ctx.user.balance} ${lang[5]}`, 'secondary'),
                    ],
                    [
                        Markup.button(`${lang[29]}`, 'secondary'),
                        Markup.button({ action: { type: 'callback', label: 'Hui', payload: JSON.stringify({cmd: 'help'})},color: 'default',}),
                    ],
                ])
            )
        } else {
            await ctx.reply(lang[1], null, Markup
                .keyboard([
                    [
                        Markup.button(lang[8], 'primary'),
                        Markup.button(lang[32], 'primary'),
                    ],
                    [
                        Markup.button(ctx.user.f_name, 'secondary'),
                        Markup.button(lang[3], 'positive'),
                        Markup.button(`${ctx.user.balance} ${lang[5]}`, 'secondary'),
                    ],
                    [
                        Markup.button(`${lang[29]}`, 'secondary'),
                    ],
                ])
            )
        }
        await ctx.scene.leave()
    },

    async (ctx) => {
        ctx.reply('Укажите какой ник вы хотите')
        await ctx.scene.next()
    },

    async (ctx) => {
            ctx.session.nick = ctx.message.text
            const tek = ctx.session.nick
            let regex1 = /^[a-zA-Z ]+$/
            if (!regex1.test(tek) || tek === undefined || ctx.session.nick.length >= 14) { 
                await ctx.reply('Некорректный ник нейм') 
                await ctx.scene.enter('menu')
                return
            }
            await ctx.reply(`Вы уверенны что хотите сменить ник на ${tek} это обойдется вам в 10000 ${lang[5]}`, null, Markup
                .keyboard([
                [
                    Markup.button(`Да`, 'default'),
                    Markup.button(`Нет`, 'default'),
                ],
                ])
            )
            await ctx.scene.next()
    },

    async (ctx) => {
        if(ctx.cmd === 'Нет') { 
            await ctx.reply('Отмена')
            await ctx.scene.enter('menu')
            return
        } else
        if(ctx.cmd === 'Да') {
            if (ctx.user.balance < 10000) {
                await ctx.reply('Недостаточно средств')
                await ctx.scene.enter('menu')
                return
            }
            ctx.reply('Ник Изменен')
            ctx.user.f_name = ctx.session.nick
            ctx.user.balance = ctx.user.balance - 10000
            await ctx.user.save()
                
            await ctx.scene.enter('menu')
            return
        }
    },

    async (ctx) => {

        await ctx.scene.leave()
        await ctx.reply(`${lang[6]} ${ctx.message.text}`)
        await ctx.scene.enter('menu')
    },
)

module.exports = {menu}
