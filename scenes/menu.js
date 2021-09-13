const Markup = require('node-vk-bot-api/lib/markup')
const Scene = require('node-vk-bot-api/lib/scene')

const fs = require('fs')
let lang = JSON.parse(fs.readFileSync(`./lang/ru.json`, 'utf-8'))

const menu = new Scene('menu',
    async (ctx) => {
    },

    async (ctx) => {
        ctx.reply('Укажите какой ник вы хотите')
        await ctx.scene.next()
    },

    async (ctx) => {
            let badwords = JSON.parse(fs.readFileSync(`./lang/badwords.json`, 'utf-8'))
            ctx.session.nick = ctx.message.text
            let tek = ctx.session.nick
            for (i = 0; i < badwords.length; i++){
                if (tek === badwords[i]) {
                    tek = undefined
                }
            }
            let regex1 = /^[a-zA-Zа-яА-Я ]+$/
            if (!regex1.test(tek) || tek === undefined || ctx.session.nick.length >= 14) { 
                await ctx.reply('Некорректный ник нейм') 
                await ctx.scene.enter('menu')
                return
            }
            await ctx.reply(`Вы уверенны что хотите сменить ник на ${tek} это обойдется вам в 10000 ${lang.curr}`, null, Markup
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
            await ctx.user.set('f_name', ctx.session.nick)
            await ctx.user.dec('balance', 10000)
            await ctx.bank.inc('balance', 10000)
                
            await ctx.scene.enter('menu')
            return
        }
    },

    async (ctx) => {

        await ctx.scene.leave()
        await ctx.reply(`${lang.test} ${ctx.message.text}`)
        await ctx.scene.enter('menu')
    },
)

module.exports = {menu}
